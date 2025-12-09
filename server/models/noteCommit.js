const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noteCommitSchema = new Schema ({
    dislikes: {
        type: Number,
        required: true,
        default: 0,
    },
    likes: {
        type: Number,
        required: true,
        default: 0,
    },
    likesArray: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    dislikesArray: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        immutable: true,
    },
    note: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    noteFileId: {
        type: Schema.Types.ObjectId,
        ref: "NoteFile",
        required: true,
        immutable: true,
    }
});

noteCommitSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
    const Comment = this.model("Comment");

    try {
        const comments = await Comment.find({ commentedOnNote: this._id });

        for (let comment of comments) {
            await comment.deleteOne();
        }

        next();
    } catch (err) {
        console.error(err);
    }
});

const NoteCommit = new mongoose.model("NoteCommit", noteCommitSchema);

module.exports = NoteCommit;