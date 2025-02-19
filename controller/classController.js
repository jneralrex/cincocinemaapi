const mongoose = require("mongoose");
const classModel = require('../models/classmodel');
const theatreModel = require("../models/theatre.model"); 
const errorHandler = require('../utils/errorHandler');

const classController = {
    
    // Create a new class
    async  createClass(req, res, next) {
      try {
        const { className, numberOfRows, price, availability, theatre } = req.body;
        console.log("Request Body:", req.body); 
    
        if (!theatre) {
          return next(errorHandler(400, "Theatre ID is required", "ValidationError"));
        }
    
        if (!mongoose.Types.ObjectId.isValid(theatre)) {
          return next(errorHandler(400, "Invalid theatre ID format", "ValidationError"));
        }
    
        const existingTheatre = await theatreModel.findById(theatre);
        if (!existingTheatre) {
          return next(errorHandler(404, "Theatre not found", "NotFoundError"));
        }
    
        const classes = new classModel({
          className,
          numberOfRows,
          price,
          availability,
          theatre,
        });
    
        await classes.save();
    
        res.status(201).json({ message: "Class created successfully!", data: classes });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
        return next(errorHandler(500, error.message, error.name || "InternalError"));
      }
    },
    
    // Get all classes (with theatre details)
    async getAllClasses(req, res, next) {
      try {
        const allClasses = await classModel.find().populate("theatre"); 
        res.status(200).json(allClasses);
      } catch (error) {
        return next(errorHandler(500, "Failed to retrieve classes", "ServerError"));
      }
    },

    // Get a single class by ID (with theatre details)
    async getClassById(req, res, next) {
      try {
        const { id } = req.params;
        const seatClass = await classModel.findById(id).populate("theatre"); 

        if (!seatClass) {
          return next(errorHandler(404, "Seat class not found", "NotFoundError"));
        }

        res.status(200).json(seatClass);
      } catch (error) {
        next(errorHandler(500, error.message, "ServerError"));
      }
    },

    // Update a class by ID
    async updateClass(req, res, next) {
      try {
        const { id } = req.params;
        const updates = req.body;
  
        const updatedClass = await classModel.findByIdAndUpdate(id, updates, {
          new: true, 
          runValidators: true, 
        }).populate("theatre"); 
  
        if (!updatedClass) {
          return next(errorHandler(404, "Seat class not found", "NotFoundError"));
        }
  
        res.status(200).json({
          message: 'Seat class updated successfully!',
          data: updatedClass,
        });
      } catch (error) {
        if (error.name === "ValidationError") {
          return next(errorHandler(400, error.message, "ValidationError"));
        }
        return next(errorHandler(500, "Internal Server Error", "ServerError"));
      }
    },
  
    // Delete a seat class by ID
    async deleteClass(req, res, next) {
      try {
        const { id } = req.params;

        const deletedClass = await classModel.findByIdAndDelete(id);

        if (!deletedClass) {
          return next(errorHandler(404, "Seat class not found", "NotFoundError"));
        }

        res.status(200).json({
          message: 'Seat class deleted successfully!',
          data: deletedClass,
        });
      } catch (error) {
        return next(errorHandler(500, error.message, "InternalServerError"));
      }
    },
};

module.exports = classController;
