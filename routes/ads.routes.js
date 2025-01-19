const express = require("express");
const { viewAllAds, viewSingleAds, createAds, editAds, deleteAds, deactivateAds, activateAds } = require("../controller/ads.controller");
const verifyTokensAndRole = require("../utils/authToken.verify");
const upload = require("../utils/file/adsUpload");
const router = express.Router();

router.get("/single-advertisement/:id", viewSingleAds);

router.get("/all-advertisements", verifyTokensAndRole, viewAllAds);

router.post("/create-advertisement", verifyTokensAndRole, upload.single("adsImage"), createAds);
router.put("/edit-advertisement/:id", verifyTokensAndRole, upload.single("adsImage"), editAds);

router.delete("/delete-advertisement/:id", verifyTokensAndRole, deleteAds);
router.put("/deactivate-advertisement/:id", verifyTokensAndRole, deactivateAds);
router.put("/activate-advertisement/:id", verifyTokensAndRole, activateAds);

module.exports = router;
