const mongoose = require("mongoose");
const Screen = require("../models/screen.model");
const errorHandler = require("../utils/errorHandler");

const createScreen = async (req, res, next) => {
  const { screenName, screenCapacity, screenType } = req.body;

  try {
    const checkScreen = await Screen.findOne({ screenName, screenCapacity, screenType });
    if (checkScreen) {
      return next(errorHandler(403, "Screen already exists", "ValidationError"));
    };

    const newScreen = new Screen({
      screenName,
      screenCapacity,
      screenType,
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
    const viewSelectedScreen = await Screen.findById(id);

    if (!viewSelectedScreen) {
      return next(errorHandler(404, `Screen with ID ${id} does not exist`, "ValidationError"));
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
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Screen ID", "ValidationError"));
  }

  try {
    const screen = await Screen.findByIdAndUpdate(id, req.body, { new: true });
    if (!screen) {
      return next(errorHandler(404, `Screen with ID ${id} does not exist`, "ValidationError"));
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
  try {
    const screens = await Screen.find();

    res.status(200).json({
      message: "All screens retrieved successfully",
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
