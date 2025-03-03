require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const config = {
    db_connection: process.env.MONGO_URI,
    port: process.env.PORT,
    defaultProfilePics: process.env.DEFAULT_PROFILE_PICS,
    jwt_s: process.env.JWT_ACCESS_SECRET,
    jwt_refresh_s: process.env.JWT_REFRESH_SECRET,
    jwt_expires: process.env.JWT_EXPIRATION,
    jwt_refresh_expire: process.env.JWT_REFRESH_EXPIRATION,
    reset_password_expiration: process.env.RESET_PASSWORD_EXPIRATION,
    email: process.env.SMTP_EMAIL,
    email_password: process.env.SMTP_PASSWORD,
    otp_expiration: process.env.OTP_EXPIRATION,
    unverified_user_expiration: process.env.UNVERIFIED_USER_EXPIRATION,
    otp_first_arg: process.env.OTP_FIRST_ARG,
    otp_second_arg: process.env.OTP_SECOND_ARG,
    duration_checker:process.env.DURATION_MULTIPLIER,
    front_end_url_1:process.env.FRONT_END_URL_1,
    front_end_url_2:process.env.FRONT_END_URL_2,
    front_end_url_3:process.env.FRONT_END_URL_3,
    front_end_url_4:process.env.FRONT_END_URL_4,
    cenima_role: process.env.CENIMA_ROLE,
    theatre_role: process.env.THEATRE_ROLE,
    counter_role: process.env.COUNTER_ROLE,
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

module.exports = {config, cloudinary};