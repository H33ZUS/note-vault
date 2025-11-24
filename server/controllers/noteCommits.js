const express = require("express");
const NoteCommit = require("../models/noteCommit.js");
const NoteFile = require("../models/noteFile.js")

const router = express.Router({mergeParams: true}); 

router.post("/noteCommit", async(req, res) => {

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

router.get("/noteCommit", async(req, res) => {

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

// use same path for the rest of the operations but with /:commitId 

module.exports = router;