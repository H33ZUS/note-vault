var mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema ({
    dislikes: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    comment: {
        type: String,
        required: true
    },
    commentedOnNote: {
        type: Schema.Types.ObjectId,
        ref: "NoteCommit"
    },
    commentedOnComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },

});

const Comment = new mongoose.model("Comment", commentSchema);

module.exports = Comment;