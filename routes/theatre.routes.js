const express = require("express");
<<<<<<< Updated upstream
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

router.post("/theatres/:theatreCinema", createTheatre);

router.get("/theatres/:id", viewTheatre);

router.put("/theatres/:id/:theatreCinema", editTheatre);

router.delete("/theatres/:id", deleteTheatre);

router.get("/theatres", viewAllTheatres);

router.post("/signin", signInTheatre);

router.post("/refreshtoken", handleRefreshTokenTheatre);

router.post("/signout", signOutTheatre);

router.patch("/forgotpassword", forgotPasswordTheatre);

router.patch("/changepassword", changePasswordTheatre);

router.patch("/resetpassword/:resetToken", resetPasswordTheatre);

router.post("/verifyotp", verifyOtpTheatre);

router.post("/resendotp", resendOtpTheatre);
=======
const {
    createTheatre,
    viewTheatre,
    editTheatre,
    deleteTheatre,
    viewAllTheatres,
  }  = require("../controller/theatre.controller");

const router = express.Router();

router.post("/create-theatre", createTheatre);

router.get("/single-theatre/:id", viewTheatre);

router.patch("/edit-theatre/:id", editTheatre);

router.delete("/delete/:id", deleteTheatre);

router.get("/all-theatre", viewAllTheatres);
>>>>>>> Stashed changes

module.exports = router;
