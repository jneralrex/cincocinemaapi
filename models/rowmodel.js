const mongoose = require('mongoose');

const rowSchema = new mongoose.Schema({
  rowName: {
    type: String,
    required: true,
    uppercase: true, 
    match: /^[A-Z]$/, 
  },
  seats: [
    {
      seatId: {
        type: Number,
        required: true,
      },
      isBooked: {
        type: Boolean,
        default: false, 
      },
    },
  ],
  totalSeats: {
    type: Number,
    default: 0, 
  },
});

// Pre-save middleware to keep totalSeats updated
rowSchema.pre('save', function (next) {
  this.totalSeats = this.seats.length;
  next();
});

const Row = mongoose.model('Row', rowSchema);

module.exports = Row;
