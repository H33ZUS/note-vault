const express = require("express");
var NoteFile = require("../models/noteFile.js");
var Subject = require("../models/subject.js");

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
        const noteFile = await NoteFile.find({subjectId: subjectId});
        res.json(noteFile);
    } catch (err) {
        res.status(404).json({error: err.message});
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
        res.status(404).json({error: err.message});
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
        res.status(404).json({error: err.message});
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
        res.status(404).json({error: err.message});
    }
});

module.exports = router;