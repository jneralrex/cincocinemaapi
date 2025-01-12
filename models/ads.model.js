const mongoose = require("mongoose");

const adsSchema = new mongoose.Schema({
    adsTitle: {
        type: String,
        required: true,
        unique: true,
    },
    adsBoody: {
        type: String,
        required: true,
        unique: true,
    },
    adsImage: {
        type: String,
    },
    adsLink: {
        type: String,
    },
    active: {
        type: Boolean,
        default: false,
    },
    durationDays: {
        type: Number,
        default: 30,
    },
    expireAt: {
        type: Date,
        default: function () {
            return new Date(Date.now() + this.durationDays * 24 * 60 * 60 * 1000);
        },
    },
}, { timestamps: true });

// Indexing the expireAt field the code below will automatically delete the document after the specified time but it is not recommended for production I will be using a cron job to delete the document

// adsSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
const Advertisement = mongoose.model("Advertisement", adsSchema);
module.exports = Advertisement;
