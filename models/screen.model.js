const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema(
  {
    screenName: {
      type: String,
      required: true,
      toLowerCase: true,
    },
    screenCapacity: {
      type: Number,
      required: true,
    },
    screenType: {
      type: String,
      required: true,
      toLowerCase: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
  },
  { timestamps: true }
);

const Screen = mongoose.model("Screen", screenSchema);
module.exports = Screen;
