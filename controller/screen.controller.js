const Screen = require("../models/screen.model");
const errorHandler = require("../utils/errorHandler");

const createScreen = async (req, res, next) => {
    const { screenName, screenCapacity, screenType } = req.body;
  
    try {
      const checkScreen = await Screen.findOne({ screenName, screenCapacity, screenType });
      if (checkScreen) {
        return next(errorHandler(403, "Screen already exists", "ValidationError"));
      }
  
      const newScreen = new Screen({
        screenName,
        screenCapacity,
        screenType,
      });
  
      await newScreen.save();
      res.status(200).json({ message: "Screen created successfully", newScreen });
    } catch (error) {
      next(error); 
    }
  };
  

  const viewScreen = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const viewSelectedScreen = await Screen.findById(id);
  
      if (!viewSelectedScreen) {
        return next(errorHandler(404, `Screen with ID ${id} does not exist`, "ValidationError"));
      }
  
      res.status(200).json(viewSelectedScreen);
    } catch (error) {
      next(error); 
    }
  };
  

  module.exports = { createScreen, viewScreen };
