require("dotenv").config();
const config = {
    db_connection: process.env.MONGO_URI,
    port: process.env.PORT,
    defaultProfilePics: process.env.DEFAULT_PROFILE_PICS,
};
module.exports = config;