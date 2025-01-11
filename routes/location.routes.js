const express = require("express");
const {
  createLocation,
  editState,
  editCity,
  deleteState,
  deleteCity,
  getAllLocations,
  getSingleLocation,
} = require("../controller/location.controller");
const verifyTokensAndRole = require("../utils/authToken.verify");

const router = express.Router();

router.post("/create-location", verifyTokensAndRole, createLocation);  

// Protected Routes with role and token verification
router.put("/state", verifyTokensAndRole, editState);     
router.put("/city", verifyTokensAndRole, editCity);      
router.delete("/state/:state", verifyTokensAndRole, deleteState);  
router.delete("/city/:state/:city", verifyTokensAndRole, deleteCity);  

router.get("/locations", getAllLocations);  
router.get("/location/:state", getSingleLocation);  

module.exports = router;
