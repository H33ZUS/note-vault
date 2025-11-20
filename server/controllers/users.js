const express = require("express");
const isAuthenticated = require("../middleware/auth");
var User = require("../models/user");

const router = express.Router();

router.post("/", async(req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

router.post("/login", async(req, res) => {
    const { username, password } = req.body
    try {
        const user = await User.findOne({
            username: username,
            password: password
        });   

        if (user) {
            req.session.userId = user._id;

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

router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({message: "Unable to log out"})
        } else {
            res.clearCookie("connect.sid");
            return res.json({message: "Logout successful"})
        }
    });
});

router.delete("/:username/", isAuthenticated, async(req, res) => {
    try {
        var user = await User.findOneAndDelete({username: req.params.username});
        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({error: err.message})
    }
});

router.put("/:id", isAuthenticated, async(req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json(user)  
    } catch {
        res.status(404).send("Not found");
    }
});

router.get("/", async(req, res) => {
    try {
        const user = await User.find();
        res.json(user); 
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

router.get("/:id", async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user); 
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

module.exports = router;