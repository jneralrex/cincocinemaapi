const express = require("express");
const { createCounter, signInCounter, handleRefreshTokenCounter, signOutCounter, forgotPasswordCounter, changePasswordCounter, resetPasswordCounter, verifyOtpCounter, resendOtpCounter } = require("../controller/counter.controller");
const counterAuthToken = require("../utils/counter.AuthToken.verify");
const router = express.Router();

router.post("/counter/:counterTheatre", createCounter);

router.post("/signin", signInCounter);

router.post("/refreshtoken", handleRefreshTokenCounter);

router.post("/signout", counterAuthToken, signOutCounter);

router.patch("/forgotpassword", forgotPasswordCounter);

router.patch("/changepassword", changePasswordCounter);

router.patch("/resetpassword/:resetToken", resetPasswordCounter);

router.post("/verifyotp", verifyOtpCounter);

router.post("/resendotp", resendOtpCounter);

module.exports = router;