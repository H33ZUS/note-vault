const express = require("express");
var Comment = require("../models/comment.js");
const { isAuthenticated, isAuthorized } = require("../middleware/auth");
const { validateRequest } = require("../middleware/requestValidator.js");
const { validateResponse } = require("../middleware/responseValidator.js");
const { compareArrays, checkArray } = require("../utils/misc.js");
const val = require("../validations/commentValidation");

const router = express.Router({ mergeParams: true });

router.post("/", isAuthenticated, validateRequest(val.commentRequestSchema), async(req, res, next) => {
    try{
        const {comment, commentedOnNote, commentedOnComment} = req.body;

        if (commentedOnComment && commentedOnNote) {
            return res.status(400).json({ error: "a comment can only be commented on a comment or a note not both" });
        }
        if (!commentedOnComment && !commentedOnNote) {
            return res.status(400).json({ error: "a comment needs either a comment or a note to be commented on" });
        }
        
        const createdBy = req.user._id;

        const newComment = await Comment.create({
            comment,
            createdBy,
            commentedOnNote,
            commentedOnComment
        });

        const commentObj = newComment.toObject();
        delete commentObj.__v;
        delete commentObj.likesArray;
        delete commentObj.dislikesArray;

        if (commentObj._id) {
            commentObj._id = commentObj._id.toString();
            commentObj.createdBy = commentObj.createdBy.toString();

            if (commentObj.commentedOnComment) {
                commentObj.commentedOnComment = commentObj.commentedOnComment.toString();
            } else {
                commentObj.commentedOnNote = commentObj.commentedOnNote.toString();
            }
        }

        res.locals.data = commentObj;
        next();
    } catch(err){
        return res.status(400).json({ error: err.message });
    }
}, validateResponse(val.commentResponseSchema), (req, res) => {
    res.status(201).json(res.locals.data);
});

async function getCommentsOnComments(commentId) {
    //get comments on the comment id
    const replies = await Comment.find({
        commentedOnComment : commentId
    }).populate("createdBy", "username").sort({createdAt : -1}).select("-likesArray -dislikesArray");

    //recursivly get replys to every reply
    const replyTree = [];
    for (const reply of replies) {
        if (reply.deleted) {
            reply.comment = "DELETED";
        }
        const nestedcomment = await getCommentsOnComments(reply._id);
        replyTree.push({
            ...reply.toObject(),
            replies: nestedcomment
        });
    }

    return replyTree;
}

async function getCommentTree(noteFileId) {
    //get all comments on note
    const comments = await Comment.find({
        commentedOnNote : noteFileId
    }).populate("createdBy", "username").sort({createdAt: -1}).select("-likesArray -dislikesArray");

    //attach comments to the top level comments of the note
    const tree = [];
    for (const comment of comments) {
        if (comment.deleted) {
            comment.comment = "DELETED";
        }
        const replies = await getCommentsOnComments(comment._id);
        tree.push({
            ...comment.toObject(),
            comments : replies
        });
    }

    return tree;
}

function convertIdsToStringsRecursive(node) {
    if (!node) return node;

    if (Array.isArray(node)) {
        return node.map(convertIdsToStringsRecursive);
    }

    if (typeof node === 'object' && node !== null) {
        for (const key of ['_id', 'commentedOnNote', 'commentedOnComment']) {
            if (node[key] && typeof node[key].toString === 'function' && node[key].toString().length === 24) {
                node[key] = node[key].toString();
            } else if (node[key] === undefined) {
                node[key] = null;
            }
        }

        if (node.createdBy && node.createdBy._id && typeof node.createdBy._id.toString === 'function') {
            node.createdBy._id = node.createdBy._id.toString();
        }
        
        if (node.replies) {
            node.replies = convertIdsToStringsRecursive(node.replies);
        }
        if (node.comments) {
            node.comments = convertIdsToStringsRecursive(node.comments);
        }
    }

    return node;
}

router.get("/", async(req, res, next) => {
    try {
        const tree = await getCommentTree(req.params.noteCommitId);

        const convertedTree = convertIdsToStringsRecursive(tree);

        res.locals.data = convertedTree;
        next();
    }catch(err){
        return res.status(400).json({ "error" : err.message });
    }
}, validateResponse(val.commentTreeResponseSchema), (req, res) => {
    res.status(200).json(res.locals.data);
})

router.put("/:id/",isAuthenticated, async(req, res) => {
    try{
        const commentId = req.params.id;
        const {comment} = req.body;

        const oldComment = await Comment.findById(commentId);
        
        const updatedComment = await Comment.findByIdAndUpdate(commentId, {comment}, {new : true, runValidators : true});

        if (!updatedComment){
            return res.status(400).json({ error: "comment not found" });
        }

        return res.status(200).json(updatedComment);
    } catch(err) {
        return res.status(400).json({ error: err.message });
    }
})

router.delete("/:id/",isAuthenticated, async(req, res) => {
    try{
        const commentId = req.params.id;

        const oldComment = await Comment.findById(commentId);

        const deletedComment = await Comment.findById(commentId);

        if (!deletedComment) {
            return res.status(404).json({ error: "comment not found" });
        }

        deletedComment.deleted = !deletedComment.deleted;
        await deletedComment.save();

        return res.status(200).json({"comment deleted succesfully" : deletedComment})
    } catch(err) {
        return res.status(400).json({ error: err.message });
    }
})

router.post("/:id/likes", isAuthenticated, validateRequest(val.commentLikesRequestSchema), async(req, res, next) => {
    try{
        const commentId = req.params.id;
        const userId = req.user._id;
        const {like, dislike} = req.body;

        if(like && dislike) {
            return res.status(403).json({ error: "Comments cant be both liked and disliked" });
        }
        if (!like && !dislike) {
            return res.status(400).json({ error: "no likes" });
        }

        // ADDING A LIKE
        if (like) {
            const comment = await Comment.findById(commentId);
            
            // checking if comment has already been liked by the user and setting update body
            if (checkArray(comment.likesArray, userId)) {
                update = {
                    $pull: { likesArray: userId }
                }
            } else {
                if (checkArray(comment.dislikesArray, userId)) {
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

            // running update query
            const updateLike = await Comment.findByIdAndUpdate(
                commentId, 
                update,
                {
                    new: true,
                    runValidators: true
                }
            );

            // updating likes and dislikes count
            if (updateLike) {
                if (updateLike.likesArray === undefined || updateLike.dislikesArray === undefined) {
                    updateLike.likesArray = [];
                    updateLike.dislikesArray = [];
                }
                console.log(updateLike.likesArray);
                console.log(updateLike.dislikesArray);
                updateLike.likes = updateLike.likesArray.length;
                updateLike.dislikes = updateLike.dislikesArray.length;
                await updateLike.save();
            }

            // removing unwanted response fields
            const commentObj = updateLike.toObject();
            delete commentObj.likesArray;
            delete commentObj.dislikesArray;
            delete commentObj.__v;

            // transfering object fields to strings for validation
            if (commentObj._id) {
                commentObj._id = commentObj._id.toString();
                commentObj.createdBy = commentObj.createdBy.toString();

                if (commentObj.commentedOnComment) {
                    commentObj.commentedOnComment = commentObj.commentedOnComment.toString();
                } else {
                    commentObj.commentedOnNote = commentObj.commentedOnNote.toString();
                }
            }

            res.locals.data = commentObj;
            next();
        } else { 
        // ADDING A DISLIKE
            const comment = await Comment.findById(commentId);

            // checking if comment has already been disliked by the user and setting update body
            if (checkArray(comment.dislikesArray, userId)) {
                update = {
                    $pull: { dislikesArray: userId }
                }
            } else {
                if (checkArray(comment.likesArray, userId)) {
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

            const updateLike = await Comment.findByIdAndUpdate(
                commentId, 
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
                console.log(updateLike.likesArray);
                console.log(updateLike.dislikesArray);
                updateLike.likes = updateLike.likesArray.length;
                updateLike.dislikes = updateLike.dislikesArray.length;
                await updateLike.save();
            }

            const commentObj = updateLike.toObject();
            delete commentObj.likesArray;
            delete commentObj.dislikesArray;
            delete commentObj.__v;

            if (commentObj._id) {
                commentObj._id = commentObj._id.toString();
                commentObj.createdBy = commentObj.createdBy.toString();

                if (commentObj.commentedOnComment) {
                    commentObj.commentedOnComment = commentObj.commentedOnComment.toString();
                } else {
                    commentObj.commentedOnNote = commentObj.commentedOnNote.toString();
                }
            }

            res.locals.data = commentObj;
            next();
        }
    } catch(err) {
        return res.status(400).json({ error : err.message });
    }
}, validateResponse(val.commentResponseSchema), (req, res) => {
    res.status(200).json(res.locals.data);
});

module.exports = router;