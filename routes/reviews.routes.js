const express = require("express");
const { addReview, getReviewsByMovie, updateReview, deleteReview, getReviewsByUser } = require("../controller/reviews.controller");
const router = express.Router();

router.post("/create-review", addReview);
router.get("/movie/reviews/:movieId", getReviewsByMovie);
router.put("/edit/review/:reviewId", updateReview);
router.delete("/delete/review/:reviewId", deleteReview);
router.get("/userreviews/:userId", getReviewsByUser);


module.exports = router;