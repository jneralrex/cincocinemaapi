const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: null
    },
}, { timestamps: true });

module.exports = mongoose.model('About', aboutSchema);
