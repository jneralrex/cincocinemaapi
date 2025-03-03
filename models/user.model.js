const mongoose = require("mongoose");
const {config} = require("../config/config");

    const phoneNumberValidator = /^[+]?[0-9]{10,15}$/;
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v) {
                    return phoneNumberValidator.test(v);
                },
                message: "Phone number must be a valid number with 10-15 digits, optionally starting with a '+'",
            },
        },
        role: {
            type: String,
            default: "user",
            lowercase: true,
        },
        profilePhoto: {
            type: String,
            default: config.defaultProfilePics,
        },
        profilePhotoPublicId: {
            type: String,
        },
        coverImage: {
            url: String,
            publicId: String,
        },
        password: {
            type: String,
            required: true,
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

const User = mongoose.model("User", userSchema);
module.exports = User;
