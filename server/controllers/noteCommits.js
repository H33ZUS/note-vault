const express = require("express");
const NoteCommit = require("../models/noteCommit.js");
const NoteFile = require("../models/noteFile.js")
const { isAuthenticated, isAuthorized } = require("../middleware/auth.js");
const { compareArrays, checkArray } = require("../utils/misc.js");
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
        const noteCommits = await NoteCommit.find({noteFileId: noteFileId}).sort(sortOptions).select("-__v -likesArray -dislikesArray");
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

router.post("/:id/likes", isAuthenticated, validateRequest(val.noteCommitLikesRequestSchema), async(req, res, next) => {
    try{
        const noteCommitId = req.params.id;
        const userId = req.user._id;
        const {like, dislike} = req.body;

        if(like && dislike) {
            return res.status(403).json({ error: "NoteCommits cant be both liked and disliked" });
        }
        if (!like && !dislike) {
            return res.status(400).json({ error: "no likes" });
        }

        if (like) {
            const noteCommit = await NoteCommit.findById(noteCommitId);

            if (checkArray(noteCommit.likesArray, userId)) {
                return res.status(400).json({ message: "Note Commit has already been liked by this user" });
            } else {
                if (checkArray(noteCommit.dislikesArray, userId)) {
                    update = {
                        $addToSet: { likesArray: userId },
                        $pull: { dislikesArray: userId }
                    };
                } else {
                    update = {
                        $addToSet: { likesArray: userId }
                    };
                }
            }

            let updateLike = await NoteCommit.findByIdAndUpdate(
                noteCommitId, 
                update, 
                { 
                    new: true,
                    runValidators: true
                }
            );

            if (updateLike) {
                if (updateLike.likesArray === undefined || updateLike.dislikesArray === undefined) {
                    updateLike.likesArray = [];
                    updateLike.dislikesArray = [];
                }
                updateLike.likes = updateLike.likesArray.length;
                updateLike.dislikes = updateLike.dislikesArray.length;
                await updateLike.save();
            }

            const NoteCommitObj = updateLike.toObject();
            delete NoteCommitObj.likesArray;
            delete NoteCommitObj.dislikesArray;
            delete NoteCommitObj.__v;

            if (NoteCommitObj._id) {
                NoteCommitObj._id = NoteCommitObj._id.toString();
                NoteCommitObj.createdBy = NoteCommitObj.createdBy.toString();
            }

            res.locals.data = NoteCommitObj;
            next();
        } else {
            const noteCommit = await NoteCommit.findById(noteCommitId);

            if (checkArray(noteCommit.dislikesArray, userId)) {
                return res.status(400).json({ message: "Note Commit has already been disliked by this user" });
            } else {
                if (checkArray(noteCommit.likesArray, userId)) {
                    update = {
                        $addToSet: { dislikesArray: userId },
                        $pull: { likesArray: userId }
                    };
                } else {
                    update = {
                        $addToSet: { dislikesArray: userId }
                    };
                }
            }

            const updateLike = await NoteCommit.findByIdAndUpdate(
                noteCommitId,
                update,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (updateLike) {
                if (updateLike.likesArray === undefined || updateLike.dislikesArray === undefined) {
                    updateLike.likesArray = [];
                    updateLike.dislikesArray = [];
                }
                updateLike.likes = updateLike.likesArray.length;
                updateLike.dislikes = updateLike.dislikesArray.length;
                await updateLike.save();
            }

            const NoteCommitObj = updateLike.toObject();
            delete NoteCommitObj.likesArray;
            delete NoteCommitObj.dislikesArray;
            delete NoteCommitObj.__v;

            if (NoteCommitObj._id) {
                NoteCommitObj._id = NoteCommitObj._id.toString();
                NoteCommitObj.createdBy = NoteCommitObj.createdBy.toString();
            }

            res.locals.data = NoteCommitObj;
            next();
        }

    } catch(err) {
        return res.status(400).json({ "error" : err.message });
    }
}, validateResponse(val.noteCommitResponseSchema), (req, res) => {
    res.status(200).json(res.locals.data);
});

router.delete("/:id/likes", isAuthenticated, validateRequest(val.noteCommitLikesRequestSchema), async(req, res, next) => {
    try{
        const noteCommitId = req.params.id;
        const userId = req.user._id;
        const {like, dislike} = req.body;

        if(like && dislike) {
            return res.status(403).json({ error: "Note Commits cant be both liked and disliked" });
        }
        if (!like && !dislike) {
            return res.status(400).json({ error: "no likes" });
        }

        if (like) {
            const noteCommit = await NoteCommit.findById(noteCommitId);

            if (noteCommit.likes <= 0 || noteCommit.dislikes <= 0) {
                return res.status(404).json({ message: "You cannot remove a like or dislike from a note Commit with 0 likes or dislikes" });
            }

            if (!checkArray(noteCommit.likesArray, userId)) {
                return res.status(400).json({ message: "Note Commit has not been liked by this user"});
            } else {
                update = {
                    $pull: { likesArray: userId }
                };
            }

            const updateLike = await NoteCommit.findByIdAndUpdate(
                noteCommitId, 
                update,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (updateLike) {
                if (updateLike.likesArray === undefined || updateLike.dislikesArray === undefined) {
                    updateLike.likesArray = [];
                    updateLike.dislikesArray = [];
                }
                updateLike.likes = updateLike.likesArray.length;
                updateLike.dislikes = updateLike.dislikesArray.length;
                await updateLike.save();
            }

            const NoteCommitObj = updateLike.toObject();
            delete NoteCommitObj.likesArray;
            delete NoteCommitObj.dislikesArray;
            delete NoteCommitObj.__v;

            if (NoteCommitObj._id) {
                NoteCommitObj._id = NoteCommitObj._id.toString();
                NoteCommitObj.createdBy = NoteCommitObj.createdBy.toString();
            }

            res.locals.data = NoteCommitObj;
            next();
        } else {
            const noteCommit = await NoteCommit.findById(noteCommitId);

            if (noteCommit.likes <= 0 || noteCommit.dislikes <= 0) {
                return res.status(404).json({ message: "You cannot remove a like or dislike from a note Commit with 0 likes or dislikes" });
            }

            if (!checkArray(noteCommit.dislikesArray, userId)) {
                return res.status(400).json({ message: "Note Commit has not been disliked by this user"});
            } else {
                update = {
                    $pull: { dislikesArray: userId }
                };
            }

            const updateLike = await NoteCommit.findByIdAndUpdate(
                noteCommitId, 
                update,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (updateLike) {
                if (updateLike.likesArray === undefined || updateLike.dislikesArray === undefined) {
                    updateLike.likesArray = [];
                    updateLike.dislikesArray = [];
                }
                updateLike.likes = updateLike.likesArray.length;
                updateLike.dislikes = updateLike.dislikesArray.length;
                await updateLike.save();
            }

            const NoteCommitObj = updateLike.toObject();
            delete NoteCommitObj.likesArray;
            delete NoteCommitObj.dislikesArray;
            delete NoteCommitObj.__v;

            if (NoteCommitObj._id) {
                NoteCommitObj._id = NoteCommitObj._id.toString();
                NoteCommitObj.createdBy = NoteCommitObj.createdBy.toString();
            }

            res.locals.data = NoteCommitObj;
            next();
        }
    }catch(err){
        return res.status(400).json({"error" : err.message})
    }
}, validateResponse(val.noteCommitResponseSchema), (req, res) => {
    res.status(200).json(res.locals.data);
});

module.exports = router;