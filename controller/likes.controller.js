const Likes = require("../models/Likes.model");
const errorHandler = require("../utils/errorHandler");


const addLike = async (req, res, next) => {
  const { userId, movieId } = req.body;

  if (!userId || !movieId) {
    return next(errorHandler(400, "userId and movieId are required.", "ValidationError"));
  }

  try {
    const existingLike = await Likes.findOne({ userId, movieId });

    if (existingLike) {
      return next(errorHandler(403, "You cannot like a movie more than once.", "NotAllowed"));
    }

    const like = await Likes.create({ userId, movieId });

    res.status(201).json({
      success: true,
      data: like,
      message: "Like added successfully.",
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Failed to add like.", "DatabaseError"));
  }
};


const removeLike = async (req, res, next) => {
  const { userId, movieId } = req.body;

  if (!userId || !movieId) {
    return next(errorHandler(400, "userId and movieId are required.", "ValidationError"));
  }

  try {
    const like = await Likes.findOneAndDelete({ userId, movieId });

    if (!like) {
      return next(errorHandler(404, "Like not found.", "NotFoundError"));
    }

    res.status(200).json({
      success: true,
      message: "Like removed successfully.",
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Failed to remove like.", "DatabaseError"));
  }
};


const getLikesForMovie = async (req, res, next) => {
  const { movieId } = req.params;

  if (!movieId) {
    return next(errorHandler(400, "movieId is required.", "ValidationError"));
  }

  try {
    const likes = await Likes.find({ movieId }).populate("userId", "username email profilePhoto");

    res.status(200).json({
      success: true,
      likedBy: likes,
      totalLikes: likes.length,
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Failed to retrieve likes for movie.", "DatabaseError"));
  }
};


const getLikesByUser = async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(errorHandler(400, "userId is required.", "ValidationError"));
  }

  try {
    const likes = await Likes.find({ userId }).populate("movieId", "title description");

    res.status(200).json({
      success: true,
      userLikes: likes,
      totalLikes: likes.length,
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Failed to retrieve likes by user.", "DatabaseError"));
  }
};

module.exports = {
  addLike,
  removeLike,
  getLikesForMovie,
  getLikesByUser,
};
