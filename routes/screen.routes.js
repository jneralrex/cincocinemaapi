const express = require("express");
const {
  viewAllScreens,
  viewScreen,
  createScreen,
  editScreen,
  deleteScreen,
} = require("../controller/screen.controller");

const router = express.Router(); 

router.get("/screens/:theatre",  viewAllScreens);

router.get("/screen/:id", viewScreen);

router.post("/theatre/:theatre/screen",  createScreen);

router.patch("/theatre/:theatre/screen/:id",  editScreen);

router.delete("/screen/:id",  deleteScreen);

module.exports = router;
