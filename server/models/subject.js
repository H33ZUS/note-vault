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
    noteFile: [
        {
            type: Schema.Types.ObjectId,
            ref: "NoteFile",
        }
    ],
    quizFile: [
        {
            type: Schema.Types.ObjectId,
            ref: "QuizFile",
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    }
});

const Subject = new mongoose.model("Subject", subjectSchema);

module.exports = Subject;