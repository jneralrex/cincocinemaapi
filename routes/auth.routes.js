const express = require('express');
const { signUp, signIn, handleRefreshToken, signOut, forgotPassword, changePassword, verifyOtp, resendOtp, resetPassword } = require('../controller/auth.controller');
const userAuthToken = require('../utils/signOutAuthToken.verify');
const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/refreshtoken", handleRefreshToken);
router.post("/signout",  signOut);
router.patch("/forgotpassword", forgotPassword);
router.patch("/changepassword", changePassword);
router.patch("/resetpassword/:resetToken", resetPassword);
router.post("/verifyotp", verifyOtp);
router.post("/resendotp", resendOtp);

module.exports = router; 
