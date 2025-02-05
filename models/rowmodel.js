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
