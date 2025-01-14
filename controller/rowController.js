const rowModel = require('../models/rowmodel');
const errorHandler = require('../utils/errorHandler');


const rowController={
    
    // Create a new row
    async createRow(req, res, next) {
        try {
          const { rowName, seatCount } = req.body;
      
          const existingRow = await rowModel.findOne({ rowName });
          if (existingRow) {
            return next(errorHandler(403, "Row already exists", "ValidationError"));
          }
          const seats = Array.from({ length: seatCount }, (_, index) => ({
            seatId: index + 1,
          }));
      
          const newRow = new rowModel({
            rowName,
            seats,
          });
      
          await newRow.save();
          res.status(201).json({ message: 'Row created successfully', data: newRow });
        } catch (error) {
          next(error); 
        }
      },
      
      // Get all rows
      async getAllRows(req, res, next) {
        try {
            const rows = await rowModel.find();
            if (!rows.length) {
                return next(errorHandler(404, "No rows found", "NotFoundError"));
            }
            res.status(200).json({ data: rows });
        } catch (error) {
            return next(errorHandler(500, error.message, "ServerError"));
        }
    },
    

        // Get a single row by ID
        async getRowById(req, res, next) {
            try {
                const row = await rowModel.findById(req.params.id);
                if (!row) {
                    return next(errorHandler(404, "Row not found", "NotFoundError"));
                }
                res.status(200).json({ data: row });
            } catch (error) {
                return next(errorHandler(500, error.message, "ServerError"));
            }
        },
        

        // Update a row (edit row name or add seats)
        async updateRow(req, res, next) {
            try {
              const { rowName, newSeatCount } = req.body;
          
              const row = await rowModel.findById(req.params.id);
              if (!row) {
                return next(errorHandler(404, "Row not found", "NotFoundError"));
              }
          
              // Custom validation for duplicate rowName (if applicable)
              const existingRow = await rowModel.findOne({ rowName });
              if (existingRow && existingRow._id.toString() !== req.params.id) {
                return next(errorHandler(403, "Screen already exists", "ValidationError"));
              }
          
              if (rowName) row.rowName = rowName;
          
              if (newSeatCount) {
                const currentSeatCount = row.seats.length;
                const additionalSeats = Array.from({ length: newSeatCount }, (_, index) => ({
                  seatId: currentSeatCount + index + 1,
                }));
                row.seats.push(...additionalSeats);
              }
          
              await row.save();
              res.status(200).json({ message: 'Row updated successfully', data: row });
            } catch (error) {
              return next(errorHandler(500, error.message, "ServerError"));
            }
          },
          

        // Delete a row
        async deleteRow(req, res, next) {
            try {
              const row = await rowModel.findByIdAndDelete(req.params.id);
              
              if (!row) {
                return next(errorHandler(404, "Row not found", "NotFoundError"));
              }
              
              res.status(200).json({ message: 'Row deleted successfully' });
            } catch (error) {
              return next(errorHandler(500, error.message, "InternalError"));
            }
          }
  
}

module.exports = rowController;