var mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noteCommitSchema = new Schema ({
    dislikes: {
        type: Int,
        required: true,
        default: 0,
    },
    likes: {
        type: Int,
        required: true,
        default: 0,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    note: {
        type: String,
        required: true
    },
    topic: {
        type: Schema.Types.ObjectId,
        ref: "Topic",
        required: true
    }
});

const NoteCommit = new mongoose.model("NoteCommit", noteCommitSchema);

module.exports = NoteCommit;