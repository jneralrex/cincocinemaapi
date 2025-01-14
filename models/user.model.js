const mongoose = require("mongoose");
const {config} = require("../config/config");

const passwordValidator =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{}|;:'",.<>?/\\`~\-])[A-Za-z\d!@#$%^&*()_+[\]{}|;:'",.<>?/\\`~\-]{9,}$/;
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
            enum: ["user", "counter", "theatre-admin", "web-admin"],
            default: "web-admin",
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
            validate: {
                validator: function (v) {
                    return passwordValidator.test(v);
                },
                message:
                    "Password must be at least 8 characters, contain a special character, an uppercase letter, and a number.",
            },
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
