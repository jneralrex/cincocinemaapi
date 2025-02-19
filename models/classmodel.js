const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      enum: ["vip", "Standard", "Economy"], 
    },
    numberOfRows: {
      type: [Number], 
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    availability: {
      type: Boolean,
      default: true, 
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre", 
      required: true, 
    },
  },
  { timestamps: true }
);

const ClassModel = mongoose.model("Class", classSchema);

module.exports = ClassModel;
