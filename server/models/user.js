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
    }
});

const User = mongoose.model("UserModel", userSchema);

module.exports = User;