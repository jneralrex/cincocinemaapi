const mongoose = require('mongoose');

const rowSchema = new mongoose.Schema({
  rowName: {
    type: String,
    required: true,
    uppercase: true,
    match: /^[A-Z]$/, 
  },
  seatIds: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Seat', 
      required: true,
    },
  ],
  totalSeats: {
    type: Number,
    default: 0,
  },
});

// Pre-save middleware to update totalSeats dynamically
rowSchema.pre('save', function (next) {
  // Calculate total seats based on the seatIds array length
  this.totalSeats = this.seatIds.length;
  next();
});

// Pre-update middleware for `findOneAndUpdate` and similar operations
rowSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set.seatIds) {
    const totalSeats = update.$set.seatIds.length;
    update.$set.totalSeats = totalSeats; // Dynamically set totalSeats
  }
  next();
});

const Row = mongoose.model('Row', rowSchema);

module.exports = Row;
