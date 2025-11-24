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

const NoteCommit = new mongoose.model("NoteCommit", noteCommitSchema);

module.exports = NoteCommit;