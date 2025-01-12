const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
    aboutUsTitle: {
        type: String,
        required: true,
    },
    aboutUsBody: {
        type: String,
        required: true,
    },
    aboutUsSocialMediaIcons: [{
        socialName: {
            type: String,
            required: true,
        },
        socialImage: {  
            type: String,
            required: true,
        },
        socialImagePublicId: {  
            type: String,
            required: true,
        },
        socialLink: {  
            type: String,
            required: true,
            match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, 'Invalid URL format'],  
        }
    }]
}, { timestamps: true });

const AboutUs = mongoose.model("AboutUs", aboutSchema);
module.exports = AboutUs;
