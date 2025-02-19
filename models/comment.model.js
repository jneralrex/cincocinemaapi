const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true, 
    },
    movieId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "movie",
      required: true,
    },
    comment: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);


const Comments = mongoose.model("Comments", commentSchema);
module.exports = Comments;
