const mongoose = require("mongoose");
const Advertisement = require("../models/ads.model");
const errorHandler = require("../utils/errorHandler");
const { cloudinary } = require("../config/config");

const uploadToCloudinary = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file, { folder });
    console.log("Cloudinary upload result:", result); 
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error("Cloudinary upload error:", error); 
    throw new Error("Cloudinary upload failed");
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error("Failed to delete file from Cloudinary");
  }
};


const createAds = async (req, res, next) => {
  const { adsTitle, adsBody, adsLink, durationDays } = req.body;
  const { adsImage } = req.file;   // This is the uploaded image from the request
  try {
    if (!req.file) {
      return next(errorHandler(400, "No file uploaded", "ValidationError"));
    }
    const checkAds = await Advertisement.findOne({ adsTitle, adsBody });
    if (checkAds) {
      return next(errorHandler(403, "Advertisement already exists", "ValidationError"));
    }

    // Upload image to Cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file, "ads");

    // Create new advertisement with Cloudinary image data
    const newAds = new Advertisement({
      adsTitle,
      adsBody,
      durationDays,
      adsImage: { url, publicId }, 
      adsLink,
    });

    // Save the advertisement to the database
    await newAds.save();

    res.status(201).json({
      message: "Advertisement created successfully",
      data: newAds, // Return the newly created advertisement with the updated URL
    });
  } catch (error) {
    console.error("Error creating advertisement:", error);
    next(error); // Pass error to the next middleware
  }
};



const viewAllAds = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const ads = await Advertisement.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Advertisement.countDocuments();
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({ allAds: ads, total, page, totalPages, limit });
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
    const ad = await Advertisement.findById(id);
    if (!ad) {
      return next(errorHandler(404, "Advertisement not found", "NotFound"));
    }

    // Prepare the data to be updated
    let updatedData = { ...req.body };

    // If a new file is uploaded, handle image update
    if (req.file) {
      // If an existing image exists, delete it from Cloudinary
      if (ad.adsImage && ad.adsImage.publicId) {
        await deleteFromCloudinary(ad.adsImage.publicId);
      }

      // Upload the new image to Cloudinary
      const { url, publicId } = await uploadToCloudinary(req.file, "ads");
      updatedData.adsImage = { url, publicId }; // Add the new image data
    }

    // Update the advertisement in the database
    const updatedAd = await Advertisement.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({
      message: "Advertisement updated successfully",
      data: updatedAd,
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
    const ad = await Advertisement.findByIdAndDelete(id);
    if (!ad) {
      return next(errorHandler(404, "Advertisement not found", "NotFound"));
    }

    // Delete the image from Cloudinary if it exists
    if (ad.adsImage && ad.adsImage.publicId) {
      await deleteFromCloudinary(ad.adsImage.publicId);
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
