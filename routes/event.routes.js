const express = require("express");
const upload = require("../utils/file/uploads");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controller/event.controller");
<<<<<<< Updated upstream

const router = express.Router();

router.post("/create-event/:theatre", upload.single("flyerImage"), createEvent);

router.get("/events/:theatre", getAllEvents);

router.get("/single-event/:id", getEventById);

router.patch("/edit-event/:id/:theatre",  upload.single("flyerImage"), updateEvent);

router.delete("/delete-event/:id",  deleteEvent);
=======
const router = express.Router();

router.post("/create-events", upload.single("flyerImage"), createEvent);

router.get("/events", getAllEvents);

router.get("/single-event/:id", getEventById);

router.patch("/edit-event/:id", upload.single("flyerImage"), updateEvent);

router.delete("/delete-event/:id", deleteEvent);
>>>>>>> Stashed changes

module.exports = router;
