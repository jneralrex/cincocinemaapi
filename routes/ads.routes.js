const express = require("express");
const { viewAllAds, viewSingleAds, createAds, editAds, deleteAds, deactivateAds, activateAds } = require("../controller/ads.controller");
const verifyTokensAndRole = require("../utils/authToken.verify");
const router = express.Router();

router.get("/single-advertisement/:id", viewSingleAds);

router.get("/all-advertisements",  viewAllAds);

router.post("/create-advertisement",  createAds);
router.put("/edit-advertisement/:id",  editAds);

router.delete("/delete-advertisement/:id",  deleteAds);
router.put("/deactivate-advertisement/:id",  deactivateAds);
router.put("/activate-advertisement/:id",  activateAds);

module.exports = router;
