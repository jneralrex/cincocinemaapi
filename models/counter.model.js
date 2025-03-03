const mongoose = require("mongoose");
const { config } = require("../config/config");

const counterSchema = new mongoose.Schema(
    {
        counterName: {
          type: String,
          required: true,
          trim: true,
          lowercase:true
        },
        counterTheatre: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Theatre",
          required: true,
        },
        counterEmail: {
          type: String,
          required: true,
          unique: true,
          trim: true,
        },
        role: {
          type: String,
          default: config.counter_role,
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
)

const Counter = mongoose.model("Counter", counterSchema);
module.exports = Counter;