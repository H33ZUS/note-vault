const express = require("express");
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
            res.status(200).json({
                message: "Login successful",
                user: user
            });
        } else {
            res.status(401).json({error: "Invalid username or password"});
        }
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

router.delete("/:username/", async(req, res) => {
    try {
        var user = await User.findOneAndDelete({username: req.params.username});
        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({error: err.message})
    }
});

module.exports = router;