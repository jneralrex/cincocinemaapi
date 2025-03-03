const mongoose = require("mongoose");
const errorHandler = require("../utils/errorHandler");
const Theatre = require("../models/theatre.model");
const { generateAccessToken, generateRefreshToken } = require("../utils/generate.accessToken.refreshToken");
const { config } = require("../config/config");
const { encryptToken, decryptToken } = require("../utils/encrypt.decrypt");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendMail");
const Counter = require("../models/counter.model");


const createCounter = async (req, res, next) => {
  const { counterName, counterEmail, password } = req.body;
  const { counterTheatre } = req.params;

  try {
    if (!counterName || !counterEmail || !counterTheatre || !password) {
      return next(errorHandler(400, "All fields are required", "ValidationError"));
    }

    if (!mongoose.Types.ObjectId.isValid(counterTheatre)) {
      return next(errorHandler(400, "Invalid Theatre ID", "ValidationError"));
    }

    const checkTheatre = await Theatre.findById(counterTheatre);
    if (!checkTheatre) {
      return next(errorHandler(404, "Theatre does not exist", "NotFound"));
    }

    const emailCheck = await Counter.findOne({ counterEmail, counterTheatre });
    if (emailCheck) {
      return next(
        errorHandler(403, "Email is already registered", "ValidationError")
      );
    }
  
    // Validate password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return next(
        errorHandler(
          400,
          "Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.",
          "ValidationError"
        )
      );
    }

    // Hash password and generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new theatre
    const newCounter = new Counter({
      counterName, 
      counterEmail,
      counterTheatre,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpires: Date.now() + config.otp_expiration,
      otpRequestedAt: Date.now(),
    });

    await newCounter.save();

    // Send OTP to email (optional)
    await sendEmail(counterEmail, "OTP Verification", `Your OTP is: ${otp}`);

    res.status(201).json({ message: "OTP sent to your email. Please verify." });

  } catch (error) {
    console.log(error)
    next(errorHandler(500, "Internal server error"));
  }
};

const signInCounter = async (req, res, next) => {
  const { counterNameOrcounterEmail, password } = req.body;
  try {
    //Input validation
    if (!counterNameOrcounterEmail || !password) {
      return next(errorHandler(400, "All fields are required", "ValidationError"));
    }

    // Find theatre by name or email
    const sanitizedInput = counterNameOrcounterEmail.trim().toLowerCase();
    const validCounter = await Counter.findOne({
      $or: [{ counterName: sanitizedInput }, { counterEmail: sanitizedInput }],
    }).select("+password").populate("counterTheatre", "theatreName"); 

    if (!validCounter) {
      return next(errorHandler(401, "Invalid credentials", "Unauthorized"));
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, validCounter.password);
    if (!isMatch) {
      return next(errorHandler(401, "Invalid credentials", "Unauthorized"));
    }

    // Generate tokens
    const accessToken = generateAccessToken(validCounter);
    const refreshToken = generateRefreshToken(validCounter);

    // Save refresh token
    validCounter.refreshToken = encryptToken(refreshToken);
    await validCounter.save();

    // Exclude sensitive fields from response
    const { password: _, refreshToken: __, ...counterData } = validCounter.toObject();

    // Set cookies and send response
    res
      .cookie("accesstoken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        maxAge: config.jwt_expires,
      })
      .cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        maxAge: config.jwt_refresh_expire,
      })
      .status(200)
      .json({
        message: "Login successful",
        counter: counterData,
      });
  } catch (error) {
    next(errorHandler(500, "Internal server error"));
  }
};

const handleRefreshTokenCounter = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshtoken;

    if (!refreshToken) {
      return next(errorHandler(403, "Refresh token is required", "Forbidden"));
    }

    // Verify refresh token
    let decodedRefreshToken;
    try {
      decodedRefreshToken = jwt.verify(refreshToken, config.jwt_refresh_s);
    } catch (err) {
      return next(errorHandler(403, "Invalid or expired refresh token", "Forbidden"));
    }

    // Find theatre
    const counter = await Counter.findById(decodedRefreshToken._id).select("+refreshToken");
    if (!counter) {
      res.clearCookie("refreshtoken");
      return next(errorHandler(403, "Counter not found", "Forbidden"));
    }

    // Validate refresh token
    if (decryptToken(counter.refreshToken) !== refreshToken) {
      res.clearCookie("refreshtoken");
      return next(errorHandler(403, "Invalid refresh token", "Forbidden"));
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(counter);
    const newRefreshToken = generateRefreshToken(counter);

    // Save new refresh token
    counter.refreshToken = encryptToken(newRefreshToken);
    await counter.save();

    // Set new refresh token in cookie
    res
      .cookie("refreshtoken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        maxAge: config.jwt_refresh_expire,
      })
      .status(200)
      .json({ message: "Token refreshed successfully", token: newAccessToken });
  } catch (error) {
    next(errorHandler(500, "Internal server error"));
  }
};

const changePasswordCounter = async (req, res, next) => {
  const { theatreEmail, oldPassword, newPassword } = req.body;

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

    const theatre = await Theatre.findOne({ theatreEmail }).select("+password");
    if (!theatre) {
      return next(errorHandler(404, "User not found", "NotFoundError"));
    }

    const isMatch = await bcrypt.compare(
      oldPassword.trim(),
      theatre.password.trim()
    );
    if (!isMatch) {
      return next(
        errorHandler(403, "Incorrect old password", "ValidationError")
      );
    }

    theatre.password = await bcrypt.hash(newPassword, 10);
    await theatre.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

const forgotPasswordCounter = async (req, res, next) => {
    const { counterEmail } = req.body;
  
    try {
      if (!counterEmail) {
        return next(errorHandler(400, "Email is required", "ValidationError"));
      }
  
      const counter = await Counter.findOne({ counterEmail });
      if (!counter) {
        return next(errorHandler(404, "Counter not found", "NotFoundError"));
      }
  
      const resetToken = crypto.randomBytes(32).toString("hex");
      counter.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      counter.passwordResetExpires = Date.now() + config.reset_password_expiration;
      await counter.save();
  
      // Generate dynamic reset URL based on request origin
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
      
      const message = `Click the link to reset your password: ${resetUrl}`;
  
      await sendEmail(counterEmail, "Password Reset Request", message);
      res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      next(error);
    }
  };
  
const resetPasswordCounter = async (req, res, next) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  try {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return next(
        errorHandler(
          400,
          "Password must meet complexity requirements",
          "ValidationError"
        )
      );
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const counter = await Counter.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!counter) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    counter.password = await bcrypt.hash(newPassword, 10);
    counter.passwordResetToken = undefined;
    counter.passwordResetExpires = undefined;
    await counter.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

const verifyOtpCounter = async (req, res, next) => {
  const { counterEmail, otp } = req.body;

  try {
    if (!counterEmail || !otp) {
      return next(
        errorHandler(400, "All fields are required", "ValidationError")
      );
    }

    const counter = await Counter.findOne({ counterEmail }).select(
      "+otp +otpExpires"
    );
    if (!counter || counter.otpExpires < Date.now()) {
      return next(errorHandler(400, "OTP expired", "ValidationError"));
    }

    if (!counter.otp) {
      return next(errorHandler(400, "Invalid OTP", "ValidationError"));
    }

    const isOtpValid = await bcrypt.compare(otp, counter.otp);
    if (!isOtpValid) {
      return next(errorHandler(400, "Invalid OTP", "ValidationError"));
    }

    counter.otp = undefined;
    counter.otpExpires = undefined;
    await counter.save();

    res.status(200).json({ message: "OTP verified. Registration complete." });
  } catch (error) {
    next(error);
  }
};

const resendOtpCounter = async (req, res, next) => {
  const { counterEmail } = req.body;

  try {
    if (!counterEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const counter = await Counter.findOne({ counterEmail });
    if (!counter) {
      return next(errorHandler(404, "Cinema not found", "NotFoundError"));
    }

    if (
        counter.otpRequestedAt &&
      Date.now() - counter.otpRequestedAt < config.otp_request_limit
    ) {
      return next(
        errorHandler(
          429,
          "Please wait before requesting a new OTP",
          "RateLimitError"
        )
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    counter.otp = await bcrypt.hash(otp, 10);
    counter.otpExpires = Date.now() + config.otp_expiration;
    counter.otpRequestedAt = Date.now();
    await counter.save();

    await sendEmail(
        counterEmail,
      "Account Verification OTP",
      `Your new OTP is: ${otp}`
    );

    res.status(200).json({ message: "New OTP sent to your email." });
  } catch (error) {
    next(error);
  }
};

const viewCounter = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Theatre ID", "ValidationError"));
  }

  try {
    const counter = await Counter.findById(id)
      .populate({
        path: 'counterTheatre',
        select: 'theatreName theatreLocation', 
      })

    if (!counter) {
      return next(errorHandler(404, `counter with this ID does not exist`, "ValidationError"));

    }

    res.status(200).json({
      message: "Theatre retrieved successfully",
      counter,
    });
  } catch (error) {
    next(error);
  }
};

const editCounter = async (req, res, next) => {
    const { id, counterTheatre } = req.params;
    const { counterName, counterEmail } = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(errorHandler(400, "Invalid Theatre ID", "ValidationError"));
    }
  
    if (counterTheatre && !mongoose.Types.ObjectId.isValid(counterTheatre)) {
      return next(errorHandler(400, "Invalid theatre ID", "ValidationError"));
    }
  
    try {
      // Update and return the new document
      const updatedCounter = await Counter.findByIdAndUpdate(
        id,
        { counterName, counterEmail },
        { new: true, runValidators: true } // Return the updated document and apply validation
      );
  
      if (!updatedCounter) {
        return next(errorHandler(404, "Counter with this ID does not exist", "NotFoundError"));
      }
  
      res.status(200).json({
        message: "Counter updated successfully",
        counter: updatedCounter,
      });
    } catch (error) {
      next(error);
    }
 };
  

const deleteCounter = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Theatre ID", "ValidationError"));
  }

  try {
    const counter = await Counter.findByIdAndDelete(id);
    if (!counter) {
      return next(errorHandler(404, `Theatre with ID ${id} does not exist`, "ValidationError"));
    }

    res.status(200).json({
      message: "Theatre deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const viewAllCounter = async (req, res, next) => {
    const { counterTheatreId } = req.query;
  
    let filter = {};
    
    if (counterTheatreId) {
      if (!mongoose.Types.ObjectId.isValid(counterTheatreId)) {
        return next(errorHandler(400, "Invalid theatre ID", "ValidationError"));
      }
      filter.counterTheatre = counterTheatreId; 
    }
  
    try {
      const counters = await Counter.find(filter).populate({path: 'counterTheatre', select: 'theatreName theatreLocation'});
  
      res.status(200).json({
        message: "All counters for this theatre retrieved successfully",
        counters,
        total: counters.length, 
      });
    } catch (error) {
      next(error);
    }
  };
  

const signOutCounter = async (req, res, next) => {
  try {
    const { counter } = req;
    if (!counter) {
      return next(errorHandler(400, "Counter not found", "NotFoundError"));
    }

    counter.refreshToken = null;
    await counter.save();

    res
      .clearCookie("accesstoken")
      .clearCookie("refreshtoken")
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCounter,
  viewCounter,
  editCounter,
  deleteCounter,
  viewAllCounter,
  signInCounter,
  resendOtpCounter,
  verifyOtpCounter,
  resetPasswordCounter,
  forgotPasswordCounter,
  changePasswordCounter,
  handleRefreshTokenCounter,
  signOutCounter,
};
