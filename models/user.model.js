const mongoose = require("mongoose");
const config = require("../config/config");

const passwordValidator =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{}|;:'",.<>?/\\`~\-])[A-Za-z\d!@#$%^&*()_+[\]{}|;:'",.<>?/\\`~\-]{8,}$/;

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowrcase: true,
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
            lowercase: true,
        },
        role: {
            type: String,
            enum: ["user", "counter", "theatre-admin", "web-admin"],
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
            validate: {
                validator: function (v) {
                    return passwordValidator.test(v);
                },
                message:
                    "Password must be at least 8 characters, contain a special character, an uppercase letter, and a number.",
            },
        },
    },
    { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User