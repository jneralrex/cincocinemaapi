const mongoose = require("mongoose");

const dateSchema = new mongoose.Schema({
  movie_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "movie",
    required: true,
  },
  date: { 
    type: Date, 
    required: true 
  },
  show_times: [
    {
      theatre_id: { type: mongoose.Schema.Types.ObjectId, ref: "Theatre", required: true },
      times: [
        {
          time: { type: String, required: true },
          screen_id: { type: mongoose.Schema.Types.ObjectId, ref: "Screen", required: true },
          price: { type: Number, required: true,},
        }
      ]
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model("Date", dateSchema);
