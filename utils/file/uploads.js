const multer = require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const { cloudinary } = require("../../config/config");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      allowed_formats: ["jpg", "jpeg", "png"], 
    },
  });

  const upload = multer({ storage });

  module.exports = upload;
