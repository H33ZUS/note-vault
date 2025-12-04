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
    }
});

noteFileSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
    const NoteCommit = this.model("NoteCommit");

    try {
        const commits = await NoteCommit.find({ noteFileId: this._id });

        for (let commit of commits) {
            await commit.deleteOne();
        }

        next();
    } catch (err) {
        console.error(err);
    }
});

const NoteFile = new mongoose.model("NoteFile", noteFileSchema);

module.exports = NoteFile;