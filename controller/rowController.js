const rowModel = require("../models/rowmodel");
const theatreModel = require("../models/theatre.model"); 
const errorHandler = require("../utils/errorHandler");

const rowController = {
  // Create a new row
  async createRow(req, res, next) {
    try {
      const { rowName, seatIds, theatre } = req.body;

      if (!rowName || typeof rowName !== "string") {
        return next(errorHandler(400, "Row name is required and must be a string", "ValidationError"));
      }

      if (!theatre) {
        return next(errorHandler(400, "Theatre ID is required", "ValidationError"));
      }

      const theatreExists = await theatreModel.findById(theatre);
      if (!theatreExists) {
        return next(errorHandler(404, "Theatre not found", "NotFoundError"));
      }

      const existingRow = await rowModel.findOne({ rowName, theatre });
      if (existingRow) {
        return next(errorHandler(409, "Row already exists in this theatre", "ValidationError"));
      }

      const newRow = new rowModel({
        rowName,
        seatIds: seatIds || [],
        theatre, 
      });

      await newRow.save();

      res.status(201).json({
        message: "Row created successfully",
        data: newRow,
      });
    } catch (error) {
      console.error("Error in createRow:", error);
      next(errorHandler(500, error.message, "ServerError"));
    }
  },

  // Get all rows
  async getAllRows(req, res, next) {
    try {
      const rows = await rowModel.find().populate("theatre").populate("seatIds");
      if (!rows.length) {
        return next(errorHandler(404, "No rows found", "NotFoundError"));
      }
      res.status(200).json({ data: rows, totalRows: rows.length });
    } catch (error) {
      next(errorHandler(500, error.message, "ServerError"));
    }
  },

  // Get a single row by ID
  async getRowById(req, res, next) {
    try {
      const row = await rowModel.findById(req.params.id).populate("theatre").populate("seatIds");
      if (!row) {
        return next(errorHandler(404, "Row not found", "NotFoundError"));
      }
      res.status(200).json({ data: row });
    } catch (error) {
      next(errorHandler(500, error.message, "ServerError"));
    }
  },

  // Update a row (edit row name, seats, or theatre)
  async updateRow(req, res, next) {
    try {
      const { rowName, theatre } = req.body;

      const row = await rowModel.findById(req.params.id);
      if (!row) {
        return next(errorHandler(404, "Row not found", "NotFoundError"));
      }

      if (theatre) {
        const theatreExists = await theatreModel.findById(theatre);
        if (!theatreExists) {
          return next(errorHandler(404, "Theatre not found", "NotFoundError"));
        }
        row.theatre = theatre; 
      }

      if (rowName) {
        const existingRow = await rowModel.findOne({ rowName, theatre: row.theatre });
        if (existingRow && existingRow._id.toString() !== req.params.id) {
          return next(errorHandler(409, "Row name already exists in this theatre", "ValidationError"));
        }
        row.rowName = rowName;
      }

      await row.save();
      res.status(200).json({ message: "Row updated successfully", data: row });
    } catch (error) {
      next(errorHandler(500, error.message, "ServerError"));
    }
  },

  // Delete a row
  async deleteRow(req, res, next) {
    try {
      const row = await rowModel.findByIdAndDelete(req.params.id);
      if (!row) {
        return next(errorHandler(404, "Row not found", "NotFoundError"));
      }
      res.status(200).json({ message: "Row deleted successfully" });
    } catch (error) {
      next(errorHandler(500, error.message, "InternalError"));
    }
  },
};

module.exports = rowController;
