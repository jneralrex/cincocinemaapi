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

const router = express.Router();

router.post("/create-location", createLocation);  

router.put("/state", editState);     
router.put("/city",  editCity);      
router.delete("/state/:state", deleteState);  
router.delete("/city/:state/:city", deleteCity);  

router.get("/locations/:theatreCinema", getAllLocations);  
router.get("/location/:state", getSingleLocation);  

module.exports = router;
