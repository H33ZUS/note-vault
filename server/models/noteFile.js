const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noteFileSchema = new Schema ({
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
        immutable: true,
    },  
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        immutable: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    notes: [
        {
            type: Schema.Types.ObjectId,
            ref: "NoteCommit",
        }
    ]
});

const NoteFile = new mongoose.model("NoteFile", noteFileSchema);

module.exports = NoteFile;