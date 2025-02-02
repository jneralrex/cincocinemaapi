const mongoose = require("mongoose");
const errorHandler = require("../utils/errorHandler");
const Theatre = require("../models/theatre.model");
const Location = require("../models/location.model");
const Cinema = require("../models/cinema.model");

const createTheatre = async (req, res, next) => {
  const { theatreName, theatreLocation } = req.body;
  const { theatreCinema } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(theatreCinema)) {
      return next(errorHandler(400, "Invalid cinema ID", "ValidationError"));
    }
    if (!mongoose.Types.ObjectId.isValid(theatreLocation)) {
      return next(errorHandler(400, "Invalid location ID", "ValidationError"));
    }

    const locationExists = await Location.findById(theatreLocation);
    if (!locationExists) {
      return next(errorHandler(404, "Location does not exist", "ValidationError"));
    }

    const cinemaExists = await Cinema.findById(theatreCinema);
    if (!cinemaExists) {
      return next(errorHandler(404, "Cinema does not exist", "ValidationError"));
    }

    const checkTheatre = await Theatre.findOne({ theatreName, theatreLocation });
    if (checkTheatre) {
      return next(errorHandler(403, "Theatre already exists", "ValidationError"));
    }

    const newTheatre = new Theatre({ theatreName, theatreLocation, theatreCinema });
    await newTheatre.save();

    res.status(201).json({
      message: "Theatre created successfully",
      newTheatre,
    });
  } catch (error) {
    next(error);
  }
};

const viewTheatre = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Theatre ID", "ValidationError"));
  }

  try {
    const theatre = await Theatre.findById(id)
      .populate({
        path: 'theatreCinema',
        select: 'cinemaName ownerFirstName ownerLastName', 
      })
      .populate('theatreLocation'); 

    if (!theatre) {
      return next(errorHandler(404, `Theatre with this ID does not exist`, "ValidationError"));
    }

    res.status(200).json({
      message: "Theatre retrieved successfully",
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

const editTheatre = async (req, res, next) => {
  const { id, theatreCinema } = req.params;
  const { theatreName, theatreLocation } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Theatre ID", "ValidationError"));
  }

  if (theatreCinema && !mongoose.Types.ObjectId.isValid(theatreCinema)) {
    return next(errorHandler(400, "Invalid cinema ID", "ValidationError"));
  }

  try {
    const theatre = await Theatre.findById(id);
    if (!theatre) {
      return next(errorHandler(404, `Theatre with this ID does not exist`, "ValidationError"));
      
    }

    theatre.theatreName = theatreName || theatre.theatreName;
    theatre.theatreLocation = theatreLocation || theatre.theatreLocation;

    await theatre.save();

    res.status(200).json({
      message: "Theatre updated successfully",
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTheatre = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Theatre ID", "ValidationError"));
  }

  try {
    const theatre = await Theatre.findByIdAndDelete(id);
    if (!theatre) {
      return next(errorHandler(404, `Theatre with ID ${id} does not exist`, "ValidationError"));
    }

    res.status(200).json({
      message: "Theatre deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const viewAllTheatres = async (req, res, next) => {
  const { cinemaId, locationId } = req.query; 

  let filter = {};
  
  if (cinemaId) {
    if (!mongoose.Types.ObjectId.isValid(cinemaId)) {
      return next(errorHandler(400, "Invalid Cinema ID", "ValidationError"));
    }
    filter.theatreCinema = cinemaId;
  }

  if (locationId) {
    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      return next(errorHandler(400, "Invalid Location ID", "ValidationError"));
    }
    filter.theatreLocation = locationId;
  }

  try {
    const theatres = await Theatre.find(filter).populate("theatreLocation theatreCinema");

    res.status(200).json({
      message: "All theatres for this cinema retrieved successfully",
      theatres,
      total: theatres.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTheatre,
  viewTheatre,
  editTheatre,
  deleteTheatre,
  viewAllTheatres,
};
