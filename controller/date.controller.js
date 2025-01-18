const DateModel = require("../models/date.model");
const mongoose = require("mongoose");

// Create a new screening date
exports.createScreeningDate = async (req, res) => {
    try {
        const { movieId, screeningDates } = req.body;

        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return res.status(400).json({ error: "Invalid Movie ID" });
        }

        const newDate = new DateModel({ movieId, screeningDates });
        const savedDate = await newDate.save();

        res.status(201).json(savedDate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all screening dates
exports.getAllScreeningDates = async (req, res) => {
    try {
        const dates = await DateModel.find().populate("movieId").exec();
        res.status(200).json(dates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get screening date by ID
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
        res.status(500).json({ error: error.message });
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
        res.status(500).json({ error: error.message });
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
        res.status(500).json({ error: error.message });
    }
};
