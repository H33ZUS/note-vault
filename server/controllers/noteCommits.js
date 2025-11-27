const express = require("express");
const NoteCommit = require("../models/noteCommit.js");
const NoteFile = require("../models/noteFile.js")
const isAuthenticated = require("../middleware/auth.js");

const router = express.Router({mergeParams: true}); 

router.post("/noteCommits", async(req, res) => {

    const {noteFileId} = req.params;

    try {
        const noteFile = await NoteFile.findById(noteFileId);
        if (!noteFile) {
            return res.status(404).json({error: "Parent NoteFile not found"});
        }
        const noteCommit = new NoteCommit({...req.body, noteFileId: noteFileId});
        await noteCommit.save();
        res.status(201).json(noteCommit);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

router.get("/noteCommits", async(req, res) => {

    const {noteFileId} = req.params;

    const {sort} = req.query;

    let sortOptions = {};

    if (sort === "likes") {
        sortOptions = {likes: -1}; // highest first
    } else if (sort === "newest") {
        sortOptions = {createdAt: -1};
    } else if (sort === "oldest") {
        sortOptions = {createdAt: 1};
    }

    try {
        const noteCommit = await NoteCommit.find({noteFileId: noteFileId}).sort(sortOptions);
        if (noteCommit.length == 0) {
            return res.status(404).json({error: "No NoteCommits found for this NoteFile"});
        }
        res.json(noteCommit);
    } catch (err) {
        res.status(404).json({error: err.message});
    }
});

// DELETE ONE USER
router.delete("/noteCommits/:id", isAuthenticated, async(req, res) => {
    try {
        var result = await NoteCommit.findByIdAndDelete(req.params.id);

        if (result == null) {
            return res.status(404).json({message: "Note Commit not found"})
        }

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

// use same path for the rest of the operations but with /:commitId 

module.exports = router;