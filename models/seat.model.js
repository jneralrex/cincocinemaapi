const mongoose = require("mongoose");
const seatSchema = new mongoose.Schema(
    {
      seatNumber: {
        type: Number,
        required: true,
        unique: true, 
      },
      isBlocked: {
        type: Boolean,
        default: false, 
      },
      isBought: {
        type: Boolean,
        default: false, 
      },
    },
    { timestamps: true } 
  );
  
  const Seat = mongoose.model('Seat', seatSchema);
  
  module.exports = Seat;