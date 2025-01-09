require("dotenv").config();
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
    email: process.env.EMAIL,
    email_password: process.env.EMAIL_PASSWORD,
    otp_expiration: process.env.OTP_EXPIRATION,
    unverified_user_expiration: process.env.UNVERIFIED_USER_EXPIRATION,
};
module.exports = config;