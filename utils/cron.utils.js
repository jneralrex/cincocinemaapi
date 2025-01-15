const cron = require("node-cron");
const Advertisement = require("../models/ads.model");

const cronJobs = () => {
    // This function ba, it daily at midnight to check for expired advertisements and deactivate them
        cron.schedule("0 0 * * *", async () => {
        console.log("Checking for expired advertisements...");
        const now = new Date();

        try {
            const expiredAds = await Advertisement.updateMany(
                { expireAt: { $lte: now }, active: true }, // Find active ads where expireAt is in the past(ads way don expire)
                { $set: { active: false } } // e go mark them as inactive
            );

            console.log(`${expiredAds.modifiedCount} advertisements deactivated.`);
        } catch (error) {
            console.error("Error deactivating expired advertisements:", error);
        }
    });

    console.log("Cron job initialized.");
};

module.exports = cronJobs;
