const mongoose = require("mongoose");

const theatreSchema = new mongoose.Schema(
    {
        theatreName: {
            type: String,
            required: true,
            trim: true,
        },
        theatreLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location", 
            required: true,
        },
    },
    { timestamps: true }
);

const Theatre = mongoose.model("Theatre", theatreSchema);
module.exports = Theatre;
