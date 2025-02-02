const express = require("express");
const router = express.Router();
const { viewAllTheatres, deleteTheatre, editTheatre, viewTheatre, createTheatre } = require("../controller/theatre.controller");

router.post("/theatres/:theatreCinema", createTheatre);

router.get("/theatres/:id", viewTheatre);

router.put("/theatres/:id/:theatreCinema", editTheatre);

router.delete("/theatres/:id", deleteTheatre);

router.get("/theatres", viewAllTheatres);

module.exports = router;
