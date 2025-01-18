const seatModel = require('../models/seat.model');
const errorHandler = require('../utils/errorHandler'); 

const seatController = {
  // Create a new seat
  async createSeat(req, res, next) {
    try {
      const { seatNumber, isBlocked, isBought } = req.body;

      const existingSeat = await seatModel.findOne({ seatNumber });
      if (existingSeat) {
        return next(errorHandler(403, 'Seat already exists', 'ValidationError'));
      }

      const newSeat = new seatModel({
        seatNumber,
        isBlocked: isBlocked || false,
        isBought: isBought || false,
      });

      await newSeat.save();
      res.status(201).json({ message: 'Seat created successfully!', data: newSeat });
    } catch (error) {
      return next(errorHandler(500, error.message, error.name || 'ServerError'));
    }
  },

  // Get all seats
  async getAllSeats(req, res, next) {
    try {
      const seats = await seatModel.find();
      res.status(200).json({ data: seats });
    } catch (error) {
      return next(errorHandler(500, error.message, error.name || 'ServerError'));
    }
  },

  // Get a seat by ID
  async getSeatById(req, res, next) {
    try {
      const { id } = req.params;

      const seat = await seatModel.findById(id);
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
      });

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

