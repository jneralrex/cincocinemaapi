const mongoose = require("mongoose");

const timeSchema = new mongoose.Schema({
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "movie",
      required: [true, "Movie ID is required"],
    },
  dateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Date",
    required: [true, "Date ID is required"],
  },
  showTimes: 
    {
      time: {
        type: String,
        required: [true, "Show time is required"],
      },
     },
  isActive: {
    type: Boolean,
    default: true,
  },
}, 
{ timestamps: true }
);

module.exports = mongoose.model("Time", timeSchema);
