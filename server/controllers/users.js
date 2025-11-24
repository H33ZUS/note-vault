const express = require("express");
const isAuthenticated = require("../middleware/auth");
const User = require("../models/user");

const router = express.Router();

// CREATE A USER
router.post("/", async(req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
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

// DELETE ALL USERS
router.delete("/", isAuthenticated, async(req, res) => {
    try {
        var result = await User.deleteMany({})
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

// DELETE ONE USER
router.delete("/:username/", isAuthenticated, async(req, res) => {
    try {
        var user = await User.findOneAndDelete({username: req.params.username});

        if (user == null) {
            return res.status(404).json({message: "User not found"})
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

// UPDATE ONE VARIABLE OF A USER
router.patch("/:id", isAuthenticated, async(req, res) => {
    if (req.session.userId.toString() !== req.params.id) {
        return res.status(403).json({message: "You are not authorized to update another user"})
    }
    
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

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
    if (req.session.userId.toString() !== req.params.id) {
        return res.status(403).json({message: "You are not authorized to update another user"})
    }

    try {
        const user = await User.findOneAndReplace({_id: req.params.id}, req.body, {new: true, runValidators: true});

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
        res.json(user); 
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

module.exports = router;