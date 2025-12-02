const express = require("express");
const bcrypt = require("bcrypt");
const { isAuthenticated, isAuthorized } = require("../middleware/auth");
const User = require("../models/user");
const compareArrays = require("../utils/misc");

const router = express.Router();

// CREATE A USER
router.post("/", async(req, res) => {
    try {
        const { password, ...userData } = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User({
            ...userData,
            password: hashedPassword
        });
        await user.save();

        const userObj = user.toObject();

        userObj.links = [
            {rel : "self", method : "GET", href : `/api/users/`},
            {rel : "update", method : "PUT", href : `/api/users/`},
            {rel : "partial-update", method : "PATCH", href : `/api/users/`},
            {rel : "delete", method : "DELETE", href : `/api/users/`},
            {rel : "all-users", method : "GET", href : "/api/users/ids"},
        ]

        res.status(201).json(userObj);
    } catch (err) {
        if (err.code === 11000) {
            let field = "Field";
            if (err.message.includes("email")) {
                field = "Email";
            } else if (err.message.includes("username")) {
                field = "Username";
            }

            return res.status(409).json({error: `${field} already registered`});
        }

        res.status(400).json({error: err.message});
    }
});

// USER LOGIN
router.post("/login", async(req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({error: "Missing required fields: username and password are required for login."});
    }
    try {
        const user = await User.findOne({ username: username });   

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                const userId = user._id;

                res.cookie("auth_token", userId.toString(), {
                    maxAge: 1000 * 60 * 60 * 24,
                    httpOnly: true,
                    secure: req.app.get("env") === "production",
                    sameSite: "Lax"
                })

                return res.status(200).json({
                    message: "Login successful",
                    user: {
                        _id: user._id,
                        username: user.username,
                        roles: user.roles
                    }
                });
            }
        } else {
            res.status(401).json({error: "Invalid username or password"});
        }
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

// USER LOGOUT
router.post("/logout", isAuthenticated, (req, res) => {
    res.clearCookie("auth_token");
    return res.status(200).json({message: "Logout successful"})
});

// CHANGE ROLE OF A USER (FOR ADMINS ONLY)
router.patch("/:id/roles", isAuthenticated, isAuthorized("admin"), async (req, res) => {
    const { roles: newRoles } = req.body;
    const user = req.params.id

    if (!Array.isArray(newRoles) || newRoles.some(r => !["student", "teacher", "admin"].includes(r))) {
        return res.status(400).json({ message: "Invalid role array provided. Rules must be 'student', 'admin' or 'teacher'."})
    }

    try {
        const targetUser = await User.findById(user);

        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found"});
        }

        if (req.user._id.toString() === req.params.id.toString()) {
            if (targetUser.roles.includes("admin") && !newRoles.includes("admin")) {
                return res.status(403).json({ message: "You cannot revoke admin role if you are an admin"});
            }

            if (compareArrays(targetUser.roles, newRoles)) {
                return res.status(400).json({ message: "You did not specify new roles to be updated"});
            }
        }

        if (targetUser.roles.includes("admin")) {
            return res.status(403).json({ message: "Cannot change the role of another admin user"});
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { roles: newRoles } }, { new: true, runValidators: true, select: "username roles email"});

        res.status(200).json({ message: `User ${updatedUser.username} roles updated.`, roles: updatedUser.roles });
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

// DELETE ALL USERS
router.delete("/ids", isAuthenticated, isAuthorized("admin"), async(req, res) => {
    try {
        const users = await User.find({});

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "There exists no users" });
        }

        let deletedCount = 0;

        for (const user of users) {
            await user.deleteOne();
            deletedCount++;
        }

        res.status(200).json({ message: `${deletedCount} users deleted successfully.` });
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

// DELETE ONE USER
router.delete("/", isAuthenticated, async(req, res) => {
    const user = req.user._id

    try {
        const result = await User.deleteOne({ _id: user });

        if (result.deletedCount === 0) {
            return res.status(404).json("User not found");
        }

        res.clearCookie("auth_token");

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

// UPDATE ONE VARIABLE OF A USER
router.patch("/", isAuthenticated, async(req, res) => {
    const { roles, ...updateData } = req.body;
    const userId = req.user._id
    
    try {
        const user = await User.findByIdAndUpdate(userId, updateData, {new: true, runValidators: true, select: "-password"});

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.json(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// UPDATE EVERYTHING OF A USER
router.put("/", isAuthenticated, async(req, res) => {
    const { roles, ...updateData } = req.body;
    const userId = req.user._id

    try {
        const user = await User.findOneAndReplace({ _id: userId }, updateData, { new: true, runValidators: true, select: "-password" });

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.json(user);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
});

// GET ALL USERS
router.get("/ids", async(req, res) => {
    try {
        const user = await User.find();
        res.json(user); 
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

// GET ONE USER
router.get("/", isAuthenticated, async(req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user == null) {
            return res.status(404).json({message: "User not found"});
        }
        res.json(user); 
    } catch (err) {
        console.log(req.user)
        console.log(req.user._id)
        res.status(404).json({error: err.message});
    }
});

module.exports = router;