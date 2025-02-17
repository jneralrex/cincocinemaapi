const express = require("express");
const router = express.Router();
const {
    addShowtimes,
    getShowtimes,
    updateShowtime,
    deleteShowtime,
    deleteAllShowtimesForMovie
} = require("../controller/date.controller");

// 🎬 Add Showtimes for a Movie
router.post("/new", addShowtimes);

// 🎬 Get Showtimes for a Movie
router.get("/:movie_id", getShowtimes);

// 🎬 Update a Specific Showtime
router.put("/:movie_id/:date/:showtime_id", updateShowtime);

// 🎬 Delete a Specific Showtime
router.delete("/:movie_id/:date/:showtime_id", deleteShowtime);

// 🎬 Delete All Showtimes for a Movie
router.delete("/:movie_id", deleteAllShowtimesForMovie);

module.exports = router;
