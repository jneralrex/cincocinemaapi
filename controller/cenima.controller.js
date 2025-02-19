const bcrypt = require("bcryptjs");
const errorHandler = require("../utils/errorHandler");
const { config } = require("../config/config");
const { encryptToken, decryptToken } = require("../utils/encrypt.decrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generate.accessToken.refreshToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendMail");
const Cinema = require("../models/cinema.model");

const signUpCinema = async (req, res, next) => { 
  const {
    cinemaName,
    ownerFirstName,
    ownerLastName,
    cinemaEmail,
    cinemaPhoneNumber,
    password,
  } = req.body;
  try {
    if (
      !cinemaName ||
      !ownerFirstName ||
      !ownerLastName ||
      !cinemaEmail ||
      !cinemaPhoneNumber
    ) {
      return next(
        errorHandler(403, "All fields are required", "ValidationError")
      );
    }

    const cinemaNameCheck = await Cinema.findOne({ cinemaName });
    if (cinemaNameCheck) {
      return next(
        errorHandler(403, "Cinema name is already taken.", "ValidationError")
      );
    }

    const cinemaEmailCheck = await Cinema.findOne({ cinemaEmail });
    if (cinemaEmailCheck) {
      return next(
        errorHandler(403, "Email is already registered", "ValidationError")
      );
    }

    const cinemaPhoneNumberCheck = await Cinema.findOne({ cinemaPhoneNumber });
    if (cinemaPhoneNumberCheck) {
      return next(
        errorHandler(
          403,
          "Phone number is already registered",
          "ValidationError"
        )
      );
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return next(
        errorHandler(
          400,
          "Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.",
          "ValidationError"
        )
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCinema = new Cinema({
      cinemaName,
      ownerFirstName,
      ownerLastName,
      cinemaEmail,
      cinemaPhoneNumber,
      otp: hashedOtp,
      otpExpires: Date.now() + config.otp_expiration,
      otpRequestedAt: Date.now(),
      password: hashedPassword,
    });

    await newCinema.save();

    const message = `Your OTP for registration is: ${otp}. It is valid for 5 minutes.`;
    await sendEmail(cinemaEmail, "Account Verification OTP", message);

    res.status(201).json({ message: "OTP sent to your email. Please verify." });
  } catch (error) {
    next(error);
  }
};

const signInCinema = async (req, res, next) => {
  const { cinemaPhoneNumberOrCinemaEmail, password } = req.body;
  try {
    if (!cinemaPhoneNumberOrCinemaEmail || !password) {
      return next(
        errorHandler(400, "All fields are required", "ValidationError")
      );
    }

    const sanitizedInput = cinemaPhoneNumberOrCinemaEmail.trim().toLowerCase();
    const validCinema = await Cinema.findOne({
      $or: [
        { cinemaPhoneNumber: sanitizedInput },
        { cinemaEmail: sanitizedInput },
      ],
    }).select("+password");

    if (!validCinema) {
      return next(errorHandler(401, "Invalid credentials", "Unauthorized"));
    }

    const isMatch = await bcrypt.compare(password, validCinema.password);
    if (!isMatch) {
      return next(errorHandler(401, "Invalid credentials", "Unauthorized"));
    }

    const accessToken = generateAccessToken(validCinema);
    const refreshToken = generateRefreshToken(validCinema);

    validCinema.refreshToken = encryptToken(refreshToken);
    await validCinema.save();

    const {
      password: _,
      refreshToken: __,
      ...cinemaData
    } = validCinema.toObject();

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
        cinema: cinemaData,
      });
  } catch (error) {
    console.error("SignIn Error:", error);
    next(errorHandler(500, "Internal server error"));
  }
};

const handleRefreshTokenCinema = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshtoken;
  
      if (!refreshToken) {
        return next(errorHandler(403, "Refresh token is required", "Forbidden"));
      }
  
      let decodedRefreshToken;
      try {
        decodedRefreshToken = jwt.verify(refreshToken, config.jwt_refresh_s);
      } catch (err) {
        return next(errorHandler(403, "Invalid or expired refresh token", "Forbidden"));
      }
  
      const cinema = await Cinema.findById(decodedRefreshToken._id).select("+refreshToken");
  
      if (!cinema) {
        res.clearCookie("refreshtoken");
        return next(errorHandler(403, "User not found", "Forbidden"));
      }
  
      if (decryptToken(cinema.refreshToken) !== refreshToken) {
        res.clearCookie("refreshtoken");
        return next(errorHandler(403, "Invalid refresh token", "Forbidden"));
      }
  
      const newAccessToken = generateAccessToken(cinema);
      const newRefreshToken = generateRefreshToken(cinema);
  
      cinema.refreshToken = encryptToken(newRefreshToken);
      await cinema.save();
  
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
      console.error("Refresh Token Error:", error);
      next(errorHandler(500, "Internal server error"));
    }
};

const signOutCinema = async (req, res, next) => {
  try {
    const { cinema } = req;
    if (!cinema) {
      return next(errorHandler(400, "User not found", "NotFoundError"));
    }

    cinema.refreshToken = null;
    await cinema.save();

    res
      .clearCookie("accesstoken")
      .clearCookie("refreshtoken")
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

const changePasswordCinema = async (req, res, next) => {
  const { cinemaEmail, oldPassword, newPassword } = req.body;

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

    const cinema = await Cinema.findOne({ cinemaEmail }).select("+password");
    if (!cinema) {
      return next(errorHandler(404, "User not found", "NotFoundError"));
    }

    const isMatch = await bcrypt.compare(
      oldPassword.trim(),
      cinema.password.trim()
    );
    if (!isMatch) {
      return next(
        errorHandler(403, "Incorrect old password", "ValidationError")
      );
    }

    cinema.password = await bcrypt.hash(newPassword, 10);
    await cinema.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

const forgotPasswordCinema = async (req, res, next) => {
  const { cinemaEmail } = req.body;

  try {
    if (!cinemaEmail) {
      return next(errorHandler(400, "Email is required", "ValidationError"));
    }

    const cinema = await Cinema.findOne({ cinemaEmail });
    if (!cinema) {
      return next(errorHandler(404, "Cinema not found", "NotFoundError"));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    cinema.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    cinema.passwordResetExpires = Date.now() + config.reset_password_expiration;
    await cinema.save();

    const resetUrl = `${config.app_url}/reset-password/${resetToken}`;
    const message = `Click the link to reset your password: ${resetUrl}`;

    await sendEmail(cinemaEmail, "Password Reset Request", message);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    next(error);
  }
};

const resetPasswordCinema = async (req, res, next) => {
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
    const cinema = await Cinema.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!cinema) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    cinema.password = await bcrypt.hash(newPassword, 10);
    cinema.passwordResetToken = undefined;
    cinema.passwordResetExpires = undefined;
    await cinema.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

const verifyOtpCinema = async (req, res, next) => {
  const { cinemaEmail, otp } = req.body;

  try {
    if (!cinemaEmail || !otp) {
      return next(
        errorHandler(400, "All fields are required", "ValidationError")
      );
    }

    const cinema = await Cinema.findOne({ cinemaEmail }).select(
      "+otp +otpExpires"
    );
    if (!cinema || cinema.otpExpires < Date.now()) {
      return next(errorHandler(400, "OTP expired", "ValidationError"));
    }

    const isOtpValid = await bcrypt.compare(otp, cinema.otp);
    if (!isOtpValid) {
      return next(errorHandler(400, "Invalid OTP", "ValidationError"));
    }

    cinema.otp = undefined;
    cinema.otpExpires = undefined;
    await cinema.save();

    res.status(200).json({ message: "OTP verified. Registration complete." });
  } catch (error) {
    next(error);
  }
};

const resendOtpCinema = async (req, res, next) => {
  const { cinemaEmail } = req.body;

  try {
    if (!cinemaEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cinema = await Cinema.findOne({ cinemaEmail });
    if (!cinema) {
      return next(errorHandler(404, "Cinema not found", "NotFoundError"));
    }

    if (
      cinema.otpRequestedAt &&
      Date.now() - cinema.otpRequestedAt < config.otp_request_limit
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
    cinema.otp = await bcrypt.hash(otp, 10);
    cinema.otpExpires = Date.now() + config.otp_expiration;
    cinema.otpRequestedAt = Date.now();
    await cinema.save();

    await sendEmail(
      cinemaEmail,
      "Account Verification OTP",
      `Your new OTP is: ${otp}`
    );

    res.status(200).json({ message: "New OTP sent to your email." });
  } catch (error) {
    next(error);
  }
};

const getAllCinema = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (isNaN(pageNumber) || isNaN(limitNumber)) {
    return next(errorHandler(400, "Invalid pagination parameters", "ValidationErorr"));
  }

  const cinemas = await Cinema.find()
    .skip((pageNumber - 1) * limitNumber) 
    .limit(limitNumber) 
    .select("-password", "-refreshToken", "-otp"); 

  const totalCenima = await Cinema.countDocuments();

  res.status(200).json({
    success: true,
    cinemas,
    totalCenima,
    totalPages: Math.ceil(totalCenima / limitNumber),
    currentPage: pageNumber,
  });
  } catch (error) {
    next(error);

  }
  
};

const updateCinema = async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;
  
    try {
      if (!updateData || Object.keys(updateData).length === 0) {
        return next(errorHandler(400, "No data provided for update", "ValidationError"));
      }
  
      const disallowedFields = ["password", "refreshToken"];
      for (const field of disallowedFields) {
        if (updateData[field]) {
          return next(errorHandler(400, `Updating ${field} is not allowed`, "ValidationError"));
        }
      }
  
      const updatedCinema = await Cinema.findByIdAndUpdate(
        id,
        updateData,
        { new: true , runValidators: true } 
      );
  
      if (!updatedCinema) {
        return next(errorHandler(404, `Cinema not found for ${id}`, "NotFound" ));
      }
  
      res.status(200).json({
        success: true,
        message: "Cinema updated successfully",
        cinema: updatedCinema,
      });
    } catch (error) {
      console.error("Update Cinema Error:", error);
  
      if (error.name === "ValidationError") {
        return next(errorHandler(400, error.message, "ValidationError"));
      }
      if (error.name === "CastError") {
        return next(errorHandler(400, "Invalid cinema ID", "ValidationError"));
      }
  
      next(errorHandler(500, "Internal server error"));
    }
  };
  

module.exports = {
  signUpCinema,
  signInCinema,
  signOutCinema,
  handleRefreshTokenCinema,
  changePasswordCinema,
  forgotPasswordCinema,
  verifyOtpCinema,
  resendOtpCinema,
  resetPasswordCinema,
  updateCinema,
  getAllCinema,
};
