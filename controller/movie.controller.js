
const mongoose = require("mongoose");
const Movie = require("../models/movie.model")

const createMovie = async (req, res) => {

    const theatre_id = req.body.theatre_id;
    const cinema_id = req.body.cinemaId;
    const thumbnail = req.files.thumbnail[0];
    const banner = req.files.banner[0];

    if (!theatre_id || !mongoose.Types.ObjectId.isValid(theatre_id)) {
        return res.status(400).json({ success: false, message: "Invalid theater id" });
    };
    if (!cinema_id || !mongoose.Types.ObjectId.isValid(cinema_id)) {
        return res.status(400).json({ success: false, message: "Invalid cinema id" });
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

const getAllMoviesFromDatabase = async (req, res) => {
    try {
        const { genre, title, isAvailable, limit = 10, page = 1 } = req.query;

        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);

        // Ensure valid pagination values
        if (isNaN(parsedLimit) || parsedLimit < 1) {
            return res.status(400).json({ success: false, message: "Invalid limit value" });
        }
        if (isNaN(parsedPage) || parsedPage < 1) {
            return res.status(400).json({ success: false, message: "Invalid page value" });
        }

        const query = {};
        if (genre) query.genre = new RegExp(genre, "i"); // Case-insensitive genre search
        if (title) query.title = new RegExp(title, "i"); // Case-insensitive title search
        if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";

        const movies = await Movie.find(query)
            .populate('cinemaId', 'cinemaName')
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        const totalMovies = await Movie.countDocuments(query);

        res.status(200).json({
            success: true,
            data: movies,
            totalMovies,
            totalPages: Math.ceil(totalMovies / parsedLimit),
            currentPage: parsedPage,
        });
    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

const getMoviesByCinema = async (req, res) => {
    const { cinema_id, genre, title, isAvailable, limit = 10, page = 1 } = req.query;

    if (!cinema_id || !mongoose.Types.ObjectId.isValid(cinema_id)) {
        return res.status(400).json({ success: false, message: "Invalid or missing cinema ID" });
    }

    try {
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);

        // Build the query object
        const query = { cinemaId: cinema_id }; // Ensure it's filtered by cinema

        if (genre) query.genre = genre;
        if (title) query.title = new RegExp(title, "i"); // Case-insensitive search
        if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";

        // Fetch movies with filters, pagination, and sorting
        const movies = await Movie.find(query)
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        // Count total movies
        const totalMovies = await Movie.countDocuments(query);

        res.status(200).json({
            success: true,
            data: movies,
            totalMovies,
            totalPages: Math.ceil(totalMovies / parsedLimit),
            currentPage: parsedPage,
        });
    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getMoviesByTheatre = async (req, res) => {
    const { theatre_id, genre, title, isAvailable, limit = 10, page = 1 } = req.query;

    if (!theatre_id || !mongoose.Types.ObjectId.isValid(theatre_id)) {
        return res.status(400).json({ success: false, message: "Invalid or missing theatre ID" });
    }

    try {
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);

        // Build the query object
        const query = { theatre_id: theatre_id }; // Ensure it's filtered by cinema

        if (genre) query.genre = genre;
        if (title) query.title = new RegExp(title, "i"); // Case-insensitive search
        if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";

        // Fetch movies with filters, pagination, and sorting
        const movies = await Movie.find(query)
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        // Count total movies
        const totalMovies = await Movie.countDocuments(query);

        res.status(200).json({
            success: true,
            data: movies,
            totalMovies,
            totalPages: Math.ceil(totalMovies / parsedLimit),
            currentPage: parsedPage,
        });
    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getSingleMovie = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid movie id" });
        }

        const movie = await Movie.findById(id)
            .populate({ path: "cinemaId", select: "cinemaName" })
            .populate({
                path: "theatre_id",
                select: "theatreName theatreLocation",
                populate: {
                    path: "theatreLocation", 
                    select: "location", 
                },
            })
            .populate("relatedMovies")
            .populate("streaming_date")
            .populate("streaming_time")
            .populate("class")
            .populate("seat");

        if (!movie) {
            return res.status(404).json({ success: false, message: "Movie not found" });
        }

        const formattedMovie = movie.toObject();

        if (formattedMovie.theatre_id && formattedMovie.theatre_id.theatreLocation) {
            formattedMovie.theatre_id.theatreLocation = formattedMovie.theatre_id.theatreLocation.location.map(
                (loc) => ({
                    state: loc.state,
                    cities: loc.cities.map((city) => ({
                        city: city.city,
                        street: city.street,
                    })),
                })
            );
        }

        res.status(200).json({ success: true, data: formattedMovie });
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

module.exports = { getMoviesByTheatre, getAllMoviesFromDatabase, getMoviesByCinema, getSingleMovie, createMovie, updateMovie, deleteMovie, toggleAvailability };