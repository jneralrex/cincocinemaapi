const seatModel = require('../models/seat.model');
const errorHandler = require('../utils/errorHandler');

const seatController = {
  // Create a new seat
  async createSeat(req, res, next) {
    try {
      const { seatNumber, isBlocked, isBought, theatre } = req.body;

      if (!theatre) {
        return next(errorHandler(400, 'Theatre ID is required', 'ValidationError'));
      }

      const existingSeat = await seatModel.findOne({ seatNumber, theatre });
      if (existingSeat) {
        return next(errorHandler(403, 'Seat already exists in this theatre', 'ValidationError'));
      }

      const newSeat = new seatModel({
        seatNumber,
        isBlocked: isBlocked || false,
        isBought: isBought || false,
        theatre, 
      });

      await newSeat.save();
      res.status(201).json({ message: 'Seat created successfully!', data: newSeat });
    } catch (error) {
      return next(errorHandler(500, error.message, error.name || 'ServerError'));
    }
  },

  // Get all seats (Populate theatre)
  async getAllSeats(req, res, next) {
    try {
      const seats = await seatModel.find().populate('theatre', 'theatreName theatreLocation'); 
      res.status(200).json({ data: seats });
    } catch (error) {
      return next(errorHandler(500, error.message, error.name || 'ServerError'));
    }
  },

  // Get a seat by ID (Populate theatre)
  async getSeatById(req, res, next) {
    try {
      const { id } = req.params;

      const seat = await seatModel.findById(id).populate('theatre', 'theatreName theatreLocation');
      if (!seat) {
        return next(errorHandler(404, 'Seat not found', 'NotFoundError'));
      }

      res.status(200).json({ data: seat });
    } catch (error) {
      return next(errorHandler(500, error.message, error.name || 'ServerError'));
    }
  },

  // Update a seat
  async updateSeat(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedSeat = await seatModel.findByIdAndUpdate(id, updates, {
        new: true, 
        runValidators: true, 
      }).populate('theatre', 'theatreName theatreLocation'); 

      if (!updatedSeat) {
        return next(errorHandler(404, 'Seat not found', 'NotFoundError'));
      }

      res.status(200).json({ message: 'Seat updated successfully!', data: updatedSeat });
    } catch (error) {
      return next(errorHandler(500, error.message, error.name || 'ServerError'));
    }
  },

  // Delete a seat
  async deleteSeat(req, res, next) {
    try {
      const { id } = req.params;

      const deletedSeat = await seatModel.findByIdAndDelete(id);
      if (!deletedSeat) {
        return next(errorHandler(404, 'Seat not found', 'NotFoundError'));
      }

      res.status(200).json({ message: 'Seat deleted successfully!', data: deletedSeat });
    } catch (error) {
      return next(errorHandler(500, error.message, error.name || 'ServerError'));
    }
  },
};

module.exports = seatController;
