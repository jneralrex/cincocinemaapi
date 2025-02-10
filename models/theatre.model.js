const mongoose = require("mongoose");
const { config } = require("../config/config");

const theatreSchema = new mongoose.Schema(
  {
    theatreName: {
      type: String,
      required: true,
      trim: true,
      lowercase:true
    },
    theatreLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    theatreCinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      required: true,
    },
    theatreEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      default: config.theatre_role,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: Date,
    otpRequestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Theatre = mongoose.model("Theatre", theatreSchema);
module.exports = Theatre;
