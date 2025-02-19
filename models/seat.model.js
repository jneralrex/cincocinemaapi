const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: Number,
      required: true,
    },
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



// Seat.collection.getIndexes().then(indexes => console.log(indexes));
// async function removeIncorrectIndex(){
//   try{
//     const indexes = await Seat.collection.getIndexes();
//     console.log(indexes);

//     if (indexes.seatNumber_1){
//       await Seat.collection.dropIndex(" seatNumber_1");
//       console.log("Dropped incorrect index : seatNumber_1");
//     } else {
//       console.log("incorrect index  seatNumber_1 not found" );
//     }
    
//   }catch(error){
//     console.error("error removing incorrect index", error)
//   }
// }
// removeIncorrectIndex()