const mongoose = require("mongoose");

<<<<<<< Updated upstream
const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    eventHost: {
      type: String,
      required: true,
      trim: true,
    },
    eventPrice: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      default: "NGN",
      enum: ["USD", "EUR", "GBP", "NGN", "KES"],
    },
    flyerImage: {
      type: String,
    },
    eventDate: [
      {
        type: Date,
        required: true,
      },
    ],
    eventTime: [
      {
        type: String,
        required: true,
        match: /^([01]?[0-9]|2[0-3]):([0-5][0-9])\s(AM|PM)$/i,
      },
    ],
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    publicId: {
      type: String,
    },
  },
  { timestamps: true }
);
=======
const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    trim: true,
  },
  eventHost: {
    type: String,
    required: true,
    trim: true,
  },
  eventPrice: {
    type: String,
    required: true,
    trim: true,
  },
  currency: {
    type: String,
    default: "NGN", 
    enum: ["USD", "EUR", "GBP", "NGN", "KES"],
  },
  flyerImage: {
    type: String,
  },
  eventDate: [{
    type: Date,
    required: true,
  }],
  eventTime: [{
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):([0-5][0-9])\s(AM|PM)$/i,  
  }],
  location:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Location",
    required:[true, "location is required"],
  }],
  publicId: {
    type: String,
  },
}, { timestamps: true });
>>>>>>> Stashed changes

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
