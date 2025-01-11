const jwt = require("jsonwebtoken");
const {config} = require("../config/config");

const generateAccessToken = (user) => {
  try {
    const payload = {
      _id: user._id,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt_s, {
      expiresIn: config.cookie_expiration,
    });
    return accessToken;
  } catch (error) {
    console.error("Failed to generate access token", error);
    throw new Error("Failed to generate access token");
  };
};

const generateRefreshToken = (user) => {
  try {
    const payload = {
      _id: user._id,
      role: user.role,
    };

    const refreshToken = jwt.sign(payload, config.refresh_token_secret, {
      expiresIn: config.refresh_token_expiration,
    });
    return refreshToken;
  } catch (error) {
    console.error("Failed to generate refresh token", error);
    throw new Error("Failed to generate refresh token");
  };
};
module.exports = { generateAccessToken, generateRefreshToken };
