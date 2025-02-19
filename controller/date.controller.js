const DateModel = require("../models/date.model");
const mongoose = require("mongoose");
const Movie = require("../models/movie.model");
const Theatre = require("../models/theatre.model");

// 🎬 Add Showtimes for a Movie
const addShowtimes = async (req, res) => {
    try {
        const { movie_id, date, show_times } = req.body;
        const theatre_id = req.body.theatre_id;

        if (!theatre_id || !mongoose.Types.ObjectId.isValid(theatre_id)) {
                return res.status(400).json({ success: false, message: "Invalid theater id" });
            };

        if (!mongoose.Types.ObjectId.isValid(movie_id)) {
            return res.status(400).json({ success: false, message: "Invalid movie ID" });
        }

        // Check if a record exists for the same movie and date
        let movieDate = await DateModel.findOne({ movie_id, date: new Date(date) });

        if (!movieDate) {
            // If no entry exists, create a new one
            movieDate = new DateModel({ movie_id, date, show_times });
        } else {
            // If an entry exists, update the show_times array
            movieDate.show_times.push(...show_times);
        }

        await movieDate.save();
        res.status(201).json({ success: true, message: "Showtimes added", data: movieDate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// 🎬 Get Showtimes for a Movie
const getShowtimes = async (req, res) => {
    try {
        const { movie_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(movie_id)) {
            return res.status(400).json({ success: false, message: "Invalid movie ID" });
        }

        const showtimes = await DateModel.find({ movie_id })
        .populate('movie_id', 'title thumbnail')
        .populate('show_times.screen_id');

        if (!showtimes.length) {
            return res.status(404).json({ success: false, message: "No showtimes found for this movie" });
        }
        const movie = await Movie.findById(movie_id).populate('theatre_id');
        if(!movie) return res.status(404).json({ success: false, message: "No movie fond" });

        res.status(200).json({ success: true, data: showtimes, movie: movie });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 🎬 Update a Specific Showtime
const updateShowtime = async (req, res) => {
    try {
        const { movie_id, date, showtime_id } = req.params;
        const { time, screen_id, available_seats } = req.body;

        if (!mongoose.Types.ObjectId.isValid(movie_id) || !mongoose.Types.ObjectId.isValid(showtime_id)) {
            return res.status(400).json({ success: false, message: "Invalid movie ID or showtime ID" });
        }

        let movieDate = await DateModel.findOne({ movie_id, date: new Date(date) });

        if (!movieDate) {
            return res.status(404).json({ success: false, message: "Showtime not found" });
        }

        const showtime = movieDate.show_times.id(showtime_id);

        if (!showtime) {
            return res.status(404).json({ success: false, message: "Showtime not found" });
        }

        if (time) showtime.time = time;
        if (screen_id) showtime.screen_id = screen_id;
        if (available_seats !== undefined) showtime.available_seats = available_seats;

        await movieDate.save();
        res.status(200).json({ success: true, message: "Showtime updated", data: movieDate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 🎬 Delete a Specific Showtime
const deleteShowtime = async (req, res) => {
    try {
        const { movie_id, date, showtime_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(movie_id) || !mongoose.Types.ObjectId.isValid(showtime_id)) {
            return res.status(400).json({ success: false, message: "Invalid movie ID or showtime ID" });
        }

        let movieDate = await DateModel.findOne({ movie_id, date: new Date(date) });

        if (!movieDate) {
            return res.status(404).json({ success: false, message: "Showtime not found" });
        }

        movieDate.show_times = movieDate.show_times.filter(show => show._id.toString() !== showtime_id);

        await movieDate.save();
        res.status(200).json({ success: true, message: "Showtime deleted", data: movieDate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 🎬 Delete All Showtimes for a Movie
const deleteAllShowtimesForMovie = async (req, res) => {
    try {
        const { movie_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(movie_id)) {
            return res.status(400).json({ success: false, message: "Invalid movie ID" });
        }

        const result = await DateModel.deleteMany({ movie_id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "No showtimes found for this movie" });
        }

        res.status(200).json({ success: true, message: "All showtimes deleted for this movie" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    addShowtimes,
    getShowtimes,
    updateShowtime,
    deleteShowtime,
    deleteAllShowtimesForMovie
};
