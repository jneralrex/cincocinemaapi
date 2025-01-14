// const Movie = require('')

const mongoose = require("mongoose");
const Movie = require("../models/movie.model")

const createMovie = async (req, res) => {
    try {
        const thumbnail = req.files.thumbnail[0];
        const banner = req.files.banner[0];

        const movie = new Movie({
            ...req.body, 
            thumbnail:{ url: thumbnail.path, public_id: thumbnail.filename },
            banner: { url: banner.path, public_id: banner.filename }
        });
        await movie.save();
        res.status(201).json({success: true, message: "Movie created successfully" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const getMovies = async (req, res) => {
    try {
        const { genre, title, isAvailable, limit = 10, page = 1 } = req.query; 

        const query = {};
        if (genre) query.genre = genre;
        if (title) query.title = new RegExp(title, 'i'); // Case-insensitive search
        if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

        const movies = await Movie.find(query).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 }); 

        const totalMovies = await Movie.countDocuments(query);

        res.status(200).json({
            success: true,
            data: movies,
            totalMovies,
            totalPages: Math.ceil(totalMovies / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
const getSingleMovie = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Invalid movie id" });
        };
        const movie = await Movie.findById(id)
            .populate('streaming_location')
            .populate('streaming_date')
            .populate('streaming_time')
            .populate('class')
            .populate('seat');
        
        if (!movie) {
            return res.status(404).json({ success: false, message: "Movie not found" });
        }
        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: 'Invalid movie ID' });
        }

        const movie = await Movie.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Movie updated successfully', 
            data: movie 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};
const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Invalid movie id" });
        };

        const movie = await Movie.findByIdAndDelete(id);

        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        await cloudinary.uploader.destroy(movie.thumbnail.public_id);
        await cloudinary.uploader.destroy(movie.banner.public_id);
        
        res.status(200).json({ success: true, message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Invalid movie id" });
        };

        const movie = await Movie.findById(id);

        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }
        
        movie.isAvailable = !movie.isAvailable;
        await movie.save();
        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

module.exports = { getMovies, getSingleMovie, createMovie, updateMovie, deleteMovie, toggleAvailability };