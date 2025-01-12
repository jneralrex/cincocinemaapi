const mongoose = require("mongoose");

const screenSchema = mongoose(
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
  },
  { timestamps: true }
);

const Screen = mongoose.model("Screen", screenSchema);
module.exports = Screen;
