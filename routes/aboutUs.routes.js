const express = require("express");
const { createAboutUs, viewAboutUs, updateAboutUs, deleteAboutUs, deleteSocialIconImage } = require("../controller/aboutUs.controller");
const verifyTokensAndRole = require("../utils/authToken.verify");
const uploadSocialMediaIcons = require("../utils/aboutUs.icons.upload");
const router = express.Router();



router.get("/about-us", viewAboutUs);


router.post( "/create-about-info", verifyTokensAndRole,  uploadSocialMediaIcons, createAboutUs );
router.put("/:id", verifyTokensAndRole, updateAboutUs);
router.delete("/:id", verifyTokensAndRole, deleteAboutUs);
router.delete("/:aboutUsId/social-icon/:iconId", verifyTokensAndRole, deleteSocialIconImage);

module.exports = router;
