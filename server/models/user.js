var mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        maxLength: 30,
        minLength: 1,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    roles: {
        type: [String],
        default: ["student"],
        enum: ["student", "teacher", "admin"],
        required: true
    }
});

userSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
    const Enrollment = this.model("Enrollment");

    try {
        const enrollments = await Enrollment.find({ userId: this._id });

        for (let enrollment of enrollments) {
            await enrollment.deleteOne();
        }

        next();
    } catch (err) {
        console.error(err);
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;