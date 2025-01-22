const mongoose = require("mongoose");
const Event = require("../models/event.model"); 
const errorHandler = require("../utils/errorHandler"); 
const { cloudinary } = require("../config/config"); 
const Location = require("../models/location.model");

// Create Event
const createEvent = async (req, res, next) => {
  const { eventName, eventHost, eventPrice, currency, eventDate, eventTime, location } = req.body;
  const file = req.file; 

  try {
    if (!eventName || !eventHost || !eventPrice || !eventDate || !eventTime || !location) {
      return next(errorHandler(400, "Missing required fields", "ValidationError"));
    }

    const checkLocation = await Location.findById(location);
    if (!checkLocation) {
        return next(errorHandler(404, `location does not exist`, "NotFoundError"));
      }

    let uploadResponse = null;
    if (file) {
      uploadResponse = await cloudinary.uploader.upload(file.path, {
        folder: "events",
      });
    }

    const newEvent = new Event({
      eventName,
      eventHost,
      eventPrice,
      currency,
      eventDate,
      eventTime,
      location:checkLocation,
      flyerImage: uploadResponse ? uploadResponse.secure_url : undefined,
      publicId: uploadResponse ? uploadResponse.public_id : undefined,
    });

    await newEvent.save();

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    next(error);
  }
};

const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate("location");
    res.status(200).json({
      message: "Events retrieved successfully",
      events,
      total: events.length,
    });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Event ID", "ValidationError"));
  }

  try {
    const event = await Event.findById(id).populate("location");
    if (!event) {
      return next(errorHandler(404, `Event with ID ${id} not found`, "NotFoundError"));
    }

    res.status(200).json({
      message: "Event retrieved successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  const { id } = req.params;
  const { eventName, eventHost, eventPrice, currency, eventDate, eventTime, location } = req.body;
  const flyerImage = req.file; 

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Event ID", "ValidationError"));
  }

  
  try {
      const event = await Event.findById(id);
      if (!event) {
          return next(errorHandler(404, `Event with ID ${id} not found`, "NotFoundError"));
        }

        const checkLocation = await Location.findById(location);
        if (!checkLocation) {
            return next(errorHandler(404, `location does not exist`, "NotFoundError"));
          }

    let updatedData = {
      eventName,
      eventHost,
      eventPrice,
      currency,
      eventDate,
      eventTime,
      location:checkLocation,
    };

    if (flyerImage) {
      if (event.publicId) {
        await cloudinary.uploader.destroy(event.publicId);
      }

      const uploadResponse = await cloudinary.uploader.upload(flyerImage.path, {
        folder: "events",
      });

      updatedData.flyerImage = uploadResponse.secure_url;
      updatedData.publicId = uploadResponse.public_id;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandler(400, "Invalid Event ID", "ValidationError"));
  }

  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return next(errorHandler(404, `Event with ID ${id} not found`, "NotFoundError"));
    }

    if (event.publicId) {
      await cloudinary.uploader.destroy(event.publicId);
    }

    res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
