const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/config');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ads_uploads', 
        allowedFormats: ['jpg', 'png', 'gif', 'jpeg', 'webp', 'avif'] 
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
