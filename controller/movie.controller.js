
const mongoose = require("mongoose");
const Movie = require("../models/movie.model")

const createMovie = async (req, res) => {

    const theatre_id = req.body.theatre_id;
    const thumbnail = req.files.thumbnail[0];
    const banner = req.files.banner[0];

    if (!mongoose.Types.ObjectId.isValid(theatre_id)) {
        return res.status(400).json({ success: false, message: "Invalid theater id" });
    };

    try {
        // Parse cast & crew safely
        let cast = [], crew = [];
        try {
            cast = req.body.cast ? JSON.parse(req.body.cast) : [];
            crew = req.body.crew ? JSON.parse(req.body.crew) : [];
        } catch (parseError) {
            return res.status(400).json({ success: false, message: "Invalid JSON format for cast or crew" });
        }

        const movie = new Movie({
            ...req.body,
            cast, // Properly parsed array of objects
            crew, // Properly parsed array of objects
            thumbnail: { url: thumbnail.path, public_id: thumbnail.filename },
            banner: { url: banner.path, public_id: banner.filename },
        });
  
        await movie.save();
        res.status(201).json({ success: true, message: "Movie created successfully", data: movie });
    } catch (error) {
        console.error("Error creating movie:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
  
const getMovies = async (req, res) => {
    const theatreId = req.query.theatre_id;

    if (!theatreId) {
        return res.status(400).json({ success: false, message: "Invalid theatre id" });
    }

    try {
        let { genre, title, isAvailable, limit = 10, page = 1 } = req.query;
        
        // Convert limit and page to numbers
        limit = parseInt(limit, 10);
        page = parseInt(page, 10);

        const query = { theatreId }; // Include theatreId in the query
        if (genre) query.genre = genre;
        if (title) query.title = new RegExp(title, 'i'); // Case-insensitive search
        if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

        // Fetch movies with filtering, pagination, and sorting
        const movies = await Movie.find(query)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        // Count total number of matching movies
        const totalMovies = await Movie.countDocuments(query);

        res.status(200).json({
            success: true,
            data: movies,
            totalMovies,
            totalPages: Math.ceil(totalMovies / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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

        const movie = await Movie.findById(id);

        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        const thumbnail = req.files.thumbnail ? req.files.thumbnail[0] : movie.thumbnail;
        const banner = req.files.banner ? req.files.banner[0] : movie.banner;

        movie.set({
            ...req.body,
            thumbnail: thumbnail ? { url: thumbnail.path, public_id: thumbnail.filename } : movie.thumbnail,
            banner: banner ? { url: banner.path, public_id: banner.filename } : movie.banner
        });

        await movie.save();

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