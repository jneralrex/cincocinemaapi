const express = require('express');
const verifyTokensAndRole = require('../utils/authToken.verify');
const { viewAllScreens, viewScreen, createScreen, editScreen, deleteScreen } = require('../controller/screen.controller');
const router = express();

router.get("/all-screens", verifyTokensAndRole, viewAllScreens);
router.get("/screen/:id", verifyTokensAndRole, viewScreen);
router.post("/create-screen", verifyTokensAndRole, createScreen);
router.put("/edit-screen/:id", verifyTokensAndRole, editScreen);
router.delete("/delete-screen/:id", verifyTokensAndRole, deleteScreen);

module.exports = router;