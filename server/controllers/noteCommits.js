const express = require("express");
const NoteCommit = require("../models/noteCommit.js");
const NoteFile = require("../models/noteFile.js")
const { isAuthenticated, isAuthorized } = require("../middleware/auth.js");

const router = express.Router({mergeParams: true}); 

router.post("/noteCommits",isAuthenticated, async(req, res) => {

    const {noteFileId} = req.params;
    const user = req.user.id

    try {
        const noteFile = await NoteFile.findById(noteFileId);
        if (!noteFile) {
            return res.status(404).json({error: "Parent NoteFile not found"});
        }
        const noteCommit = new NoteCommit({createdBy: user, ...req.body, noteFileId: noteFileId});
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

// DELETE ONE NOTE FILE
router.delete("/noteCommits/:id", isAuthenticated, async(req, res) => {
    try {
        const noteCommit = await NoteCommit.findById(req.params.id);

        if (noteCommit == null) {
            return res.status(404).json({message: "Note Commit not found"})
        }

        const result = await noteCommit.deleteOne();

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
});

// UPDATE ONE VARIABLE OF A NOTE FILE
router.patch("/noteCommits/:id", isAuthenticated, async(req, res) => {
    userId = req.user._id;
    
    try {
        const existingNoteCommit = await NoteCommit.findById(req.params.id);

        if (!existingNoteCommit) {
            return res.status(404).json({message: "Note Commit not found"});
        }

        if (!existingNoteCommit.userId == userId) {
            return res.status(403).json({message: "You are not authorized to update another user's note commit"})
        }

        const noteCommit = await NoteCommit.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        res.json(noteCommit);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// use same path for the rest of the operations but with /:commitId 

module.exports = router;