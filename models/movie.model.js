const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    stage_name: { type: String, required: true, trim: true },
});

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    trailer: {
        type: String,
        trim: true,
    },
    thumbnail: {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    },
    banner: {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    genre: [
        {
            type: String,
            required: true,
            trim: true
        },
    ],
    language: [
        {
            type: String,
            required: true,
            trim: true,
            default: 'English',
        },
    ],
    parentalGuidance:{
        type: String,
        required: true,
        trim: true
    },
    date_release: {
        type: Date,
        required: true,
    },
    description:{
        type: String,
        required: true,
        trim: true,
        default: "Description not available"
    },
    tags: [
        {
            type: String,
            trim: true,
        }
    ],
    cast: [
        {
            name: { type: String, required: true, trim: true },
            image: { type: String, required: true, trim: true },
            stage_name: { type: String, required: true, trim: true },
        }
    ],
    crew: [
        {
            name: { type: String, required: true, trim: true },
            image: { type: String, required: true, trim: true },
            stage_name: { type: String, required: true, trim: true },
        }
    ],
    theatre_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theatre',
        required: true,
    },
    streaming_date:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Time',
        // required: true,
    },
    streaming_time:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Date',
        // required: true,
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        // required: true,
    },
    seat:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        // required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    relatedMovies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'movie',
        }
    ],
    
},{
    timestamps: true
});

const Movie = mongoose.model('movie', movieSchema);
module.exports = Movie;