const mongoose = require("mongoose");

const rowSchema = new mongoose.Schema(
  {
    rowName: {
      type: String,
      required: true,
      uppercase: true,
      match: /^[A-Z]$/, 
      unique: true,
    },
    seatIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seat",
        unique: true, 
      },
    ],
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre", 
      required: true, 
    },
  },
  { timestamps: true }
);

rowSchema.pre("save", function (next) {
  this.totalSeats = this.seatIds.length;
  next();
});

rowSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update?.$set?.seatIds) {
    update.$set.totalSeats = update.$set.seatIds.length;
  }
  next();
});

const Row = mongoose.model("Row", rowSchema);
module.exports = Row;

// Row.collection.getIndexes().then(indexes => console.log(indexes));
// async function removeIncorrectIndex(){
//   try{
//     const indexes = await Row.collection.getIndexes();
//     console.log(indexes);

//     if (indexes.seatIds_1){
//       await Row.collection.dropIndex(" seatIds_1");
//       console.log("Dropped incorrect index :  seatIds_1");
//     } else {
//       console.log("incorrect index  seatIds_1 not found" );
//     }
    
//   }catch(error){
//     console.error("error removing incorrect index", error)
//   }
// }
// removeIncorrectIndex()