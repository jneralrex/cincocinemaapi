const express = require('express');
const router = express.Router();
const verifyTokensAndRole = require('../utils/authToken.verify');
const { createAboutUs, editAboutUs, addSocialMedia, deleteSocialMedia } = require('../controller/aboutUs.controller');
const socialIcons = require('../utils/fileUploads/socialIcons.upload'); // Custom socialIcons multer configuration

// Routes
router.post('/about-us', socialIcons.array('socialImage'), createAboutUs);  // Create About Us with social media icons
router.put('/about-us/:id', socialIcons.array('socialImage'), verifyTokensAndRole, editAboutUs);  // Edit About Us details
router.patch('/about-us/:id/social-media', socialIcons.single('socialImage'), verifyTokensAndRole, addSocialMedia);  // Add social media link
router.delete('/about-us/:id/social-media/:socialId', verifyTokensAndRole, deleteSocialMedia);  // Delete social media link

module.exports = router;
