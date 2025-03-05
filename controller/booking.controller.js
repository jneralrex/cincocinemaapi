const mongoose = require("mongoose");
const Row = require("../models/rowmodel");
const Date = require("../models/date.model");
const User = require("../models/user.model");
const Counter = require("../models/counter.model");
const Booking = require("../models/booking.model");
const errorHandler = require("../utils/errorHandler");
const Seat = require("../models/seat.model");
const { populate } = require("../models/theatre.model");

// Create a new booking
const createBooking = async (req, res, next) => {
  try {
    const { date, seatSelected, clientType, referenceId, bookingFor } =
      req.body;

    if (!date || !seatSelected || !clientType || !referenceId || !bookingFor) {
      return next(
        errorHandler(400, "All fields are required", "ValidationError")
      );
    }

    if (!["User", "Counter"].includes(clientType)) {
      return next(errorHandler(400, "Invalid client type", "ValidationError"));
    }

    const existingDate = await Date.findById(date).lean();
    if (!existingDate) {
      return next(errorHandler(404, "Date not found", "NotFoundError"));
    }

    // Ensure `seatSelected` is an array and validate all seat IDs
    if (!Array.isArray(seatSelected) || seatSelected.length === 0) {
      return next(
        errorHandler(
          400,
          "At least one seat must be selected",
          "ValidationError"
        )
      );
    }

    const seats = await Seat.find({ _id: { $in: seatSelected } }).lean();
    if (seats.length !== seatSelected.length) {
      return next(
        errorHandler(
          400,
          "One or more selected seats are invalid",
          "ValidationError"
        )
      );
    }

    // Validate referenceId
    let client =
      clientType === "User"
        ? await User.findById(referenceId).lean()
        : await Counter.findById(referenceId).lean();

    if (!client) {
      return next(errorHandler(404, "Client not found", "NotFoundError"));
    }

    const newBooking = new Booking({
      date,
      seatSelected,
      clientType,
      referenceId,
      bookingFor,
    });
    await newBooking.save();

    res
      .status(201)
      .json({ message: "Booking successful", booking: newBooking });
  } catch (error) {
    next(errorHandler(500, "Server error", "ServerError", error.message));
  }
};

// Get all bookings
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate({ path: "date", select: "movie" })
      .populate("seatSelected")
      .populate("referenceId");

    res.status(200).json(bookings);
  } catch (error) {
    next(errorHandler(500, "Server error", "ServerError", error.message));
  }
};

// Get a single booking by ID
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(errorHandler(400, "Invalid booking ID", "ValidationError"));
    }

    const booking = await Booking.findById(id)
      .populate({
        path: "date",
        select: "movie",
        populate: { path: "movie_id", select: "title" },
      })
      .populate({
        path: "seatSelected",
        select: "seatNumber theatre",
        populate: {
          path: "theatre",
          select: "theatreName theatreLocation",
          populate: { path: "theatreLocation", select: "location" },
        },
      })
      .populate({ path: "referenceId", select: "username email phoneNumber" })
      .populate({
        path: "referenceId",
        select: "counterName counterEmail counterTheatre",
        populate: {
          path: "counterTheatre",
          select: "theatreLocation",
          populate: { path: "theatreLocation", select: "location" },
        },
      });
    if (!booking) {
      return next(errorHandler(404, "Booking not found", "NotFoundError"));
    }

    res.status(200).json(booking);
  } catch (error) {
    next(errorHandler(500, "Server error", "ServerError", error.message));
  }
};

// Get bookings by user or counter
const getBookingsByReferenceId = async (req, res, next) => {
  try {
    const { referenceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(referenceId)) {
      return next(errorHandler(400, "Invalid reference ID", "ValidationError"));
    }

    const bookings = await Booking.find({ referenceId })
      .populate({
        path: "date",
        select: "movie",
        populate: { path: "movie_id", select: "title" },
      })
      .populate({
        path: "seatSelected",
        select: "seatNumber theatre",
        populate: {
          path: "theatre",
          select: "theatreName theatreLocation",
          populate: { path: "theatreLocation", select: "location" },
        },
      })
      .populate({ path: "referenceId", select: "username email phoneNumber" })
      .populate({
        path: "referenceId",
        select: "counterName counterEmail counterTheatre",
        populate: {
          path: "counterTheatre",
          select: "theatreLocation",
          populate: { path: "theatreLocation", select: "location" },
        },
      });

    if (bookings.length === 0) {
      return next(
        errorHandler(
          404,
          "No bookings found for this user/counter",
          "NotFoundError"
        )
      );
    }

    res.status(200).json(bookings);
  } catch (error) {
    next(errorHandler(500, "Server error", "ServerError", error.message));
  }
};

// Cancel a booking
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(errorHandler(400, "Invalid booking ID", "ValidationError"));
    }

    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return next(errorHandler(404, "Booking not found", "NotFoundError"));
    }

    res.status(200).json({ message: "Booking canceled successfully" });
  } catch (error) {
    next(errorHandler(500, "Server error", "ServerError", error.message));
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByReferenceId,
  cancelBooking,
};
