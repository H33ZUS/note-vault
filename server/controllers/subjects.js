const express = require("express");
const Subject = require("../models/subject.js");
const NoteFile = require("../models/noteFile.js");

const { isAuthenticated, isAuthorized } = require("../middleware/auth.js");
const router = express.Router();

router.post("/", isAuthenticated, isAuthorized("teacher"), async(req, res) => {

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
        res.status(404).json({error: err.message});
    }
});

// get one
router.get("/:id", async(req, res) => {
    try {
        const subjects = await Subject.findById(req.params.id);
        res.json(subjects);
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

router.patch("/:id", isAuthenticated, isAuthorized("teacher"), async(req, res) => {
    try {
        const subjects = await Subject.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, runValidators: true});
        res.json(subjects);  
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

router.put("/:id", isAuthenticated, isAuthorized("teacher"), async(req, res) => {
    try {
        const requiredFields = ["title", "noteFile", "quizFile"];
        const missing = requiredFields.filter(f => !(f in req.body)); // checks for missing fields in requiredFields

        if (missing.length > 0) {
            return res.status(400).json({error: `PUT requires all fields: Missing: ${missing.join(", ")}`});
        }
        const updated = await Subject.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true, runValidators: true});

        if (!updated) {
            return res.status(404).json({error: "Subject not found"});
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});
    

// WE ALSO NEED TO DELETE THE NOTE FILE WHEN DELETING A SUBJECT
router.delete("/:id", isAuthenticated, isAuthorized("teacher"), async(req, res) => {
    try {
        const result = await Subject.findByIdAndDelete(req.params.id);

        if (result == null) {
            return res.status(404).json({message: "Subject does not exist."});
        }

        res.status(200).send();
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

router.delete("/", isAuthenticated, isAuthorized("teacher"), async(req, res) => {
    try {
        const subjects = await Subject.deleteMany({});
        res.status(204).send();
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

module.exports = router;