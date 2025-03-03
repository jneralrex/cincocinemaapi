const DateModel = require("../models/date.model");
const mongoose = require("mongoose");
const Movie = require("../models/movie.model");
const Theatre = require("../models/theatre.model");

// 🎬 Add Showtimes for a Movie
const addShowtimes = async (req, res) => {
    try {
        const { theatre_id, movie_id, date, times } = req.body;

        if (!mongoose.Types.ObjectId.isValid(theatre_id)) {
            return res.status(400).json({ success: false, message: "Invalid theatre ID" });
        }

        if (!mongoose.Types.ObjectId.isValid(movie_id)) {
            return res.status(400).json({ success: false, message: "Invalid movie ID" });
        }

        let movieDate = await DateModel.findOne({ movie_id, date: new Date(date) });

        if (!movieDate) {
            // If no date entry exists, create a new one with this theatre
            movieDate = new DateModel({
                movie_id,
                date,
                show_times: [{ theatre_id, times }],
            });
        } else {
            // Check if the theatre already exists for this date
            const theatreIndex = movieDate.show_times.findIndex(
                (show) => show.theatre_id.toString() === theatre_id
            );

            if (theatreIndex !== -1) {
                // Theatre exists, update its showtimes
                movieDate.show_times[theatreIndex].times.push(...times);
            } else {
                // If theatre does not exist for this date, add it
                movieDate.show_times.push({ theatre_id, times });
            }
        }

        await movieDate.save();
        res.status(201).json({ success: true, message: "Showtimes added successfully", data: movieDate });
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

        // Get current date without time for accurate comparison
        const currentDate = new Date().setHours(0, 0, 0, 0);

        // Remove expired showtimes
        await DateModel.deleteMany({ movie_id, date: { $lt: currentDate } });

        // Fetch showtimes, grouped by theatre
        const showtimes = await DateModel.find({ movie_id })
            .populate('movie_id', 'title thumbnail')
            .populate('show_times.theatre_id', 'theatreName theatreLocation')
            .populate('show_times.times.screen_id', 'screenName screenType');

        if (!showtimes.length) {
            await Movie.findByIdAndUpdate(movie_id, { isAvailable: false });
            return res.status(404).json({ success: false, message: "No showtimes found for this movie" });
        }

        // Fetch movie details with theatre information
        const movie = await Movie.findById(movie_id)
        .populate({
            path: "theatre_id",
            select: "theatreName theatreLocation",
            populate: {
                path: "theatreLocation", 
                select: "location", 
            },
        })

        if (!movie) {
            return res.status(404).json({ success: false, message: "No movie found" });
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

        res.status(200).json({ success: true, data: showtimes, movie: formattedMovie });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


const updateShowtime = async (req, res) => {
    try {
        const { movie_id, date, showtime_id } = req.params;
        const { time, screen_id, price } = req.body;

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
        if (price !== undefined) showtime.price = price;

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
