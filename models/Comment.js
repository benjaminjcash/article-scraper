const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    title: {
        type: String,
        requred: true
    },
    body: {
        type: String,
        required: true
    }
});

let Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;