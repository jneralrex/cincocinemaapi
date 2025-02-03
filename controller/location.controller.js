const mongoose = require("mongoose");
const Cinema = require("../models/cinema.model");
const Location = require("../models/location.model");
const errorHandler = require("../utils/errorHandler");

const createLocation = async (req, res, next) => {
  const { state, city, street, theatreCinema } = req.body;

  // Validate required fields
  if (!state || !city || !street || !theatreCinema) {
    return next(errorHandler(400, "All fields including theatreCinema are required", "ValidationError"));
  }

  // Validate theatreCinema is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(theatreCinema)) {
    return next(errorHandler(400, "Invalid theatreCinema ID", "ValidationError"));
  }

  try {
    // Check if the Cinema exists
    const cinemaExists = await Cinema.findById(theatreCinema);
    if (!cinemaExists) {
      return next(errorHandler(404, "Cinema not found", "ValidationError"));
    }

    // Check if location with the same state already exists for the given cinema
    let location = await Location.findOne({ "location.state": state, theatreCinema });

    if (location) {
      // If state exists, add city to the state's cities array
      location.location[0].cities.push({ city, street });
    } else {
      // Create new location if state doesn't exist for the given cinema
      location = new Location({
        location: [
          {
            state,
            cities: [{ city, street }],
          },
        ],
        theatreCinema, // Store cinema ID
      });
    }

    await location.save();
    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
};


const editState = async (req, res, next) => {
  const { state, newState, theatreCinema } = req.body;

  if (!theatreCinema) {
    return next(errorHandler(400, "theatreCinema is required", "ValidationError"));
  }

  try {
    const location = await Location.findOne({ "location.state": state, theatreCinema });

    if (!location) {
      return next(errorHandler(404, "State not found for this cinema", "ValidationError"));
    }

    location.location[0].state = newState;
    await location.save();

    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};


const editCity = async (req, res, next) => {
  const { state, city, newCity, newStreet } = req.body;

  try {
    const location = await Location.findOne({ "location.state": state });

    if (!location) {
      return next(errorHandler(404, "State not found", "ValidationError"));
    }

    const cityIndex = location.location[0].cities.findIndex(
      (c) => c.city === city
    );

    if (cityIndex === -1) {
      return next(errorHandler(404, "City not found", "ValidationError"));
    }

    if (newCity) location.location[0].cities[cityIndex].city = newCity;
    if (newStreet)
      location.location[0].cities[cityIndex].street = newStreet;

    await location.save();
    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};

const deleteState = async (req, res, next) => {
  const { state } = req.params;

  try {
    const location = await Location.findOneAndUpdate(
      { "location.state": state },
      { $pull: { location: { state } } },
      { new: true }
    );

    if (!location) {
      return next(errorHandler(404, "State not found", "ValidationError"));
    }

    if (location.location.length === 0) {
      await Location.findByIdAndDelete(location._id);
      return res.status(200).json({
        message: "State deleted successfully and document removed",
      });
    }

    res.status(200).json({ message: "State deleted successfully", location });
  } catch (error) {
    next(error);
  }
};

const deleteCity = async (req, res, next) => {
  const { state, city } = req.params;

  try {
    const location = await Location.findOne({ "location.state": state });

    if (!location) {
      return next(errorHandler(404, "State not found", "ValidationError"));
    }

    const cityIndex = location.location[0].cities.findIndex(
      (c) => c.city === city
    );

    if (cityIndex === -1) {
      return next(errorHandler(404, "City not found", "ValidationError"));
    }

    location.location[0].cities.splice(cityIndex, 1);
    await location.save();

    res.status(200).json({ message: "City deleted successfully", location });
  } catch (error) {
    next(error);
  }
};

const getAllLocations = async (req, res, next) => {
  const { theatreCinema } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate that theatreCinema is provided
  if (!theatreCinema) {
    return next(errorHandler(400, "theatreCinema is required", "ValidationError"));
  }

  // Validate theatreCinema as a MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(theatreCinema)) {
    return next(errorHandler(400, "Invalid theatreCinema ID", "ValidationError"));
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (isNaN(pageNumber) || isNaN(limitNumber)) {
    return next(errorHandler(400, "Invalid pagination parameters", "ValidationError"));
  }

  try {
    const locations = await Location.find({ theatreCinema })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate({ path: "theatreCinema", select: "cinemaName" }); // Populate after filtering

    const totalLocation = await Location.countDocuments({ theatreCinema });

    res.status(200).json({
      success: true,
      locations,
      totalLocation,
      totalPages: Math.ceil(totalLocation / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleLocation = async (req, res, next) => {
  const { state } = req.params;

  try {
    const location = await Location.findOne({ "location.state": state });

    if (!location) {
      return next(errorHandler(404, "State not found", "ValidationError"));
    }

    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLocation,
  editState,
  editCity,
  deleteState,
  deleteCity,
  getAllLocations,
  getSingleLocation,
};
