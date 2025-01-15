const rowModel = require('../models/rowmodel');

const rowController={
    
    // Create a new row
    async createRow  (req, res) {
        try {
          const { rowName, seatCount } = req.body;
      
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
          res.status(500).json({ error: error.message });
        }
      },

      // Get all rows
        async getAllRows   (req, res)  {
            try {
            const rows = await rowModel.find();
            res.status(200).json({ data: rows });
            } catch (error) {
            res.status(500).json({ error: error.message });
            }
        },

        // Get a single row by ID
        async getRowById  (req, res)  {
            try {
            const row = await rowModel.findById(req.params.id);
            if (!row) {
                return res.status(404).json({ message: 'Row not found' });
            }
            res.status(200).json({ data: row });
            } catch (error) {
            res.status(500).json({ error: error.message });
            }
        },

        // Update a row (edit row name or add seats)
        async updateRow  (req, res)  {
                try {
                const { rowName, newSeatCount } = req.body;
            
                const row = await rowModel.findById(req.params.id);
                if (!row) {
                    return res.status(404).json({ message: 'Row not found' });
                }
            
                if (rowName) row.rowName = rowName;
            
                if (newSeatCount) {
                    const currentSeatCount = row.seats.length;
                    const additionalSeats = Array.from(
                    { length: newSeatCount },
                    (_, index) => ({
                        seatId: currentSeatCount + index + 1,
                    })
                    );
                    row.seats.push(...additionalSeats);
                }
            
                await row.save();
                res.status(200).json({ message: 'Row updated successfully', data: row });
                } catch (error) {
                res.status(500).json({ error: error.message });
                }
        },

        // Delete a row
    async deleteRow  (req, res) {
    try {
      const row = await rowModel.findByIdAndDelete(req.params.id);
      if (!row) {
        return res.status(404).json({ message: 'Row not found' });
      }
      res.status(200).json({ message: 'Row deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
}

module.exports = rowController;