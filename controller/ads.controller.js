const mongoose = require("mongoose");
const Advertisement = require("../models/ads.model");
const errorHandler = require("../utils/errorHandler");

const createAds = async (req, res, next) => {
  const { adsTitle, adsBody, adsImage, adsLink } = req.body;

  try {
    const checkAds = await Advertisement.findOne({ adsTitle, adsBody });
    if (checkAds) {
      return next(errorHandler(403, "Advertisement already exists", "ValidationError"));
    }

    const newAds = new Advertisement({
      adsTitle,
      adsBody,
      adsImage,
      adsLink,
    });

    await newAds.save();
    res.status(201).json({
      message: "Advertisement created successfully",
      data: newAds,
    });
  } catch (error) {
    next(error);
  }
};

const viewAllAds = async (req, res, next) => {
  try {
    const allAds = await Advertisement.find();
    res.status(200).json({
      message: "All advertisements fetched successfully",
      data: allAds,
    });
  } catch (error) {
    next(error);
  }
};

const viewSingleAds = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Advertisement ID", "ValidationError"));
  }

  try {
    const singleAds = await Advertisement.findById(id);
    if (!singleAds) {
      return next(errorHandler(404, "Advertisement not found", "NotFound"));
    }

    res.status(200).json({
      message: "Advertisement fetched successfully",
      data: singleAds,
    });
  } catch (error) {
    next(error);
  }
};

const editAds = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Advertisement ID", "ValidationError"));
  }

  try {
    const updatedAds = await Advertisement.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedAds) {
      return next(errorHandler(404, "Advertisement not found", "NotFound"));
    }

    res.status(200).json({
      message: "Advertisement updated successfully",
      data: updatedAds,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAds = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Advertisement ID", "ValidationError"));
  }

  try {
    const deletedAds = await Advertisement.findByIdAndDelete(id);
    if (!deletedAds) {
      return next(errorHandler(404, "Advertisement not found", "NotFound"));
    }

    res.status(200).json({
      message: "Advertisement deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const activateAds = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Advertisement ID", "ValidationError"));
  }

  try {
    const activatedAd = await Advertisement.findByIdAndUpdate(id, { active: true }, { new: true });
    if (!activatedAd) {
      return next(errorHandler(404, "Advertisement not found", "NotFound"));
    }

    res.status(200).json({
      message: "Advertisement activated successfully",
      data: activatedAd,
    });
  } catch (error) {
    next(error);
  }
};

const deactivateAds = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Advertisement ID", "ValidationError"));
  }

  try {
    const deactivatedAd = await Advertisement.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!deactivatedAd) {
      return next(errorHandler(404, "Advertisement not found", "NotFound"));
    }

    res.status(200).json({
      message: "Advertisement deactivated successfully",
      data: deactivatedAd,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAds,
  viewAllAds,
  viewSingleAds,
  editAds,
  deleteAds,
  activateAds,
  deactivateAds,
};
