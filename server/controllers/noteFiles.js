const express = require("express");
const NoteFile = require("../models/noteFile.js");
const NoteCommit = require("../models/noteCommit.js");
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

router.get("/:id", async(req, res) => {

    const { id: noteFileId, subjectId } = req.params;

    try {
        const noteFile = await NoteFile.findOne({_id: noteFileId, subjectId: subjectId});

        if (!noteFile) {
            return res.status(404).json({error: "NoteFile not found or does not belong to the specified Subject"});
        }
        res.json(noteFile);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

router.delete("/:id", async(req, res) => {

    const { id: noteFileId, subjectId} = req.params;

    try {
        const noteFile = await NoteFile.findOne({ _id: noteFileId, subjectId: subjectId });

        if (noteFile == null) {
            return res.status(404).json({error: "NoteFile not found or does not belong to the specified Subject"});
        }

        await noteFile.deleteOne();

        res.status(200).json({ message: `Note File deleted successfully.` });
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

// Delete all
router.delete("/", async(req, res) => {
     try {
        const noteFiles = await NoteFile.find({});

        if (!noteFiles || noteFiles.length === 0) {
            return res.status(404).json({ message: "There exists no note files for this subject" });
        }

        let deletedCount = 0;

        for (const noteFile of noteFiles) {
            await noteFile.deleteOne();
            deletedCount++;
        }

        res.status(200).json({ message: `${deletedCount} Note Files deleted successfully.` });
    } catch (err) {
        res.status(400).json({error: err.message});
    }
})

module.exports = router;