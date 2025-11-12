const express = require("express");
var Subject = require("../models/subject.js");

const router = express.Router();

router.post("/", async(req, res) => {

    try {
        const subject = new Subject(req.body);
        await subject.save();
        res.status(201).json(subject); // created
    } catch (err) {
        res.status(400).json({error: err.message}); // bad request
    }
});

router.get("/", async(req, res) => {
    try {
        const subjects = await Subject.find();
        res.json(subjects); 
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

module.exports = router;