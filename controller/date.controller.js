const axios = require("axios");
const DateModel = require("../models/date.model");
const mongoose = require("mongoose");

const API_URL = "/api/v1/airingdate/all-dates"; // API endpoint

// Create a new screening date (Single Date)
exports.createScreeningDate = async (req, res) => {
    try {
        const { movieId, screeningDates } = req.body;

        // Validate movie ID
        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return res.status(400).json({ error: "Invalid Movie ID" });
        }

        // Validate screeningDates array
        if (!Array.isArray(screeningDates) || screeningDates.length === 0) {
            return res.status(400).json({ error: "Screening dates must be an array with at least one date" });
        }

        const newDate = new DateModel({ movieId, screeningDates });
        const savedDate = await newDate.save();

        // POST request to API with the new date
        await axios.post(API_URL, savedDate);

        res.status(201).json(savedDate);
    } catch (error) {
        console.error("Error creating screening date:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all screening dates
exports.getAllScreeningDates = async (req, res) => {
    try {
        const dates = await DateModel.find().populate("movieId").exec();
        
        // Send request to API for all dates
        const response = await axios.get(API_URL);
        res.status(200).json(response.data || dates);
    } catch (error) {
        console.error("Error fetching screening dates:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get a specific screening date by ID
exports.getScreeningDateById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        const date = await DateModel.findById(id).populate("movieId").exec();
        if (!date) {
            return res.status(404).json({ error: "Screening date not found" });
        }

        res.status(200).json(date);
    } catch (error) {
        console.error("Error fetching screening date:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update a screening date
exports.updateScreeningDate = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        const updatedDate = await DateModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
        if (!updatedDate) {
            return res.status(404).json({ error: "Screening date not found" });
        }

        res.status(200).json(updatedDate);
    } catch (error) {
        console.error("Error updating screening date:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete a screening date
exports.deleteScreeningDate = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        const deletedDate = await DateModel.findByIdAndDelete(id).exec();
        if (!deletedDate) {
            return res.status(404).json({ error: "Screening date not found" });
        }

        res.status(200).json({ message: "Screening date deleted successfully" });
    } catch (error) {
        console.error("Error deleting screening date:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
