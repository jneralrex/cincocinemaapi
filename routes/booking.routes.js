const express = require("express");
const { createBooking, getAllBookings, getBookingById, getBookingsByReferenceId, cancelBooking } = require("../controller/booking.controller");
const router = express.Router()

router.post("/create-booking",  createBooking);
router.get("/bookings", getAllBookings);
router.get("/booking/:id", getBookingById);
router.get("/user-booking/:referenceId", getBookingsByReferenceId);
router.delete("/cancel-booking/:id", cancelBooking);

module.exports = router;