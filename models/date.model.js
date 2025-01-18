const mongoose = require("mongoose");

const dateSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "movie",
    required: [true, "Movie ID is required"],
  },
  screeningDates: [{
    date: {
      type: Date,
      required: [true, "Screening date is required"]
    },
    showTimes: [{
      time: {
        type: String,
        required: [true, "Show time is required"]
      },
      screenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Screen",
        required: [true, "Screen ID is required"]
      },
      availableSeats: {
        type: Number,
        required: [true, "Available seats count is required"]
      }
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Date", dateSchema);