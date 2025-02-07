const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: Number,
      required: true,
    },
<<<<<<< Updated upstream
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isBought: {
      type: Boolean,
      default: false,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true, 
    },
  },
  { timestamps: true }
);

const Seat = mongoose.model("Seat", seatSchema);

module.exports = Seat;
=======
    { timestamps: true } 
  );
  
  const Seat = mongoose.model('Seat',seatSchema);
  
  module.exports = Seat;
>>>>>>> Stashed changes
