const express = require("express");
var Comment = require("../models/comment.js");

const router = express.Router();

router.post("/", async(req, res) => {
    try{
        const {comment, createdBy, commentedOnNote, commentedOnComment} = req.body;

        if (commentedOnComment && commentedOnNote) {
            return res.status(400).json({error: "a comment can only be commented on a comment or a note not both"});
        }
        if (!commentedOnComment && !commentedOnNote) {
            return res.status(400).json({error: "a comment needs either a comment or a note to be commented on"})
        }

    const newComment = await Comment.create({
        comment,
        createdBy,
        commentedOnNote,
        commentedOnComment
    });

    res.status(201).json(newComment);

    } catch(err){
        res.status(400).json({error: err.message});
    }
});

async function getCommentsOnComments(commentId) {
    //get comments on the comment id
    const replies = await Comment.find({
        commentedOnComment : commentId
    }).populate("createdBy", "username").sort({createdAt : -1});

    //recursivly get replys to every reply
    const replyTree = []
    for (const reply of replies) {
        const nestedcomment = await getCommentsOnComments(reply._id);
        replyTree.push({
            ...reply.toObject(),
            replies: nestedcomment
        });
    }

    return replyTree
}

async function getCommentTree(noteFileId) {
    //get all comments on note
    const comments = await Comment.find({
        commentedOnNote : noteFileId
    }).populate("createdBy", "username").sort({createdAt: -1});

    //attach comments to the top level comments of the note
    const tree = [];
    for (const comment of comments) {
        const replies = await getCommentsOnComments(comment._id);
        tree.push({
            ...comment.toObject(),
            comments : replies
        });
    }

    return tree;
}

router.get("/", async(req, res) => {
    try {
        const tree = await getCommentTree(req.params.noteCommitId);
        res.status(201).json(tree);
    }catch(err){
        res.status(400).json({"error" : err.message});
    }
})

module.exports = router;