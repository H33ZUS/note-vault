var mongoose = require("mongoose");

const Schema = mongoose.Schema;

const subjectSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true, // removes trailing spaces
    },
    createdBy: {
        type: Schema.Types.ObjectId, 
        ref: "User", // tells mongoDB this is linked to a user ID
        required: true,
        immutable: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
});

subjectSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
    const NoteFile = this.model("NoteFile");
    const Enrollment = this.model("Enrollment");

    try {
        const noteFiles = await NoteFile.find({ subjectId: this._id });

        for (let noteFile of noteFiles) {
            await noteFile.deleteOne();
        }

        const enrollments = await Enrollment.find({ subjectId: this._id });

        for (let enrollment of enrollments) {
            await enrollment.deleteOne();
        }

        next();
    } catch (err) {
        console.error(err);
    }
});

const Subject = new mongoose.model("Subject", subjectSchema);

module.exports = Subject;