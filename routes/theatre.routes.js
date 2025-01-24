const express = require("express");
const {
    createTheatre,
    viewTheatre,
    editTheatre,
    deleteTheatre,
    viewAllTheatres,
  }  = require("../controller/theatre.controller");

const router = express.Router();

router.post("/create-theatre", createTheatre);

router.get("/single-theatre/:id", viewTheatre);

router.patch("/edit-theatre/:id", editTheatre);

router.delete("/delete/:id", deleteTheatre);

router.get("/all-theatre", viewAllTheatres);

module.exports = router;
