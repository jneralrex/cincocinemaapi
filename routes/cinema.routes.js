const express = require('express');
const { signUpCinema, signInCinema, handleRefreshTokenCinema, signOutCinema, forgotPasswordCinema, changePasswordCinema, resetPasswordCinema, verifyOtpCinema, resendOtpCinema, updateCinema, getAllCinema, deleteAccount } = require('../controller/cenima.controller');
const cinemaAuthToken = require('../utils/cinema.AuthToken');
const router = express.Router();

router.post("/signup", signUpCinema);

router.post("/signin", signInCinema);
router.post("/refreshtoken", handleRefreshTokenCinema);
router.post("/signout", cinemaAuthToken, signOutCinema);
router.patch("/forgotpassword", forgotPasswordCinema);
router.patch("/changepassword", changePasswordCinema);
router.patch("/resetpassword/:resetToken", resetPasswordCinema);
router.post("/verifyotp", verifyOtpCinema);
router.post("/resendotp", resendOtpCinema);
router.get("/all-cinema",  getAllCinema);
router.delete("/delete/:id",  deleteAccount);
router.patch("/updateprofile/:id", cinemaAuthToken, updateCinema);
module.exports = router; 
