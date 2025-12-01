const express = require("express");
const { isAuthenticated, isAuthorized } = require("../middleware/auth");
const User = require("../models/user");
const compareArrays = require("../utils/misc");

const router = express.Router();

// CREATE A USER
router.post("/", async(req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        const userObj = user.toObject();

        userObj.links = [
            {rel : "self", method : "GET", href : `/api/users/${user._id}`},
            {rel : "update", method : "PUT", href : `/api/users/${user._id}`},
            {rel : "partial-update", method : "PATCH", href : `/api/users/${user._id}`},
            {rel : "delete", method : "DELETE", href : `/api/users/${user._id}`},
            {rel : "all-users", method : "GET", href : "/api/users"},
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
        const user = await User.findOne({ // Checks if user is existent
            username: username,
            password: password,
        });   

        if (user) {
            req.session.userId = user._id; // Checks if the session id is the same as the user id

            req.session.save(err => {
                if (err) {
                    return res.status(500).json({error: "Failed creating session"});
                }

                return res.status(200).json({
                    message: "Login successful",
                    user: user
                });
            })
            
        } else {
            res.status(401).json({error: "Invalid username or password"});
        }
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

// USER LOGOUT
router.post("/logout", isAuthenticated, (req, res) => {
    req.session.destroy(err => { // destroys the current session for the user
        if (err) {
            return res.status(500).json({message: "Unable to log out"})
        } else {
            res.clearCookie("connect.sid");
            return res.json({message: "Logout successful"})
        }
    });
});

// CHANGE ROLE OF A USER (FOR ADMINS ONLY)
router.patch("/:id/role", isAuthenticated, isAuthorized("admin"), async (req, res) => {
    const { roles: newRoles } = req.body;

    if (!Array.isArray(newRoles) || newRoles.some(r => !["student", "teacher", "admin"].includes(r))) {
        return res.status(400).json({ message: "Invalid role array provided. Rules must be 'student', 'admin' or 'teacher'."})
    }

    try {
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found"});
        }

        if (req.session.userId.toString() === req.params.id.toString()) {
            if (targetUser.roles.includes("admin") && !newRoles.includes("admin")) {
                return res.status(403).json({ message: "You cannot revoke admin role if you are an admin"});
            }

            if (compareArrays(targetUser.roles, newRoles)) {
                return res.status(400).json({ message: "You did not specify new roles to be updated"});
            }
        }

        if (targetUser.roles.includes("admin") && req.session.userId.toString() !== req.params.id.toString()) {
            return res.status(403).json({ message: "Cannot change the role of another admin user"});
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { roles: newRoles } }, { new: true, runValidators: true, select: "username roles email"});

        res.status(200).json({ message: `User ${updatedUser.username} roles updated.`, roles: updatedUser.roles });
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

// DELETE ALL USERS
router.delete("/", isAuthenticated, isAuthorized("admin"), async(req, res) => {
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
router.delete("/:id/", isAuthenticated, async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user == null) {
            return res.status(404).json({message: "User not found"})
        }

        const result = await user.deleteOne();

        if (!result) {
            return res.status(500).json({ message: "Unable to delete user" });
        }

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

// UPDATE ONE VARIABLE OF A USER
router.patch("/:id", isAuthenticated, async(req, res) => {
    const { roles, ...updateData } = req.body;

    if (req.session.userId.toString() !== req.params.id) {
        return res.status(403).json({message: "You are not authorized to update another user"})
    }
    
    try {
        const user = await User.findByIdAndUpdate(req.params.id, updateData, {new: true, runValidators: true, select: "-password"});

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.json(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// UPDATE EVERYTHING OF A USER
router.put("/:id", isAuthenticated, async(req, res) => {
    const { roles, ...updateData } = req.body;

    if (req.session.userId.toString() !== req.params.id) {
        return res.status(403).json({message: "You are not authorized to update another user"})
    }

    try {
        const user = await User.findOneAndReplace({ _id: req.params.id }, updateData, { new: true, runValidators: true, select: "-password" });

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.json(user);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
});

// GET ALL USERS
router.get("/", async(req, res) => {
    try {
        const user = await User.find();
        res.json(user); 
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

// GET ONE USER
router.get("/:id", async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user == null) {
            return res.status(404).json({message: "User not found"});
        }
        res.json(user); 
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

module.exports = router;