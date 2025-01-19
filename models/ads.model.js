const mongoose = require("mongoose");
const { config } = require("../config/config");

const adsSchema = new mongoose.Schema(
  {
    adsTitle: {
      type: String,
      required: true,
    },
    adsBody: {
      type: String,
      required: true,
    },
    adsImage: {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
      
    adsImagePublicId:{
        type: String, 
        required: true 
    },
    adsLink: {
      type: String,
      match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, "Invalid URL format"],
    },
    active: {
      type: Boolean,
      default: false,
    },
    durationDays: {
      type: Number,
      default: 30,
      required: true,
    },
    expireAt: {
      type: Date,
      default: function () {
        return new Date(
          Date.now() + this.durationDays * config.duration_checker
        );
      },
    },
  },
  { timestamps: true }
);

// Indexing the expireAt field the code below will automatically delete the document after the specified time but it is not recommended for production I will be using a cron job to delete the document

// adsSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
const Advertisement = mongoose.model("Advertisement", adsSchema);
module.exports = Advertisement;
