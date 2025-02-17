const Comments = require("../models/comment.model");
const errorHandler = require("../utils/errorHandler");


const addComment = async (req, res, next) => {
  const { userId, movieId } = req.body;

  if (!userId || !movieId) {
    return next(errorHandler(400, "userId and movieId are required.", "ValidationError"));
  }
  try {
    const Comment = await Comments.create({ userId, movieId });
    res.status(201).json({
      success: true,
      data: Comment,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Failed to add Comment.", "DatabaseError"));
  }
};


const removeComment = async (req, res, next) => {
  const { userId, movieId } = req.body;

  if (!userId || !movieId) {
    return next(errorHandler(400, "userId and movieId are required.", "ValidationError"));
  }

  try {
    const Comment = await Comments.findOneAndDelete({ userId, movieId });

    if (!Comment) {
      return next(errorHandler(404, "Comment not found.", "NotFoundError"));
    }

    res.status(200).json({
      success: true,
      message: "Comment removed successfully.",
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Failed to remove Comment", "DatabaseError"));
  }
};


const getCommentForMovie = async (req, res, next) => {
  const { movieId } = req.params;

  if (!movieId) {
    return next(errorHandler(400, "movieId is required.", "ValidationError"));
  }

  try {
    const Comment = await Comments.find({ movieId }).populate("userId", "username email profilePhoto");

    res.status(200).json({
      success: true,
      CommentBy: Comment,
      totalComment: Comment.length,
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Failed to retrieve comment for movie.", "DatabaseError"));
  }
};


const getCommentByUser = async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(errorHandler(400, "userId is required.", "ValidationError"));
  }

  try {
    const Comment = await Comments.find({ userId }).populate("movieId", "title description");

    res.status(200).json({
      success: true,
      userComment: Comment,
      totalComment: Comment.length,
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Failed to retrieve Comment by user.", "DatabaseError"));
  }
};

module.exports = {
  addComment,
  removeComment,
  getCommentForMovie,
  getCommentByUser,
};
