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
    },
    files: [
        {
            type: Schema.Types.ObjectId,
            ref: "File",
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Subject = new mongoose.model("Subject", subjectSchema);

module.exports = Subject;