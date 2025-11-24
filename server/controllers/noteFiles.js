const express = require("express");
const NoteFile = require("../models/noteFile.js");
const Subject = require("../models/subject.js");

const router = express.Router({mergeParams: true}); // to access parents parameters

// ensure that noteFiles cannot exist outisde of a subject
router.post("/", async(req, res) => {

    const subjectId = req.params.subjectId;

    try {
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({error: "Subject not found"});
        }

        const noteFile = new NoteFile({...req.body, subjectId: subjectId});
        await noteFile.save();
        res.status(201).json(noteFile);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

router.get("/", async(req, res) => {

    const subjectId = req.params.subjectId;

    try {
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({error: "Subject not found"});
        }
        const noteFile = await NoteFile.find({subjectId: subjectId});
        res.json(noteFile);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

router.get("/:noteFileId", async(req, res) => {

    const {subjectId, noteFileId} = req.params;

    try {
        const noteFile = await NoteFile.findById({_id: noteFileId, subjectId: subjectId});

        if (!noteFile) {
            return res.status(404).json({error: "NoteFile not found or does not belong to the specified Subject"});
        }
        res.json(noteFile);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

router.patch("/:noteFileId", async(req, res) => {

    const {subjectId, noteFileId} = req.params;

    try {
        const noteFile = await NoteFile.findByIdAndUpdate({_id: noteFileId, subjectId: subjectId}, req.body, {new: true});

        if (!noteFile) {
            return res.status(404).json({error: "NoteFile not found or does not belong to the specified Subject"});
        }
        res.json(noteFile);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

router.put("/:noteFileId", async(req, res) => {

    const {subjectId, noteFileId} = req.params;

    try {
    
        const requiredFields = ["updatedAt", "notes"];
        const missing = requiredFields.filter(f => !(f in req.body));

        if (missing.length > 0) {
            return res.status(400).json({error: `PUT requires all fields: Missing ${missing.join(", ")}`});
        }

        const updated = await Subject.findByIdAndUpdate({_id: noteFileId, subjectId: subjectId}, {$set: req.body}, {new: true, runValidators: true});

        if (!updated) {
            return res.status(404).json({error: "NoteFile not found"})
        }
        res.json(updated);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

router.delete("/:noteFileId", async(req, res) => {

    const {subjectId, noteFileId} = req.params;

    try {
        const noteFile = await NoteFile.findByIdAndDelete({_id: noteFileId, subjectId: subjectId});

        if (!noteFile) {
            return res.status(404).json({error: "NoteFile not found or does not belong to the specified Subject"});
        }
        res.status(204).send();
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

// Delete all
router.delete("/", async(req, res) => {
     try {
        const noteFiles = await NoteFile.deleteMany({});
        res.status(204).send();
    } catch (err) {
        res.status(400).json({error: err.message});
    }
})

module.exports = router;