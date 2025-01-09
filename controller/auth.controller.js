const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const generateRandomUsername = require("../utils/generateRandomUsername");
const errorHandler = require("../utils/errorHandler");
const config = require("../config/config");
const { encryptToken, decryptToken } = require("../utils/encrypt.decrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generate.accessToken.refreshToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendMail");

const signUp = async (req, res, next) => {
    const { username, email, phoneNumber, password } = req.body;
    try {
      if (!username || !email || !phoneNumber || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const usernameCheck = await User.findOne({ username });
      if (usernameCheck) {
        const suggestions = await generateRandomUsername(username);
        return res.status(400).json({
          message:
            "Username already taken. Try another or choose from suggestions.",
          suggestions,
        });
      }
  
      const emailCheck = await User.findOne({ email });
      if (emailCheck) {
        return res
          .status(400)
          .json({ message: "This email is already registered." });
      }
  
      const phoneCheck = await User.findOne({ phoneNumber });
      if (phoneCheck) {
        return res
          .status(400)
          .json({ message: "This phone number is already registered." });
      }
  
      const otp = crypto.randomInt(100000, 999999); 
      const hashedOtp = crypto.createHash("sha256").update(otp.toString()).digest("hex");
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        username,
        email,
        phoneNumber,
        otp: hashedOtp,
        otpExpires: Date.now() + config.otp_expiration,
        otpRequestedAt: Date.now(),
        password: hashedPassword,
      });
  
      await newUser.save();
  
      const message = `Your OTP for registration is: ${otp}. It is valid for 10 minutes.`;
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
      return res.status(400).json({ message: "All fields are required" });
    }

    const sanitizedInput = usernameOrEmail.trim().toLowerCase();
    const validUser = await User.findOne({
      $or: [{ username: sanitizedInput }, { email: sanitizedInput }],
    }).select("+password");

    if (!validUser) {
      return next(errorHandler(400, "Invalid credentials"));
    }

    const isMatch = await bcrypt.compare(password, validUser.password);
    if (!isMatch) {
      return next(errorHandler(400, "Invalid credentials"));
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
        sameSite: "Lax",
        expires: new Date(Date.now() + Number(config.cookie_expiration)),
      })
      .cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        expires: new Date(Date.now() + Number(config.refresh_token_expiration)),
      })
      .status(200)
      .json({
        message: "Login successful",
        user: userData,
      });
  } catch (error) {
    next(error);
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
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(errorHandler(400, "Refresh token is required"));
    }

    const user = await User.findOne({
      refreshToken: encryptToken(refreshToken),
    });
    if (!user) {
      return next(errorHandler(403, "Invalid refresh token"));
    }

    const storedToken = decryptToken(user.refreshToken);
    if (storedToken !== refreshToken) {
      return next(errorHandler(403, "Invalid refresh token"));
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = encryptToken(newRefreshToken);
    await user.save();

    res
      .cookie("refreshtoken", newRefreshToken, { httpOnly: true, secure: true })
      .status(200)
      .json({
        message: "Token refreshed successfully",
        token: newAccessToken,
      });
  } catch (error) {
    console.error("Error handling refresh token:", error);
    next(errorHandler(500, "Server error"));
  }
};

const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    try {
        if (!oldPassword || !newPassword) {
            return next(errorHandler(400, "All fields are required", "ValidationError"));
        };

        const user = await User.findById(req.user.id).select("+password");

        if (!user) {
            return next(errorHandler(404, "User not found", "NotFoundError"));
        };

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(403).json({ message: "Incorrect old password" });
        };

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
            return res.status(400).json({ message: "Email is required" });
        };

        const user = await User.findOne({ email });
        if (!user) {
            return next(errorHandler(404, "User not found", "NotFoundError"));
        };

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + config.reset_password_expiration // 15 minutes
        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;
        const message = `You requested a password reset. Click the link to reset your password: ${resetUrl}. If you did not request this, please ignore this email.`;

        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            message,
        });

        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        next(error);
    }
};

const verifyOtp = async (req, res, next) => {
    const { email, otp } = req.body;
  
    try {
      if (!email || !otp) {
        return next(errorHandler(400, "All fields are required", "ValidationError"));
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return next(errorHandler(404, "User not found", "NotFoundError"));
      }

      const otpRequestDate = new Date(user.otpRequestedAt);
      const sevenDaysInMillis = config.unverified_user_expiration;

      const isOtpExpired = Date.now() - otpRequestDate.getTime() > sevenDaysInMillis;

      if (isOtpExpired) {
        await User.deleteOne({ email });
        return next(errorHandler(400, "OTP expired after 30 days, user removed from the database", "ValidationError"));
      }
  
      if (user.otpExpires < Date.now()) {
        return next(errorHandler(400, "OTP expired", "ValidationError"));
      }
  
      const hashedOtp = crypto.createHash("sha256").update(otp.toString()).digest("hex");
  
      if (hashedOtp !== user.otp) {
        return next(errorHandler(400, "Invalid OTP", "ValidationError"));
      }
  
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
  
      res.status(200).json({ message: "OTP verified. Registration complete." });
    } catch (error) {
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
  
     const otpRequestDate = new Date(user.otpRequestedAt);
      const sevenDaysInMillis = config.unverified_user_expiration;
      const isOtpExpired = Date.now() - otpRequestDate.getTime() > sevenDaysInMillis;
  
      if (isOtpExpired) {
        return res.status(400).json({ message: "You can no longer request a new OTP as 30 days have passed." });
      }
  
      const otp = crypto.randomInt(100000, 999999); 
      const hashedOtp = crypto.createHash("sha256").update(otp.toString()).digest("hex");
  
      user.otp = hashedOtp;
      user.otpExpires = Date.now() + config.otp_expiration;
      user.otpRequestedAt = Date.now(); 
      await user.save();
  
      const message = `Your new OTP for registration is: ${otp}. It is valid for 10 minutes.`;
      await sendEmail({
        email: user.email,
        subject: "Account Verification OTP",
        message,
      });
  
      res.status(200).json({ message: "New OTP sent to your email. Please verify." });
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
  resendOtp
};
