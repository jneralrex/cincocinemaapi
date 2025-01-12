const Location = require("../models/location.model");
const errorHandler = require("../utils/errorHandler");

const createLocation = async (req, res, next) => {
    const { state, city, street } = req.body;
  
    try {
      let location = await Location.findOne({ "location.state": state });
  
      if (location) {
        // If state already exists, add a city to the state's cities array
        location.location[0].cities.push({ city, street });
      } else {
        // Create new location if state doesn't exist
        location = new Location({
          location: [
            {
              state,
              cities: [{ city, street }],
            },
          ],
        });
      }
  
      await location.save();
      res.status(201).json(location);
    } catch (error) {
      next(error);
    }
};
  
const editState = async (req, res, next) => {
  const { state, newState } = req.body;

  try {
    const location = await Location.findOne({ "location.state": state });

    if (!location) {
      return next(errorHandler(404, "State not found", "ValidationError"));
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
    if (newStreet) location.location[0].cities[cityIndex].street = newStreet;

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
        return res.status(200).json({ message: "State deleted successfully and document removed" });
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
      return next(errorHandler("State not found", "ValidationError"));
    }

    const cityIndex = location.location[0].cities.findIndex(
      (c) => c.city === city
    );

    if (cityIndex === -1) {
      return next(errorHandler("City not found", "ValidationError"));
    }

    location.location[0].cities.splice(cityIndex, 1);
    await location.save();

    res.status(200).json({ message: "City deleted successfully", location });
  } catch (error) {
    next(error); 
  }
};

const getAllLocations = async (req, res, next) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (error) {
    next(error); 
  }
};

const getSingleLocation = async (req, res, next) => {
  const { state } = req.params;

  try {
    const location = await Location.findOne({ "location.state": state });

    if (!location) {
      return next(errorHandler("State not found", "ValidationError"));
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

