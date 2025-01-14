const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
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
    review:{
        type:String,
        required:true
    },
},{timestamps:true});

reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Reviews = mongoose.model("Reviews", reviewSchema);
module.exports = Reviews;