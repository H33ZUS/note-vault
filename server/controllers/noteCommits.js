const express = require("express");
var NoteCommit = require("../models/noteCommit.js");

const router = express.Router();

router.post("/", async(req, res) => {
    try {
        const noteCommit = new NoteCommit(req.body);
        await noteCommit.save();
        res.status(201).json(noteCommit);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

router.get("/", async(req, res) => {
    try {
        const noteCommit = await NoteCommit.find();
        res.json();
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

module.exports = router;