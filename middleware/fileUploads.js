const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads',
        allowedFormats:['jpg', 'png', 'gif', 'jpeg', 'webp', 'avif']
    }
});
const upload = multer({ storage: storage });
module.exports = upload;