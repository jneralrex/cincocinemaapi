const mongoose = require("mongoose");

<<<<<<< HEAD
const screenSchema = new mongoose.Schema(
=======
const screenSchema = mongoose(
>>>>>>> 11ec757e9a50c975a2ea83e3d252f1304fcaa2eb
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
