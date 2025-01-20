const mongoose = require("mongoose");
const Advertisement = require("../models/ads.model");
const errorHandler = require("../utils/errorHandler");
const { cloudinary } = require("../config/config");

// const uploadToCloudinary = async (file, folder) => {
//   try {
//     const result = await cloudinary.uploader.upload(file, { folder });
//     console.log("Cloudinary upload result:", result); 
//     return { url: result.secure_url, publicId: result.public_id };
//   } catch (error) {
//     console.error("Cloudinary upload error:", error); 
//     throw new Error("Cloudinary upload failed");
//   }
// };

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error("Failed to delete file from Cloudinary");
  }
};


const createAds = async (req, res, next) => {
  const { adsTitle, adsBody, adsLink, durationDays } = req.body;

  try {
    // Ensure the file is uploaded
    if (!req.file) {
      return next(errorHandler(400, "Image is required", "ValidationError"));
    }

    const { path, filename } = req.file; // From Cloudinary

    // Check for duplicate advertisements
    const checkAds = await Advertisement.findOne({ adsTitle, adsBody });
    if (checkAds) {
      return next(errorHandler(403, "Advertisement already exists", "ValidationError"));
    }

    // Create the new advertisement
    const newAds = new Advertisement({
      adsTitle,
      adsBody,
      adsLink,
      durationDays,
      adsImage: { url: path, publicId: filename },
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
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100); 

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
  const { adsTitle, adsBody, adsLink, durationDays } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Advertisement ID", "ValidationError"));
  }

  try {
    const ad = await Advertisement.findById(id);
    if (!ad) return next(errorHandler(404, "Advertisement not found", "NotFound"));

    const updatedData = { adsTitle, adsBody, adsLink, durationDays };

    if (req.file) {
      const { path, filename } = req.file;
      updatedData.adsImage = { url: path, publicId: filename };

      // Delete the old image
      if (ad.adsImage && ad.adsImage.publicId) {
        try {
          await deleteFromCloudinary(ad.adsImage.publicId);
        } catch (err) {
          console.error("Error deleting old image:", err.message);
        }
      }
    }

    const updatedAd = await Advertisement.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedAd) return next(errorHandler(404, "Advertisement not found", "NotFound"));

    res.status(200).json({
      status: "success",
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
