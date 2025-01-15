const asyncHandler = require("express-async-handler");
const errorHandler = require("../utils/errorHandler");
const Reviews = require("../models/reviews.model");


const addReview = asyncHandler(async (req, res, next) => {
  const { userId, movieId, review } = req.body;

  if (!userId || !movieId || !review) {
    return next(errorHandler(400, "All fields are required.", "ValidationError"));
  }

  try {
    const existingReview = await Reviews.findOne({ userId, movieId });

    if (existingReview) {
      return next(errorHandler(403, "You cannot review a movie more than once.", "NotAllowed"));
    }

    const newReview = await Reviews.create({ userId, movieId, review });

    res.status(201).json({
      success: true,
      message: "Review added successfully.",
      review: newReview,
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Failed to add like.", "DatabaseError"));
  }
});

const getReviewsByMovie = asyncHandler(async (req, res, next) => {
  const { movieId } = req.params;

  if (!movieId) {
    return next(errorHandler(400, "Movie ID is required.", "ValidationError"));
  }

  try {
    const reviews = await Reviews.find({ movieId }).populate("userId", "username profilePhoto");
    res.status(200).json({
      success: true,
      reviews,
      totalReviews: reviews.length,
    });
  } catch (error) {
    next(error);
  }
});

const updateReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  const { review } = req.body;

  if (!reviewId || !review) {
    return next(errorHandler(400, "Review ID and updated review content are required.", "ValidationError"));
  }

  try {
    const updatedReview = await Reviews.findByIdAndUpdate(
      reviewId,
      { review },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return next(errorHandler(404, "Review not found.", "NotFoundError"));
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review: updatedReview,
    });
  } catch (error) {
    next(error);
  }
});

const getReviewsByUser = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
  
    if (!userId) {
      return next(errorHandler(400, "userId is required.", "ValidationError"));
    }
  
    try {
      const reviewed = await Reviews.find({ userId }).populate("movieId", "title description");
  
      res.status(200).json({
        success: true,
        userReviews: reviewed,
        totalReviewed: reviewed.length,
      });
    } catch (error) {
      console.error(error);
      return next(errorHandler(500, "Failed to retrieve likes by user.", "DatabaseError"));
    }
});

const deleteReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;

  if (!reviewId) {
    return next(errorHandler(400, "Review ID is required.", "ValidationError"));
  }

  try {
    const deletedReview = await Reviews.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return next(errorHandler(404, "Review not found.", "NotFoundError"));
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  addReview,
  getReviewsByUser,
  getReviewsByMovie,
  updateReview,
  deleteReview,
};
