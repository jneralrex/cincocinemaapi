require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const config = {
    db_connection: process.env.MONGO_URI,
    port: process.env.PORT,
    defaultProfilePics: process.env.DEFAULT_PROFILE_PICS,
    jwt_s: process.env.JWT_SECRET,
    jwt_expires: process.env.JWT_EXPIRATION,
    jwt_refresh_expire: process.env.JWT_REFRESH_EXPIRATION,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expiration: process.env.REFRESH_TOKEN_EXPIRATION,
    cookie_expiration: process.env.COOKIE_EXPIRATION,
    reset_password_expiration: process.env.RESET_PASSWORD_EXPIRATION,
    email: process.env.SMTP_EMAIL,
    email_password: process.env.SMTP_PASSWORD,
    otp_expiration: process.env.OTP_EXPIRATION,
    unverified_user_expiration: process.env.UNVERIFIED_USER_EXPIRATION,
    otp_first_arg: process.env.OTP_FIRST_ARG,
    otp_second_arg: process.env.OTP_SECOND_ARG
};

cloudinary.config({
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
})

module.exports = {config, cloudinary};