const jwt = require('jsonwebtoken');
const { config } = require('../config/config');
const User = require('../models/user.model');
const errorHandler = require('./errorHandler');
const axios = require('axios');

const verifyTokensAndRole = async (req, res, next) => {
  try {
    const { accesstoken: accessToken, refreshtoken: refreshToken } = req.cookies;

    if (!accessToken || !refreshToken) {
      return next(errorHandler('Unauthorized: Missing tokens', 'Unauthorized'));
    }

    let decodedAccessToken;
    try {
      decodedAccessToken = jwt.verify(accessToken, config.jwt_s);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // Attempt to refresh the token
        try {
          const { data } = await axios.post(
            `${config.api_base_url}/api/v1/auth/refreshtoken`,
            {},
            { withCredentials: true }
          );
          // Save new access token in cookies
          res.cookie("accesstoken", data.accessToken, { httpOnly: true, secure: true });
          req.headers.authorization = `Bearer ${data.accessToken}`;
          decodedAccessToken = jwt.verify(data.accessToken, config.jwt_s); // Decode new token
        } catch (refreshError) {
          return next(errorHandler('Unable to refresh token', 'Unauthorized'));
        }
      } else {
        return next(errorHandler('Invalid access token', 'Unauthorized'));
      }
    }

    const user = await User.findById(decodedAccessToken._id);
    if (!user) {
      return next(errorHandler('User not found', 'Unauthorized'));
    }

    try {
      const decodedRefreshToken = jwt.verify(refreshToken, config.refresh_token_secret);

      if (decodedRefreshToken._id !== decodedAccessToken._id) {
        return next(errorHandler('Token mismatch', 'Unauthorized'));
      }
    } catch (err) {
      return next(errorHandler('Invalid refresh token', 'Unauthorized'));
    }

    const allowedRoles = ['theatre-admin', 'web-admin'];
    if (!allowedRoles.includes(user.role)) {
      return next(errorHandler('Unauthorized: Insufficient permissions', 'Unauthorized'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(errorHandler('Unauthorized: Invalid tokens', 'Unauthorized'));
  }
};

module.exports = verifyTokensAndRole;
