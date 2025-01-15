const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
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
    likes: {
      type: Number,
      default: 1,
      min: 0, 
    },
  },
  { timestamps: true }
);

// Prevent duplicate likes by the same user for the same movie
likeSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Likes = mongoose.model("Likes", likeSchema);
module.exports = Likes;
