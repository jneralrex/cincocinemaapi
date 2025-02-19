const mongoose = require("mongoose");
const { config } = require("../config/config");

const cinemaSchema = new mongoose.Schema(
  {
    cinemaName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    ownerFirstName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerLastName: {
      type: String,
      required: true,
      trim: true,
    },
    cinemaEmail: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    role: {
      type: String,
      default: config.cenima_role,
    },
    cinemaPhoneNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false,

    },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: Date,
    otpRequestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


const Cinema = mongoose.model("Cinema", cinemaSchema);
module.exports = Cinema;

// Cinema.collection.getIndexes().then(indexes => console.log(indexes));
// async function removeIncorrectIndex() {
//   try {
//     const indexes = await Cinema.collection.getIndexes();
//     console.log(indexes);

//     // Check if the incorrect index exists before trying to drop it
//     if (indexes.cenimaPhoneNumber_1) {
//       await Cinema.collection.dropIndex("cenimaPhoneNumber_1");
//       console.log("Dropped incorrect index: cenimaEmail_1");
//     } else {
//       console.log("Incorrect index 'cenimaEmail_1' not found.");
//     }
//   } catch (error) {
//     console.error("Error removing incorrect index:", error);
//   }
// }

// // Call the function
// removeIncorrectIndex();