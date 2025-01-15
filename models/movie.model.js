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
    cast: [personSchema],
    crew: [personSchema],
    streaming_location:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Location',
        // required: true,
    },
    streaming_date:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'streaming_date',
        // required: true,
    },
    streaming_time:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'streaming_time',
        // required: true,
    },
    class: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'class',
        // required: true,
    },
    seat:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'seat',
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