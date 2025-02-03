const mongoose = require("mongoose");
const Screen = require("../models/screen.model");
const errorHandler = require("../utils/errorHandler");
const Theatre = require("../models/theatre.model");

const createScreen = async (req, res, next) => {
  const { screenName, screenCapacity, screenType } = req.body;
  const { theatre } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(theatre)) {
      return next(errorHandler(400, "Invalid theatre ID", "ValidationError"));
    }

    const checkTheatre = await Theatre.findById(theatre);
    if (!checkTheatre) {
      return next(errorHandler(404, "Theatre does not exist", "NotFound"));
    }

    const checkScreen = await Screen.findOne({ screenName, theatre });
    if (checkScreen) {
      return next(errorHandler(403, "Screen already exists in this theatre", "ValidationError"));
    }

    const newScreen = new Screen({
      screenName,
      screenCapacity,
      screenType,
      theatre,
    });

    await newScreen.save();
    res.status(201).json({
      message: "Screen created successfully",
      newScreen,
    });
  } catch (error) {
    next(error);
  }
};

const viewScreen = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Screen ID", "ValidationError"));
  };

  try {
    const viewSelectedScreen = await Screen.findById(id).populate("theatre");

    if (!viewSelectedScreen) {
      return next(errorHandler(404, `Screen with this ID does not exist`, "ValidationError"));
    }

    res.status(200).json({
      message: "Screen retrieved successfully",
      viewSelectedScreen,
    });
  } catch (error) {
    next(error);
  }
};

const editScreen = async (req, res, next) => {
  const { id, theatre } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(theatre)) {
      return next(errorHandler(400, "Invalid screen or theatre ID", "ValidationError"));
    }

    const checkTheatre = await Theatre.findById(theatre);
    if (!checkTheatre) {
      return next(errorHandler(404, "Theatre does not exist", "NotFound"));
    }

    const screen = await Screen.findOneAndUpdate(
      { _id: id, theatre }, req.body,  { new: true } );

    if (!screen) {
      return next(errorHandler(404, `Screen with ID ${id} does not exist in this theatre`, "ValidationError"));
    }

    res.status(200).json({
      message: "Screen updated successfully",
      screen,
    });
  } catch (error) {
    next(error);
  }
};

const deleteScreen = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)){
    return next(errorHandler(400, "Invalid Screen ID", "ValidationError"));
  }

  try {
    const screen = await Screen.findByIdAndDelete(id);
    if (!screen) {
      return next(errorHandler(404, `Screen with ID ${id} does not exist`, "ValidationError"));
    }

    res.status(200).json({
      message: "Screen deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const viewAllScreens = async (req, res, next) => {
  const { theatre } = req.params; 

  try {
    if (!mongoose.Types.ObjectId.isValid(theatre)) {
      return next(errorHandler(400, "Invalid theatre ID", "ValidationError"));
    }

    const screens = await Screen.find({ theatre }); 

    res.status(200).json({
      message: "Screens retrieved successfully",
      screens,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createScreen,
  viewScreen,
  editScreen,
  deleteScreen,
  viewAllScreens,
};
