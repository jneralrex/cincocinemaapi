const express = require("express");
const {
  createMovie,
  getMoviesByCinema,
  getSingleMovie,
  updateMovie,
  deleteMovie,
  toggleAvailability,
  getAllMoviesFromDatabase,
} = require("../controller/movie.controller");
const upload = require("../middleware/fileUploads");
const verifyTokensAndRole = require("../utils/authToken.verify");
const router = express.Router();

// non author validation routes
router.get("/database", getAllMoviesFromDatabase)
router.get("/", getMoviesByCinema);
router.get("/:id", getSingleMovie);

router.post(
  "/new", upload.fields([
 { name: "thumbnail", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createMovie
);
router.put(
  "/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateMovie
);
router.delete("/:id", deleteMovie);
router.patch("/:id/toggle-availability", toggleAvailability);

module.exports = router;
