const express = require("express");
var Subject = require("../models/subject.js");
var NoteFile = require("../models/noteFile.js");

const router = express.Router();

router.post("/", async(req, res) => {

    try {
        const subject = new Subject(req.body);
        await subject.save();

        const defaultNoteFile = new NoteFile({ // noteFile created when subject is created
            title: `Untitled Note for ${subject.name || subject._id}`,
            subjectId: subject._id
        });
        await defaultNoteFile.save();
        res.status(201).json({subject: subject, defaultNoteFile: defaultNoteFile}); // created
    } catch (err) {
        res.status(400).json({error: err.message}); // bad request
    }
});

// get all
router.get("/", async(req, res) => {
    try {
        const subjects = await Subject.find();
        res.json(subjects); 
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// get one
router.get("/:id", async(req, res) => {
    try {
        const subjects = await Subject.findById(req.params.id);
        res.json(subjects);
    } catch {
        res.status(404).send("Not found");
    }
});

router.patch("/:id", async(req, res) => {
    try {
        const subjects = await Subject.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json(subjects)  
    } catch {
        res.status(404).send("Not found");
    }
});

router.delete("/:id", async(req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id)
        res.status(204).send();
    } catch {
        res.status(404).send("Not Found");
    }
});

module.exports = router;