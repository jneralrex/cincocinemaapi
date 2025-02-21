const Rating = require("../models/rating.model")
const errorHandler = require("../utils/errorHandler")


const addRating = async(req, res, next) =>{
    const { userId, movieId, rating } = req.body;

    if(!userId || !movieId){
        return next(errorHandler(400, "userId and movieId are required.", "ValidationError"));
    }

    try {
        const existingRating = await Rating.findOne({ userId, movieId });
    
        if (existingRating) {
          return next(errorHandler(403, "You cannot Rate a movie more than once.", "NotAllowed"));
        }
    
        const newRating = await Rating.create({ userId, movieId, rating});
    
        res.status(201).json({
          success: true,
          data: newRating,
          message: "rating added successfully.",
        });
      } catch (error) {
        console.error(error);
        return next(errorHandler(500, "Failed to add rating.", "DatabaseError"));
      }
};


const removeRating = async (req, res, next) => {
    const { userId, movieId } = req.body;
  
    if (!userId || !movieId) {
      return next(errorHandler(400, "userId and movieId are required.", "ValidationError"));
    }
  
    try {
      const rating = await Rating.findOneAndDelete({ userId, movieId });
  
      if (!rating) {
        return next(errorHandler(404, "rating not found.", "NotFoundError"));
      }
  
      res.status(200).json({
        success: true,
        message: "rating removed successfully.",
      });
    } catch (error) {
      console.error(error);
      return next(errorHandler(500, "Failed to remove rating.", "DatabaseError"));
    }
  };
  
  const getRatingForMovie = async (req, res, next) => {
    const { movieId } = req.params;
  
    if (!movieId) {
      return next(errorHandler(400, "movieId is required.", "ValidationError"));
    }
  
    try {
      const rating = await Rating.find({ movieId }).populate("userId", "username email profilePhoto");
  
      res.status(200).json({
        success: true,
        ratedBy: rating,
        totalRating: rating.length,
      });
    } catch (error) {
      console.error(error);
      return next(errorHandler(500, "Failed to retrieve rating for movie.", "DatabaseError"));
    }
  };

  const getRatingByUser = async (req, res, next) => {
    const { userId } = req.params;
  
    if (!userId) {
      return next(errorHandler(400, "userId is required.", "ValidationError"));
    }
  
    try {
      const rating = await Rating.find({ userId }).populate("movieId", "title description");
  
      res.status(200).json({
        success: true,
        userRating: rating,
        totalRating: rating.length,
      });
    } catch (error) {
      console.error(error);
      return next(errorHandler(500, "Failed to retrieve rating by user.", "DatabaseError"));
    }
  };

  module.exports = {
    addRating,
    removeRating,
    getRatingForMovie,
    getRatingByUser,
  };