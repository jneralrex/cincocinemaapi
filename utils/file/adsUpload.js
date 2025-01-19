const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../../config/config');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ads_uploads', 
        allowedFormats: ['jpg', 'png', 'gif', 'jpeg', 'webp', 'avif'],
        limits: { fileSize: 5 * 1024 * 1024 },
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
