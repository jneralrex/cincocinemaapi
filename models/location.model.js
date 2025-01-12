const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  location: [
    {
      state: {
        type: String,
        required: true,
        toLowerCase: true,
      },
      cities: [
        {
          city: {
            type: String,
            required: true,
            toLowerCase: true,
          },
          street: {
            type: String,
            required: true,
            toLowerCase: true,
          },
        },
      ],
    },
  ],
},{
  timestamps: true
});

const Location = mongoose.model("Location", locationSchema);
module.exports = Location;
