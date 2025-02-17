const mongoose = require("mongoose");
const errorHandler = require("../utils/errorHandler");
const Theatre = require("../models/theatre.model");
const Location = require("../models/location.model");
const Cinema = require("../models/cinema.model");
const { generateAccessToken, generateRefreshToken } = require("../utils/generate.accessToken.refreshToken");
const { config } = require("../config/config");
const { encryptToken, decryptToken } = require("../utils/encrypt.decrypt");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendMail");


// const createTheatre = async (req, res, next) => {
//   const { theatreName, theatreLocation, theatreEmail, password } = req.body;
//   const { theatreCinema } = req.params;

//   try {
//     if (
//       !theatreName ||
//       !theatreLocation ||
//       !theatreEmail ||
//       !password 
//     ) {
//       return next(
//         errorHandler(403, "All fields are required", "ValidationError")
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(theatreCinema)) {
//       return next(errorHandler(400, "Invalid cinema ID", "ValidationError"));
//     }
//     if (!mongoose.Types.ObjectId.isValid(theatreLocation)) {
//       return next(errorHandler(400, "Invalid location ID", "ValidationError"));
//     }

//     const locationExists = await Location.findById(theatreLocation);
//     if (!locationExists) {
//       return next(errorHandler(404, "Location does not exist", "ValidationError"));
//     }

//     const cinemaExists = await Cinema.findById(theatreCinema);
//     if (!cinemaExists) {
//       return next(errorHandler(404, "Cinema does not exist", "ValidationError"));
//     }

//     const checkTheatre = await Theatre.findOne({ theatreName, theatreLocation });
//     if (checkTheatre) {
//       return next(errorHandler(403, "Theatre already exists", "ValidationError"));
//     }

//     const theatreEmailCheck = await Theatre.findOne({ theatreEmail });
//     if (theatreEmailCheck) {
//       return next(
//         errorHandler(403, "Email is already registered", "ValidationError")
//       );
//     }

//     const passwordRegex =
//     /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

//   if (!passwordRegex.test(password)) {
//     return next(
//       errorHandler(
//         400,
//         "Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.",
//         "ValidationError"
//       )
//     );
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   const hashedOtp = await bcrypt.hash(otp, 10);
//   const hashedPassword = await bcrypt.hash(password, 10);

//     const newTheatre = new Theatre({  theatreName, theatreLocation, theatreEmail, theatreCinema });
//     await newTheatre.save();

//     res.status(201).json({
//       message: "Theatre created successfully",
//       newTheatre,
//       otp: hashedOtp,
//       otpExpires: Date.now() + config.otp_expiration,
//       otpRequestedAt: Date.now(),
//       password: hashedPassword,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// const signInTheatre = async (req, res, next) => {
//   const { theatreNameOrtheatreEmail, password } = req.body;
//   try {
//     if (!theatreNameOrtheatreEmail || !password) {
//       return next(
//         errorHandler(400, "All fields are required", "ValidationError")
//       );
//     }

//     const sanitizedInput = theatreNameOrtheatreEmail.trim().toLowerCase();
//     const validTheatre = await Theatre.findOne({
//       $or: [
//         { theatreName: sanitizedInput },
//         { theatreEmail: sanitizedInput },
//       ],
//     }).select("+password");

//     if (!validTheatre) {
//       return next(errorHandler(401, "Invalid credentials", "Unauthorized"));
//     }

//     const isMatch = await bcrypt.compare(password, validTheatre.password);
//     if (!isMatch) {
//       return next(errorHandler(401, "Invalid credentials", "Unauthorized"));
//     }

//     const accessToken = generateAccessToken(validTheatre);
//     const refreshToken = generateRefreshToken(validTheatre);

//     validTheatre.refreshToken = encryptToken(refreshToken);
//     await validTheatre.save();

//     const {
//       password: _,
//       refreshToken: __,
//       ...theatreData
//     } = validTheatre.toObject();

//     res
//       .cookie("accesstoken", accessToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
//         maxAge: config.jwt_expires,
//       })
//       .cookie("refreshtoken", refreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
//         maxAge: config.jwt_refresh_expire,
//       })
//       .status(200)
//       .json({
//         message: "Login successful",
//         theatre: theatreData,
//       });
//   } catch (error) {
//     console.error("SignIn Error:", error);
//     next(errorHandler(500, "Internal server error"));
//   }
// };

// const handleRefreshTokenTheatre = async (req, res, next) => {
//   try {
//     const refreshToken = req.cookies?.refreshtoken;

//     if (!refreshToken) {
//       return next(errorHandler(403, "Refresh token is required", "Forbidden"));
//     }

//     let decodedRefreshToken;
//     try {
//       decodedRefreshToken = jwt.verify(refreshToken, config.jwt_refresh_s);
//     } catch (err) {
//       return next(errorHandler(403, "Invalid or expired refresh token", "Forbidden"));
//     }

//     const theatre = await Theatre.findById(decodedRefreshToken._id).select("+refreshToken");

//     if (!theatre) {
//       res.clearCookie("refreshtoken");
//       return next(errorHandler(403, "User not found", "Forbidden"));
//     }

//     if (decryptToken(theatre.refreshToken) !== refreshToken) {
//       res.clearCookie("refreshtoken");
//       return next(errorHandler(403, "Invalid refresh token", "Forbidden"));
//     }

//     const newAccessToken = generateAccessToken(theatre);
//     const newRefreshToken = generateRefreshToken(theatre);

//     theatre.refreshToken = encryptToken(newRefreshToken);
//     await theatre.save();

//     res
//       .cookie("refreshtoken", newRefreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
//         maxAge: config.jwt_refresh_expire,
//       })
//       .status(200)
//       .json({ message: "Token refreshed successfully", token: newAccessToken });
//   } catch (error) {
//     console.error("Refresh Token Error:", error);
//     next(errorHandler(500, "Internal server error"));
//   }
// };

const createTheatre = async (req, res, next) => {
  const { theatreName, theatreLocation, theatreEmail, password } = req.body;
  const { theatreCinema } = req.params;

  try {
    // Input validation
    if (!theatreName || !theatreLocation || !theatreEmail || !password) {
      return next(errorHandler(400, "All fields are required", "ValidationError"));
    }

    if (!mongoose.Types.ObjectId.isValid(theatreCinema)) {
      return next(errorHandler(400, "Invalid cinema ID", "ValidationError"));
    }
    if (!mongoose.Types.ObjectId.isValid(theatreLocation)) {
      return next(errorHandler(400, "Invalid location ID", "ValidationError"));
    }

    // Check if location and cinema exist
    const [locationExists, cinemaExists] = await Promise.all([
      Location.findById(theatreLocation),
      Cinema.findById(theatreCinema),
    ]);

    if (!locationExists || !cinemaExists) {
      return next(errorHandler(404, "Location or cinema does not exist", "ValidationError"));
    }

    // Check for duplicate theatre
    const [theatreExists, emailExists] = await Promise.all([
      Theatre.findOne({ theatreName, theatreLocation }),
      Theatre.findOne({ theatreEmail }),
    ]);

    if (theatreExists) {
      return next(errorHandler(400, "Theatre already exists", "ValidationError"));
    }
    if (emailExists) {
      return next(errorHandler(400, "Email is already registered", "ValidationError"));
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
    const newTheatre = new Theatre({
      theatreName,
      theatreLocation,
      theatreEmail,
      theatreCinema,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpires: Date.now() + config.otp_expiration,
      otpRequestedAt: Date.now(),
    });

    await newTheatre.save();

    // Send OTP to email (optional)
    await sendEmail(theatreEmail, "OTP Verification", `Your OTP is: ${otp}`);

    res.status(201).json({
      message: "Theatre created successfully",
      theatre: {
        _id: newTheatre._id,
        theatreName: newTheatre.theatreName,
        theatreEmail: newTheatre.theatreEmail,
      },
    });
  } catch (error) {
    console.log(error)
    next(errorHandler(500, "Internal server error"));
  }
};


const signInTheatre = async (req, res, next) => {
  const { theatreNameOrtheatreEmail, password } = req.body;

  try {
    // Input validation
    if (!theatreNameOrtheatreEmail || !password) {
      return next(errorHandler(400, "All fields are required", "ValidationError"));
    }

    // Find theatre by name or email
    const sanitizedInput = theatreNameOrtheatreEmail.trim().toLowerCase();
    const validTheatre = await Theatre.findOne({
      $or: [{ theatreName: sanitizedInput }, { theatreEmail: sanitizedInput }],
    }).select("+password");

    if (!validTheatre) {
      return next(errorHandler(401, "Invalid credentials", "Unauthorized"));
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, validTheatre.password);
    if (!isMatch) {
      return next(errorHandler(401, "Invalid credentials", "Unauthorized"));
    }

    // Generate tokens
    const accessToken = generateAccessToken(validTheatre);
    const refreshToken = generateRefreshToken(validTheatre);

    // Save refresh token
    validTheatre.refreshToken = encryptToken(refreshToken);
    await validTheatre.save();

    // Exclude sensitive fields from response
    const { password: _, refreshToken: __, ...theatreData } = validTheatre.toObject();

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
        theatre: theatreData,
      });
  } catch (error) {
    next(errorHandler(500, "Internal server error"));
  }
};

const handleRefreshTokenTheatre = async (req, res, next) => {
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
    const theatre = await Theatre.findById(decodedRefreshToken._id).select("+refreshToken");
    if (!theatre) {
      res.clearCookie("refreshtoken");
      return next(errorHandler(403, "User not found", "Forbidden"));
    }

    // Validate refresh token
    if (decryptToken(theatre.refreshToken) !== refreshToken) {
      res.clearCookie("refreshtoken");
      return next(errorHandler(403, "Invalid refresh token", "Forbidden"));
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(theatre);
    const newRefreshToken = generateRefreshToken(theatre);

    // Save new refresh token
    theatre.refreshToken = encryptToken(newRefreshToken);
    await theatre.save();

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

const changePasswordTheatre = async (req, res, next) => {
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

const forgotPasswordTheatre = async (req, res, next) => {
  const { theatreEmail } = req.body;

  try {
    if (!theatreEmail) {
      return next(errorHandler(400, "Email is required", "ValidationError"));
    }

    const theatre = await Theatre.findOne({ theatreEmail });
    if (!theatre) {
      return next(errorHandler(404, "Cinema not found", "NotFoundError"));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    theatre.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
      theatre.passwordResetExpires = Date.now() + config.reset_password_expiration;
    await theatre.save();

    const resetUrl = `${config.app_url}/reset-password/${resetToken}`;
    const message = `Click the link to reset your password: ${resetUrl}`;

    await sendEmail(theatreEmail, "Password Reset Request", message);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    next(error);
  }
};

const resetPasswordTheatre = async (req, res, next) => {
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
    const theatre = await Theatre.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!theatre) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    theatre.password = await bcrypt.hash(newPassword, 10);
    theatre.passwordResetToken = undefined;
    theatre.passwordResetExpires = undefined;
    await theatre.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

const verifyOtpTheatre = async (req, res, next) => {
  const { theatreEmail, otp } = req.body;

  try {
    if (!theatreEmail || !otp) {
      return next(
        errorHandler(400, "All fields are required", "ValidationError")
      );
    }

    const theatre = await Theatre.findOne({ theatreEmail }).select(
      "+otp +otpExpires"
    );
    if (!theatre || theatre.otpExpires < Date.now()) {
      return next(errorHandler(400, "OTP expired", "ValidationError"));
    }

    if (!theatre.otp) {
      return next(errorHandler(400, "Invalid OTP", "ValidationError"));
    }

    const isOtpValid = await bcrypt.compare(otp, theatre.otp);
    if (!isOtpValid) {
      return next(errorHandler(400, "Invalid OTP", "ValidationError"));
    }

    theatre.otp = undefined;
    theatre.otpExpires = undefined;
    await theatre.save();

    res.status(200).json({ message: "OTP verified. Registration complete." });
  } catch (error) {
    next(error);
  }
};

const resendOtpTheatre = async (req, res, next) => {
  const { theatreEmail } = req.body;

  try {
    if (!theatreEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const theatre = await Theatre.findOne({ theatreEmail });
    if (!theatre) {
      return next(errorHandler(404, "Cinema not found", "NotFoundError"));
    }

    if (
      theatre.otpRequestedAt &&
      Date.now() - theatre.otpRequestedAt < config.otp_request_limit
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
    theatre.otp = await bcrypt.hash(otp, 10);
    theatre.otpExpires = Date.now() + config.otp_expiration;
    theatre.otpRequestedAt = Date.now();
    await theatre.save();

    await sendEmail(
      theatreEmail,
      "Account Verification OTP",
      `Your new OTP is: ${otp}`
    );

    res.status(200).json({ message: "New OTP sent to your email." });
  } catch (error) {
    next(error);
  }
};


const viewTheatre = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Theatre ID", "ValidationError"));
  }

  try {
    const theatre = await Theatre.findById(id)
      .populate({
        path: 'theatreCinema',
        select: 'cinemaName ownerFirstName ownerLastName', 
      })
      .populate('theatreLocation'); 

    if (!theatre) {
      return next(errorHandler(404, `Theatre with this ID does not exist`, "ValidationError"));

    }

    res.status(200).json({
      message: "Theatre retrieved successfully",
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

const editTheatre = async (req, res, next) => {
  const { id, theatreCinema } = req.params;
  const { theatreName, theatreLocation } = req.body;


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Theatre ID", "ValidationError"));
  }

  if (theatreCinema && !mongoose.Types.ObjectId.isValid(theatreCinema)) {
    return next(errorHandler(400, "Invalid cinema ID", "ValidationError"));
  }

  try {
    const theatre = await Theatre.findById(id);
    if (!theatre) {
      return next(errorHandler(404, `Theatre with this ID does not exist`, "ValidationError"));
      
    }

    theatre.theatreName = theatreName || theatre.theatreName;
    theatre.theatreLocation = theatreLocation || theatre.theatreLocation;

    await theatre.save();


    res.status(200).json({
      message: "Theatre updated successfully",
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTheatre = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Theatre ID", "ValidationError"));
  }

  try {
    const theatre = await Theatre.findByIdAndDelete(id);
    if (!theatre) {
      return next(errorHandler(404, `Theatre with ID ${id} does not exist`, "ValidationError"));
    }

    res.status(200).json({
      message: "Theatre deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const viewAllTheatres = async (req, res, next) => {
  const { cinemaId, locationId } = req.query; 

  let filter = {};
  
  if (cinemaId) {
    if (!mongoose.Types.ObjectId.isValid(cinemaId)) {
      return next(errorHandler(400, "Invalid Cinema ID", "ValidationError"));
    }
    filter.theatreCinema = cinemaId;
  }

  if (locationId) {
    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      return next(errorHandler(400, "Invalid Location ID", "ValidationError"));
    }
    filter.theatreLocation = locationId;
  }

  try {
    const theatres = await Theatre.find(filter).populate("theatreLocation theatreCinema");

    res.status(200).json({
      message: "All theatres for this cinema retrieved successfully",
      theatres,
      total: theatres.length,

    });
  } catch (error) {
    next(error);
  }
};

const signOutTheatre = async (req, res, next) => {
  try {
    const { theatre } = req;
    if (!theatre) {
      return next(errorHandler(400, "User not found", "NotFoundError"));
    }

    theatre.refreshToken = null;
    await theatre.save();

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
  createTheatre,
  viewTheatre,
  editTheatre,
  deleteTheatre,
  viewAllTheatres,
  signInTheatre,
  resendOtpTheatre,
  verifyOtpTheatre,
  resetPasswordTheatre,
  forgotPasswordTheatre,
  changePasswordTheatre,
  handleRefreshTokenTheatre,
  signOutTheatre,
};
