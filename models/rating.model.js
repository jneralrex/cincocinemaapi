const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
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
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
      
  },
  { timestamps: true }
);


const Ratings = mongoose.model("Ratings", ratingSchema);
module.exports = Ratings;
