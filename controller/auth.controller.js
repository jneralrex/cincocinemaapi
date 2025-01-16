const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const generateRandomUsername = require("../utils/generateRandomUsername");
const errorHandler = require("../utils/errorHandler");
const { config } = require("../config/config");
const { encryptToken, decryptToken } = require("../utils/encrypt.decrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generate.accessToken.refreshToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendMail");

const signUp = async (req, res, next) => {
  const { username, email, phoneNumber, password, role } = req.body;
  try {
    if (!username || !email || !phoneNumber || !password || !role) {
      return next(
        errorHandler(403, "All fields are required", "ValidationError")
      );
    }

    const usernameCheck = await User.findOne({ username });
    if (usernameCheck) {
      const suggestions = await generateRandomUsername(username);
      return next(
        errorHandler(
          403,
          "Username is already taken, here are some available name",
          "ValidationError",
          suggestions
        )
      );
    }

    const emailCheck = await User.findOne({ email });
    if (emailCheck) {
      return next(
        errorHandler(403, "Email is already registered", "ValidationError")
      );
    }

    const phoneCheck = await User.findOne({ phoneNumber });
    if (phoneCheck) {
      return next(
        errorHandler(
          403,
          "Phone number is already registered",
          "ValidationError"
        )
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      phoneNumber,
      role,
      otp: hashedOtp,
      otpExpires: Date.now() + config.otp_expiration,
      otpRequestedAt: Date.now(),
      password: hashedPassword,
    });

    await newUser.save();

    const message = `Your OTP for registration is: ${otp}. It is valid for 5 minutes.`;
    await sendEmail(email, "Account Verification OTP", message);

    res.status(201).json({ message: "OTP sent to your email. Please verify." });
  } catch (error) {
    next(error);
  }
};

const signIn = async (req, res, next) => {
  const { usernameOrEmail, password } = req.body;
  try {
    if (!usernameOrEmail || !password) {
      return next(
        errorHandler(400, "All fields are required", "ValidationError")
      );
    }

    const sanitizedInput = usernameOrEmail.trim().toLowerCase();
    const validUser = await User.findOne({
      $or: [{ username: sanitizedInput }, { email: sanitizedInput }],
    }).select("+password");

    if (!validUser) {
      return next(errorHandler(401, "Invalid credentials", "Unauthorized"));
    }

    const isMatch = await bcrypt.compare(password, validUser.password);
    if (!isMatch) {
      return next(errorHandler(401, "Invalid credentials", "Unauthorized"));
    }

    const accessToken = generateAccessToken(validUser);
    const refreshToken = generateRefreshToken(validUser);

    validUser.refreshToken = encryptToken(refreshToken);
    await validUser.save();

    const { password: _, refreshToken: __, ...userData } = validUser.toObject();

    res
      .cookie("accesstoken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        maxAge: config.cookie_expiration,
      })
      .cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        maxAge: config.refresh_token_expiration,
      })
      .status(200)
      .json({
        message: "Login successful",
        user: userData,
      });
  } catch (error) {
    console.error("SignIn Error:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

const signOut = async (req, res, next) => {
  try {
    const { user } = req;
    user.refreshToken = null;
    await user.save();
    res
      .clearCookie("accesstoken")
      .clearCookie("refreshtoken")
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

const handleRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshtoken;

    if (!refreshToken) {
      return next(errorHandler(403, "Refresh token is required", "Forbidden"));
    }

    const user = await User.findOne({
      refreshToken: encryptToken(refreshToken),
    }).select("+refreshToken");

    if (!user) {
      res.clearCookie("refreshtoken");
      return next(errorHandler(403, "Invalid refresh token", "Forbidden"));
    }

    const storedToken = decryptToken(user.refreshToken);
    if (storedToken !== refreshToken) {
      res.clearCookie("refreshtoken");
      return next(errorHandler(403, "Invalid refresh token", "Forbidden"));
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = encryptToken(newRefreshToken);
    await user.save();

    res
      .cookie("refreshtoken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        maxAge: config.refresh_token_expiration,
      })
      .status(200)
      .json({
        message: "Token refreshed successfully",
        token: newAccessToken,
      });
  } catch (error) {
    console.error("HandleRefreshToken Error:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

const changePassword = async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    if (!oldPassword || !newPassword) {
      return next(
        errorHandler(400, "All fields are required", "ValidationError")
      );
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (oldPassword === newPassword) {
      return next(
        errorHandler(
          400,
          "New password cannot be the same as old password",
          "ValidationError"
        )
      );
    }

    if (!passwordRegex.test(newPassword)) {
      return next(
        errorHandler(
          400,
          "New password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.",
          "ValidationError"
        )
      );
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(errorHandler(404, "User not found", "NotFoundError"));
    }

    const isMatch = await bcrypt.compare(
      oldPassword.trim(),
      user.password.trim()
    );
    if (!isMatch) {
      return next(
        errorHandler(403, "Incorrect old password", "ValidationError")
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      return next(errorHandler(400, "Email is required", "ValidationError"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User not found", "NotFoundError"));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + config.reset_password_expiration; // 15 minutes
    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/resetpassword/${resetToken}`;
    const message = `You requested a password reset. Click the link to reset your password: ${resetUrl}. If you did not request this, please ignore this email.`;
    const subject = "Password Reset Request";

    await sendEmail(email, subject, message);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  try {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    if (!passwordRegex.test(newPassword)) {
      return next(
        errorHandler(
          400,
          "New password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.",
          "ValidationError"
        )
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return next(
        errorHandler(400, "All fields are required", "ValidationError")
      );
    }

    const user = await User.findOne({ email }).select("+otp +otpExpires");
    if (!user) {
      return next(errorHandler(404, "User not found", "NotFoundError"));
    }

    console.log("OTP Expires:", user.otpExpires);
    console.log("Current Time:", Date.now());

    if (!user.otpExpires || user.otpExpires < Date.now()) {
      return next(errorHandler(400, "OTP expired", "ValidationError"));
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return next(errorHandler(400, "Invalid OTP", "ValidationError"));
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified. Registration complete." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    next(error);
  }
};

const resendOtp = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User not found", "NotFoundError"));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpires = Date.now() + config.otp_expiration;
    user.otpRequestedAt = Date.now();
    await user.save();

    const message = `Your new OTP for registration is: ${otp}. It is valid for 5 minutes.`;
    await sendEmail(email, "Account Verification OTP", message);

    res
      .status(200)
      .json({ message: "New OTP sent to your email. Please verify." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signUp,
  signIn,
  signOut,
  handleRefreshToken,
  changePassword,
  forgotPassword,
  verifyOtp,
  resendOtp,
  resetPassword,
};
