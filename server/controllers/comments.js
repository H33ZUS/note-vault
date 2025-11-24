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
        if (reply.deleted) {
            reply.comment = "DELETED"
        }
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
        if (comment.deleted) {
            comment.comment = "DELETED"
        }
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

router.put("/:id/edit", async(req, res) => {
    try{
        const commentId = req.params.id
        const {comment, userId} = req.body

        const oldComment = await Comment.findById(commentId);
        const createdBy = oldComment.createdBy;

        if (userId != createdBy) {
            res.status(403).json({"error" : "different editor from auther"});
        }
        const updatedComment = await Comment.findByIdAndUpdate(commentId, {comment}, {new : true, runValidators : true});

        if (!updatedComment){
            return res.status(400).json({"error": "comment not found"});
        }

        res.status(200).json(updatedComment);
    }catch(err){
        res.status(400).json({"error" : err.message});
    }
})

router.delete("/:id/delete", async(req, res) => {
    try{
        const commentId = req.params.id;
        const {userId} = req.body;

        const oldComment = await Comment.findById(commentId);
        const createdBy = oldComment.createdBy;


        if(userId != createdBy) {
            res.status(403).json({"error": "non-auther cant delete comment"})
        }

        const deletedComment = await Comment.findById(commentId)

        if (!deletedComment) {
            res.status(404).json({"error": "comment not found"});
        }

        deletedComment.deleted = !deletedComment.deleted;
        await deletedComment.save();

        res.status(200).json({"comment deleted succesfully" : deletedComment})
    }catch(err){
        res.status(400).json({"error" : err.message});
    }
})

router.put("/:id/addLike", async(req, res) => {
    try{
        const commentId = req.params.id
        const {like, dislike} = req.body

        if(like && dislike) {
            res.status(403).json({"error" : "Comments cant be both liked and disliked"})
        }
        if (!like && !dislike) {
            res.status(400).json({"error" : "no likes"})
        }

        if (like) {
            const updateLike = await Comment.findByIdAndUpdate(commentId, 
                {$inc: {"likes": 1}},
                {new : true}
            )
            res.status(200).json(updateLike)
        }else {
            const updateLike = await Comment.findByIdAndUpdate(commentId, 
                {$inc: {"dislikes": 1}},
                {new : true}
                
            )
            res.status(200).json(updateLike)
        }

    }catch(err){
        res.status(400).json({"error" : err.message});
    }
})

router.put("/:id/removeLike", async(req, res) => {
    try{
        const commentId = req.params.id
        const {like, dislike} = req.body

        if(like && dislike) {
            res.status(403).json({"error" : "Comments cant be both liked and disliked"})
        }
        if (!like && !dislike) {
            res.status(400).json({"error" : "no likes"})
        }

        if (like) {
            const updateLike = await Comment.findByIdAndUpdate(commentId, 
                {$inc: {"likes": -1}},
                {new : true}
            )
            res.status(200).json(updateLike)
        }else {
            const updateLike = await Comment.findByIdAndUpdate(commentId, 
                {$inc: {"dislikes": -1}},
                {new : true}
                
            )
            res.status(200).json(updateLike)
        }
    }catch(err){
        res.status(400).json({"error" : err.message})
    }
})

module.exports = router;