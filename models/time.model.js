const mongoose = require("mongoose");

const timeSchema = new mongoose.Schema({
  dateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Date",
    required: [true, "Date ID is required"],
  },
  showTimes: [
    {
      time: {
        type: String,
        required: [true, "Show time is required"],
      },
      screenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Screen",
        required: [true, "Screen ID is required"],
      },
      availableSeats: {
        type: Number,
        required: [true, "Available seats count is required"],
      },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
}, 
{ timestamps: true }
);

module.exports = mongoose.model("Time", timeSchema);
