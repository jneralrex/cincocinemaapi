const mongoose = require("mongoose");
const { config } = require("../config/config");

const cinemaSchema = new mongoose.Schema(
  {
    cinemaName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    ownerFirstName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerLastName: {
      type: String,
      required: true,
      trim: true,
    },
    cinemaEmail: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    role: {
      type: String,
      default: config.cenima_role,
    },
    cinemaPhoneNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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

const Cinema = mongoose.model("Cinema", cinemaSchema);
module.exports = Cinema;
