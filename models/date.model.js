const mongoose = require("mongoose");

const dateSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "movie",
    required: [true, "Movie ID is required"],
  },
  screeningDates: {
    date: {
      type: Date,
      required: [true, "Screening date is required"]
    },
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Date", dateSchema);