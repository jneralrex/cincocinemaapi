const { mongoose } = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    date: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Date",
      required: true,
    },
    seatSelected:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
      required: true,
    }],
    clientType: {
      type: String,
      required: true,
      enum: ["User", "Counter"],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "clientType",
      required: true,
    },
    bookingFor:{
      type:String,
      required:true,
      toLowerCase:true,
      trim:true
      }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
