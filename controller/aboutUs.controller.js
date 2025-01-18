const About = require('../models/aboutUs.model');

const createAbout = async (req, res) => {
    try {
        const { title, description } = req.body;
        const image = req.files.image[0] 

        if(!title || !description || !image) {
            return res.status(400).json({ success: false, message: "Please fill in all fields" });
        }

        const newAbout = await About.create({ title, description, image: image.filename });

        res.status(201).json({
            success: true,
            message: 'About page created successfully',
            data: newAbout
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating About page',
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
            message: 'Error retrieving About pages',
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
        const updates = req.body;

        const updatedAbout = await About.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedAbout) {
            return res.status(404).json({
                success: false,
                message: 'About page content not found'
            });
        }

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