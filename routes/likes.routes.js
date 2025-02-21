const express = require("express");
const { addLike, removeLike, getLikesForMovie, getLikesByUser } = require("../controller/likes.controller");
const router = express.Router();

router.post("/", addLike);

router.delete("/", removeLike);

router.get("/movie/:movieId", getLikesForMovie);

router.get("/userlikes/:userId", getLikesByUser);

module.exports = router;
