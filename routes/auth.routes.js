const express = require('express');
const { signUp, signIn, handleRefreshToken, signOut, forgotPassword, changePassword, verifyOtp, resendOtp } = require('../controller/auth.controller');
const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/refreshtoken", handleRefreshToken);
router.post("/signout", signOut);
router.patch("/forgotpassword", forgotPassword);
router.patch("/resetpassword/:resetToken", changePassword);
router.post("/verifyotp", verifyOtp);
router.post("/resendotp", resendOtp);

module.exports = router;
