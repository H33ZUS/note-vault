var mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema ({
    dislikes: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    },
    likesArray: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    dislikesArray: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    comment: {
        type: String,
        required: true
    },
    commentedOnNote: {
        type: Schema.Types.ObjectId,
        ref: "NoteCommit",
        default: null
    },
    commentedOnComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    deleted: {
        type: Boolean,
        default : false,
    }

});

commentSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
    try {
        const children = await this.model("Comment").find({ commentedOnComment: this._id });

        for (let child of children) {
            await child.deleteOne();
        }

        next();
    } catch (err) {
        console.error(err);
    }
});

const Comment = new mongoose.model("Comment", commentSchema);

module.exports = Comment;