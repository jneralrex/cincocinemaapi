const mongoose = require("mongoose");
const errorHandler = require("../utils/errorHandler");
const { cloudinary } = require("../config/config");
const Report = require("../models/report.model");
const Movie = require("../models/movie.model");
const Event = require("../models/event.model");

const createReport = async (req, res, next) => {
  const { reportTitle, reportBody, referenceType, referenceId } = req.body;
  const file = req.file;

  try {
    if (!reportTitle || !reportBody || !referenceType || !referenceId) {
      return next(errorHandler(400, "Missing required fields", "ValidationError"));
    }

    let referenceExists = false;
    if (referenceType === 'movie') {
      referenceExists = await Movie.exists({ _id: referenceId });
    } else if (referenceType === 'event') {
      referenceExists = await Event.exists({ _id: referenceId });
    } else {
      return next(errorHandler(400, "Invalid referenceType", "ValidationError"));
    }

    if (!referenceExists) {
      return next(errorHandler(404, `${referenceType} with ID ${referenceId} not found`, "NotFoundError"));
    }

    const uploadResponse = file 
      ? await cloudinary.uploader.upload(file.path, { folder: "reports"})
      : null;

    const newReport = new Report({
      reportTitle,
      reportBody,
      referenceType,
      referenceId,
      supportingImage: uploadResponse ? uploadResponse.secure_url : undefined,
      publicId: uploadResponse ? uploadResponse.public_id : undefined,
    });

    await newReport.save();
    res.status(201).json({
      message: "Report created successfully",
      report: newReport,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(errorHandler(400, "Invalid Report ID", "ValidationError"));
    }
  
    try {
      const report = await Report.findById(id);
      if (!report) {
        return next(errorHandler(404, `Report with ID ${id} not found`, "NotFoundError"));
      }
  
      if (report.publicId) {
        await cloudinary.uploader.destroy(report.publicId);
      }
  
      await Report.findByIdAndDelete(id);
  
      let referenceExists = false;
      if (report.referenceType === 'movie') {
        referenceExists = await Movie.exists({ _id: report.referenceId });
      } else if (report.referenceType === 'event') {
        referenceExists = await Event.exists({ _id: report.referenceId });
      }
  
      if (!referenceExists) {
        return next(errorHandler(404, `${report.referenceType} with ID ${report.referenceId} not found`, "NotFoundError"));
      }
  
      res.status(200).json({
        message: "Report deleted successfully",
      });
    } catch (error) {
      next(error);
    }
 };
  

const viewReport = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Report ID", "ValidationError"));
  }

  try {
    const report = await Report.findById(id);
    if (!report) {
      return next(errorHandler(404, `Report with ID ${id} not found`, "NotFoundError"));
    }

    let referenceExists = false;
    if (report.referenceType === 'movie') {
      referenceExists = await Movie.exists({ _id: report.referenceId });
    } else if (report.referenceType === 'event') {
      referenceExists = await Event.exists({ _id: report.referenceId });
    }

    if (!referenceExists) {
      return next(errorHandler(404, `${report.referenceType} with ID ${report.referenceId} not found`, "NotFoundError"));
    }

    res.status(200).json({
      message: "Report retrieved successfully",
      report,
    });
  } catch (error) {
    next(error);
  }
};

const editReport = async (req, res, next) => {
  const { id } = req.params;
  const file = req.file;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Report ID", "ValidationError"));
  }

  try {
    const report = await Report.findById(id);
    if (!report) {
      return next(errorHandler(404, `Report with ID ${id} not found`, "NotFoundError"));
    }

    let referenceExists = false;
    if (report.referenceType === 'movie') {
      referenceExists = await Movie.exists({ _id: report.referenceId });
    } else if (report.referenceType === 'event') {
      referenceExists = await Event.exists({ _id: report.referenceId });
    }

    if (!referenceExists) {
      return next(errorHandler(404, `${report.referenceType} with ID ${report.referenceId} not found`, "NotFoundError"));
    }

    let updatedData = req.body;

    if (file) {
      await cloudinary.uploader.destroy(report.publicId);
      const uploadResponse = await cloudinary.uploader.upload(file.path, {
        folder: "reports",
      });

      updatedData.supportingImage = uploadResponse.secure_url;
      updatedData.publicId = uploadResponse.public_id;
    }

    const updatedReport = await Report.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({
      message: "Report updated successfully",
      report: updatedReport,
    });
  } catch (error) {
    next(error);
  }
};

const viewAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find();

    for (let report of reports) {
      let referenceExists = false;
      if (report.referenceType === 'movie') {
        referenceExists = await Movie.exists({ _id: report.referenceId });
      } else if (report.referenceType === 'event') {
        referenceExists = await Event.exists({ _id: report.referenceId });
      }

      if (!referenceExists) {
        return next(errorHandler(404, `${report.referenceType} with ID ${report.referenceId} not found`, "NotFoundError"));
      }
    }

    res.status(200).json({
      message: "All reports retrieved successfully",
      reports,
      total:reports.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  viewReport,
  editReport,
  deleteReport,
  viewAllReports,
};
