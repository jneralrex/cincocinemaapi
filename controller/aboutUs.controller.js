const mongoose = require('mongoose');
const About = require('../models/aboutUs.model');

const createAbout = async (req, res) => {
    try {
        const { title, description } = req.body;
        const image = req.file.path 

        if(!title || !description || !image) {
            return res.status(400).json({ success: false, message: "Please fill in all fields" });
        }

        const aboutContent = new About({
            title,
            description,
            image
        });

        const resp = await aboutContent.save();

        res.status(201).json({
            success: true,
            message: 'About page created successfully',
            data: resp
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating About page content',
            error: error.message
        });
    }
};

// Get all about pages
const getAllAbout = async (req, res) => {
    try {
        const about = await About.find();

        res.status(200).json({
            success: true,
            message: 'About pages contents retrieved successfully',
            data: about
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving About pages content',
            error: error.message
        });
    }
};

// Get a single about page by ID
const getAboutById = async (req, res) => {
    try {
        const { id } = req.params;

        const about = await About.findById(id);

        if (!about) {
            return res.status(404).json({
                success: false,
                message: 'About page not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'About page content retrieved successfully',
            data: about
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving About page',
            error: error.message
        });
    }
};

const updateAbout = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const image = req.file.path 

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: 'Invalid aboutContent ID' });
        }

        if(!title || !description || !image) {
            return res.status(400).json({ success: false, message: "Please fill in all fields" });
        }
        const newAboutContent = {
            title,
            description,
            image
        }
        const updatedAbout = await About.findByIdAndUpdate(id, newAboutContent, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'About page content updated successfully',
            data: updatedAbout
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating About page',
            error: error.message
        });
    }
};

// Delete an about page by ID
const deleteAbout = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedAbout = await About.findByIdAndDelete(id);

        if (!deletedAbout) {
            return res.status(404).json({
                success: false,
                message: 'About page not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'About page content deleted successfully',
            data: deletedAbout
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting About page',
            error: error.message
        });
    }
};

module.exports = { createAbout, getAllAbout, getAboutById, updateAbout, deleteAbout };