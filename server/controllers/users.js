const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_testing';
const { isAuthenticated, isAuthorized } = require("../middleware/auth");
const { validateResponse } = require("../middleware/responseValidator");
const { validateRequest } = require("../middleware/requestValidator");
const val = require("../validations/userValidation");
const User = require("../models/user");
const compareArrays = require("../utils/misc");

const router = express.Router();

// CREATE A USER
router.post("/", validateRequest(val.userCreateRequestSchema), async(req, res, next) => {
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
        
        delete userObj.password;
        delete userObj.__v;

        if (userObj._id) {
            userObj._id = userObj._id.toString();
        }

        res.locals.data = userObj;
        next();
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
}, validateResponse(val.userCreateResponseSchema), (req, res) => {
    res.status(201).json(res.locals.data);
});

// USER LOGIN
router.post("/login", validateRequest(val.userLoginRequestSchema), async(req, res) => {
    const { username, password } = req.body

    try {
        const user = await User.findOne({ username: username }); 
                
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                const payload = {
                    userId: user._id,
                    roles: user.roles
                };

                console.log(JWT_SECRET);

                const token = jwt.sign(
                    payload, 
                    JWT_SECRET,
                    { expiresIn: '12h' }
                );

                res.cookie("auth_token", token, {
                    httpOnly: true,
                    secure: req.app.get("env") === "production",
                    sameSite: "Lax"
                })

                return res.status(200).json({
                    message: "Login successful"
                });
            } else {
                return res.status(401).json({error: "Invalid username or password"});
            }
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
router.patch("/:id/roles", isAuthenticated, isAuthorized("admin"), validateRequest(val.userUpdateRoleRequestSchema) ,async (req, res) => {
    const { roles: newRoles } = req.body;
    const user = req.params.id

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
router.patch("/", isAuthenticated, validateRequest(val.userPatchRequestSchema), async(req, res, next) => {
    const { roles, ...updateData } = req.body;
    const userId = req.user._id
    
    try {
        const user = await User.findByIdAndUpdate(userId, updateData, {new: true, runValidators: true, select: "-password -__v"});

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        const userObj = user.toObject();

        if (userObj._id) {
            userObj._id = userObj._id.toString();
        }

        res.locals.data = userObj;
        next();
    } catch (err) {
        res.status(400).send(err.message);
    }
}, validateResponse(val.userResponseSchema), (req, res) => {
    res.status(200).json(res.locals.data);
});

// UPDATE EVERYTHING OF A USER
router.put("/", isAuthenticated, validateRequest(val.userPutRequestSchema), async(req, res, next) => {
    const { roles, ...updateData } = req.body;
    const userId = req.user._id

    try {
        const user = await User.findOneAndReplace({ _id: userId }, updateData, { new: true, runValidators: true, select: "-password -__v" });

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        const userObj = user.toObject();

        if (userObj._id) {
            userObj._id = userObj._id.toString();
        }

        res.locals.data = userObj;
        next();
    } catch (err) {
        res.status(400).json({message: err.message});
    }
}, validateResponse(val.userResponseSchema), (req, res) => {
    res.status(200).json(res.locals.data);
});

// GET ALL USERS
router.get("/ids", async(req, res, next) => {
    try {
        const users = await User.find().select("-password -__v");

        if (!users) {
            return res.status(404).json({ message: "No users found"});
        }

        const finalData = users.map(user => {
            const userObj = user.toObject();

            if (userObj._id) {
                userObj._id = userObj._id.toString();
            }

            return userObj
        });

        res.locals.data = finalData;
        next();
    } catch (err) {
        res.status(404).json({error: err.message});
    }
}, validateResponse(val.userArrayResponseSchema), (req, res) => {
    res.status(200).json(res.locals.data);
});

// GET ONE USER
router.get("/", isAuthenticated, async(req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password -__v");

        if (user == null) {
            return res.status(404).json({message: "User not found"});
        }

        const finalData = user.toObject();

        if (finalData._id) {
            finalData._id = finalData._id.toString();
        }

        res.locals.data = finalData;

        next();
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(500).json({ error: err.message });
    }
}, validateResponse(val.userResponseSchema), (req, res) => {
    res.status(200).json(res.locals.data);
});

module.exports = router;