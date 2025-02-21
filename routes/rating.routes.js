const express = require("express");
const {addRating, removeRating, getRatingForMovie, getRatingByUser,} = require("../controller/rating.controller");
const router = express.Router();


router.post("/", addRating);

router.delete("/", removeRating);

router.get("/movie/:movieId", getRatingForMovie);

router.get("/userlikes/:userId", getRatingByUser);

module.exports = router;
