const { cloudinary } = require("../config/config");
const User = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const errorHandler = require("../utils/errorHandler");


const getAllUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (isNaN(pageNumber) || isNaN(limitNumber)) {
    return next(errorHandler(400, "Invalid pagination parameters", "ValidationErorr"));
  }

  const users = await User.find()
    .skip((pageNumber - 1) * limitNumber) 
    .limit(limitNumber) 
    .select("-password"); 

  const totalUsers = await User.countDocuments();

  res.status(200).json({
    success: true,
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limitNumber),
    currentPage: pageNumber,
  });
});
 
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return next(errorHandler(404, "User not found", "NotFound"))
  }

  res.status(200).json({ success: true, user });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!updateData) {
    return next(errorHandler(404, "No data provided for update", "ValidationError"));
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

  if (!updatedUser) {
    return next(errorHandler(404, "User not found", "NotFound"))  }

  res.status(200).json({ success: true, user: updatedUser });
});

const uploadToCloudinary = async (file, folder, tags = []) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: { width: 500, height: 500, crop: "limit" },
      tags,
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Cloudinary upload failed");
  }
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    console.warn("Public ID is missing for deletion");
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok") {
      throw new Error(`Failed to delete image with public ID: ${publicId}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to delete ${publicId}:`, error);
    return false;
  }
};

const updateUserField = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

const signUpload = asyncHandler((req, res, next) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: "profile_pictures" },
      cloudinary.api_secret
    );
  
    if (!signature) {
     return next(errorHandler(500, "Failed to generate Cloudinary signature", "ServerError"));
    }
  
    res.status(200).json({
      success: true,
      signature,
      timestamp,
      cloudName: cloudinary.cloud_name,
      apiKey: cloudinary.api_key,
    });
 
});

const updateProfilePhoto = asyncHandler(async (req, res, next) => {
  const { profilePhoto, publicId } = req.body;
  const { id: userId } = req.params;

  if (!userId || !profilePhoto || !publicId) {
    return next(errorHandler(400, "Invalid Input Data", "ValidationError"));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(errorHandler(400, "User Not Found", "ValidationError"));
  }

  if (user.profilePhotoPublicId) {
    const isDeleted = await deleteFromCloudinary(user.profilePhotoPublicId);
    if (!isDeleted) {
      console.warn(`Failed to delete old profile photo for user ${userId}`);
    }
  }

  user.profilePhoto = profilePhoto;
  user.profilePhotoPublicId = publicId;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile photo updated successfully",
    profilePhoto: user.profilePhoto,
  });
});

const deleteAccount = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const deletionPromises = [];

    if (user.profilePhotoPublicId) {
      deletionPromises.push(deleteFromCloudinary(user.profilePhotoPublicId));
    } else {
      console.warn(
        `Missing publicId for profile photo of user ${req.params.id}`
      );
    }

    if (user.images?.length) {
      user.images.forEach((image) => {
        if (image.publicId) {
          deletionPromises.push(deleteFromCloudinary(image.publicId));
        } else {
          console.warn(`Missing publicId for image of user ${req.params.id}`);
        }
      });
    }

    const deletionResults = await Promise.allSettled(deletionPromises);

    deletionResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Failed to delete image ${index}:`, result.reason);
      } else {
        console.log(`Image ${index} deleted successfully`);
      }
    });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).clearCookie("accesstoken").json({
      success: true,
      message: "Account, Cookies and associated images successfully deleted",
    });
  } catch (error) {
    console.error("Error during account deletion:", error);
    next();
  }
});

const uploadCoverImage = asyncHandler(async (req, res, next) => {
    try {
      const { file } = req.body;
      if (!file) {
        throw new Error("No file uploaded");
      }
  
      const coverImage = await uploadToCloudinary(file, "cover_images", [
        req.user.id,
      ]);
  
      const user = await updateUserField(req.user.id, { coverImage });
  
      res.status(200).json({
        success: true,
        message: "Cover image uploaded successfully",
        coverImage: user.coverImage,
      });
    } catch (error) {
      next(error);
    }
  });
  

const rollBackImageWithErrors = asyncHandler(async (req, res, next) => {
    try {
      const { publicId } = req.body;
  
      if (!publicId) {
        throw new Error("Public ID is required to rollback an asset.");
      }
  
      const success = await deleteFromCloudinary(publicId);
  
      if (!success) {
        throw new Error("Failed to delete asset from Cloudinary.");
      }
  
      res.status(200).json({
        success: true,
        message: "Asset successfully deleted from Cloudinary.",
      });
    } catch (error) {
      next(error);
    }
  });

  
module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  signUpload,
  updateProfilePhoto,
  uploadCoverImage,
  rollBackImageWithErrors,
  deleteAccount,
};
