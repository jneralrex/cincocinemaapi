const mongoose = require("mongoose");
const { config } = require("../config/config");

const adsSchema = new mongoose.Schema(
    {
      adsTitle: {
        type: String,
        required: [true, "Ad title is required"],
      },
      adsBody: {
        type: String,
        required: [true, "Ad body is required"],
        trim: true,
      },
      adsLink: {
        type: String,
        match: [
          /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
          "Invalid URL format. Ensure it starts with http:// or https://",
        ],
      },
      active: {
        type: Boolean,
        default: false,
      },
      durationDays: {
        type: Number,
        default: 0,
        required: true,
        min: [1, "Duration must be at least 1 day"],
      },
      expireAt: {
        type: Date,
        default: function () {
          return this.durationDays > 0
            ? new Date(Date.now() + this.durationDays * config.duration_checker)
            : null;
        },
      },
    },
    { timestamps: true }
  );
  

  

// Indexing the expireAt field the code below will automatically delete the document after the specified time but it is not recommended for production I will be using a cron job to delete the document

// adsSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
const Advertisement = mongoose.model("Advertisement", adsSchema);
module.exports = Advertisement;
