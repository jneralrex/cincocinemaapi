const express = require("express");
const upload = require("../utils/file/uploads");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controller/event.controller");

const router = express.Router();

router.post("/create-event/:theatre", upload.single("flyerImage"), createEvent);

router.get("/events/:theatre", getAllEvents);

router.get("/single-event/:id", getEventById);

router.patch("/edit-event/:id/:theatre",  upload.single("flyerImage"), updateEvent);

router.delete("/delete-event/:id",  deleteEvent);

module.exports = router;
