const TimeModel = require("../models/time.model");
const mongoose = require("mongoose");

// Create a new time entry
exports.createTime = async (req, res) => {
    try {
        const { dateId, showTimes, isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(dateId)) {
            return res.status(400).json({ error: "Invalid Date ID" });
        }

        const newTime = new TimeModel({ dateId, showTimes, isActive });
        const savedTime = await newTime.save();

        res.status(201).json(savedTime);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all time entries
exports.getAllTimes = async (req, res) => {
    try {
        const times = await TimeModel.find().populate("dateId").exec();
        res.status(200).json(times);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific time entry by ID
exports.getTimeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        const time = await TimeModel.findById(id).populate("dateId").exec();

        if (!time) {
            return res.status(404).json({ error: "Time entry not found" });
        }

        res.status(200).json(time);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a time entry
exports.updateTime = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        const updatedTime = await TimeModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if (!updatedTime) {
            return res.status(404).json({ error: "Time entry not found" });
        }

        res.status(200).json(updatedTime);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a time entry
exports.deleteTime = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        const deletedTime = await TimeModel.findByIdAndDelete(id).exec();

        if (!deletedTime) {
            return res.status(404).json({ error: "Time entry not found" });
        }

        res.status(200).json({ message: "Time entry deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
