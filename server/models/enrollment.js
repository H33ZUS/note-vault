var mongoose = require("mongoose");

const Schema = mongoose.Schema;

const enrollmentSchema = new Schema ({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
});

enrollmentSchema.index({userId: 1, subjectId: 1}, {unique: true});

const Enrollment = new mongoose.model("Enrollment", enrollmentSchema);

module.exports = Enrollment;