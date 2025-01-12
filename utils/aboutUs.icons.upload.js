const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/config");

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "social_media_icons", 
    resource_type: "auto", // Auto detects the file type
  },
});

// Configure multer with specific file size limit and handling multiple fields
const uploadSocialMediaIcons = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Example: 2MB file size limit
}).fields([
  // Expecting 3 social media icons, with each icon having its own image, name, and link
  { name: "aboutUsSocialMediaIcons[0][socialImage]", maxCount: 1 },
  { name: "aboutUsSocialMediaIcons[0][socialName]", maxCount: 1 },
  { name: "aboutUsSocialMediaIcons[0][socialLink]", maxCount: 1 },

  { name: "aboutUsSocialMediaIcons[1][socialImage]", maxCount: 1 },
  { name: "aboutUsSocialMediaIcons[1][socialName]", maxCount: 1 },
  { name: "aboutUsSocialMediaIcons[1][socialLink]", maxCount: 1 },

  { name: "aboutUsSocialMediaIcons[2][socialImage]", maxCount: 1 },
  { name: "aboutUsSocialMediaIcons[2][socialName]", maxCount: 1 },
  { name: "aboutUsSocialMediaIcons[2][socialLink]", maxCount: 1 },

  // Add any additional fields here if needed
  { name: "otherField", maxCount: 1 },
]);

module.exports = uploadSocialMediaIcons;
