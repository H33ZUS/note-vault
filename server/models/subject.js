var mongoose = require("mongoose");

const {Schema} = new mongoose.Schema;

const subjectSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true, // removes trailing spaces
    },
    createdBy: {
        type: Schema.Types.ObjectID, 
        ref: "User", // tells mongoDB this is linked to a user ID
        required: true,
    },
    files: [
        {
            type: Schema.Types.ObjectID,
            ref: "File",
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Subject = new mongoose.model("Suject", subjectSchema);

export default Subject;