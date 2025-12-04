const express = require("express");
const NoteCommit = require("../models/noteCommit.js");
const NoteFile = require("../models/noteFile.js")
const { isAuthenticated, isAuthorized } = require("../middleware/auth.js");
const { validateRequest } = require("../middleware/requestValidator");
const { validateResponse } = require("../middleware/responseValidator.js");
const val = require("../validations/noteCommitValidation");


const router = express.Router({mergeParams: true}); 

router.post("/", isAuthenticated, validateRequest(val.noteCommitRequestSchema), async(req, res, next) => {
    const {noteFileId} = req.params;

    try {
        const noteFile = await NoteFile.findById(noteFileId);
        if (!noteFile) {
            return res.status(404).json({error: "Parent NoteFile not found"});
        }
        const noteCommit = new NoteCommit({
            ...req.body, 
            noteFileId: noteFileId,
            createdBy: req.user._id
        });
        await noteCommit.save();

        const noteCommitObj = noteCommit.toObject();
        delete noteCommitObj.__v;

        if (noteCommitObj._id && noteCommitObj.noteFileId) {
            noteCommitObj._id = noteCommitObj._id.toString();
            noteCommitObj.noteFileId = noteCommitObj.noteFileId.toString();
            noteCommitObj.createdBy = noteCommitObj.createdBy.toString();
        }

        res.locals.data = noteCommitObj;
        next();
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}, validateResponse(val.noteCommitResponseSchema), (req, res) => {
    res.status(201).json(res.locals.data);
});

router.get("/", async(req, res, next) => {

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
        const noteCommits = await NoteCommit.find({noteFileId: noteFileId}).sort(sortOptions).select("-__v");
        if (noteCommits.length == 0) {
            return res.status(404).json({error: "No NoteCommits found for this NoteFile"});
        }

        const finalData = noteCommits.map(noteCommit => {
           const noteCommitObj = noteCommit.toObject();

            if (noteCommitObj._id && noteCommitObj.noteFileId) {
                noteCommitObj._id = noteCommitObj._id.toString();
                noteCommitObj.noteFileId = noteCommitObj.noteFileId.toString();
                noteCommitObj.createdBy = noteCommitObj.createdBy.toString();
            }

            return noteCommitObj;
        });

        res.locals.data = finalData;
        next();
    } catch (err) {
        res.status(404).json({error: err.message});
    }
}, validateResponse(val.noteCommitArrayResponseSchema), (req, res) => {
    res.status(200).json(res.locals.data);
});

// DELETE ONE NOTE FILE
router.delete("/:id", isAuthenticated, async(req, res) => {
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
router.patch("/:id", isAuthenticated, validateRequest(val.noteCommitPatchRequestSchema), async(req, res, next) => {
    userId = req.user._id;
    
    try {
        const existingNoteCommit = await NoteCommit.findById(req.params.id);

        if (!existingNoteCommit) {
            return res.status(404).json({message: "Note Commit not found"});
        }

        if (!existingNoteCommit.userId == userId) {
            return res.status(403).json({message: "You are not authorized to update another user's note commit"})
        }

        const noteCommit = await NoteCommit.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}).select("-__v");

        const noteCommitObj = noteCommit.toObject();

        if (noteCommitObj._id && noteCommitObj.noteFileId) {
            noteCommitObj._id = noteCommitObj._id.toString();
            noteCommitObj.noteFileId = noteCommitObj.noteFileId.toString();
            noteCommitObj.createdBy = noteCommitObj.createdBy.toString();
        }

        res.locals.data = noteCommitObj;
        next();
    } catch (err) {
        res.status(400).send(err.message);
    }
}, validateResponse(val.noteCommitResponseSchema), (req, res) => {
    res.status(200).json(res.locals.data);
});

// use same path for the rest of the operations but with /:commitId 

module.exports = router;