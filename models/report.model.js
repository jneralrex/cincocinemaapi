const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportTitle: {
      type: String,
      required: true,
      trim: true,
    },
    reportBody: {
      type: String,
      required: true,
      trim: true,
    },
    supportingImage: {
      type: String,
    },
    publicId: {
      type: String,
    },
    referenceType: {
      type: String,
      required: true,
      enum: ['movie', 'Event'], 
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceType', 
      required: true,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
