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

router.post("/create-events", upload.single("flyerImage"), createEvent);

router.get("/events", getAllEvents);

router.get("/single-event/:id", getEventById);

router.patch("/edit-event/:id", upload.single("flyerImage"), updateEvent);

router.delete("/delete-event/:id", deleteEvent);

module.exports = router;
