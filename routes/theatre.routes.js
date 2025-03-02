const express = require("express");
 const router = express.Router();
const {
    viewAllTheatres,
    deleteTheatre,
    editTheatre,
    viewTheatre,
    createTheatre,
    handleRefreshTokenTheatre,
    signOutTheatre,
    forgotPasswordTheatre,
    changePasswordTheatre,
    resetPasswordTheatre,
    verifyOtpTheatre,
    resendOtpTheatre,
    signInTheatre,
} = require("../controller/theatre.controller");
const theatreAuthToken = require("../utils/theatre.authtoken.verify");

router.post("/theatres/:theatreCinema", createTheatre);

router.get("/theatres/:id", viewTheatre);

router.put("/theatres/:id/:theatreCinema", editTheatre);

router.delete("/theatres/:id", deleteTheatre);

router.get("/theatres", viewAllTheatres);

router.post("/signin", signInTheatre);

router.post("/refreshtoken", handleRefreshTokenTheatre);

router.post("/signout", theatreAuthToken, signOutTheatre);

router.patch("/forgotpassword", forgotPasswordTheatre);

router.patch("/changepassword", changePasswordTheatre);

router.patch("/resetpassword/:resetToken", resetPasswordTheatre);

router.post("/verifyotp", verifyOtpTheatre);

router.post("/resendotp", resendOtpTheatre);




module.exports = router;
