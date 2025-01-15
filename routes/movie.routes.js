const express = require("express");
const {
  createMovie,
  getMovies,
  getSingleMovie,
  updateMovie,
  deleteMovie,
  toggleAvailability,
} = require("../controller/movie.controller");
const upload = require("../middleware/fileUploads");
const verifyTokensAndRole = require("../utils/authToken.verify");
const router = express.Router();

// non author validation routes
router.get("/", getMovies);
router.get("/:id", getSingleMovie);

router.post(
  "/new", verifyTokensAndRole, upload.fields([
 { name: "thumbnail", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createMovie
);
router.put(
  "/:id", verifyTokensAndRole,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateMovie
);
router.delete("/:id", deleteMovie);
router.patch("/movies/:id/toggle-availability", verifyTokensAndRole, toggleAvailability);

module.exports = router;
