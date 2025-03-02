const jwt = require('jsonwebtoken');
const { config } = require('../config/config');
const errorHandler = require('./errorHandler');
const Theatre = require('../models/theatre.model');

const theatreAuthToken = async (req, res, next) => {
  try {
    const { accesstoken: accessToken, refreshtoken: refreshToken } = req.cookies;

    if (!accessToken || !refreshToken) {
      return next(errorHandler(403, 'Unauthorized: Missing tokens', 'Unauthorized'));
    }

    let decodedAccessToken;
    try {
      decodedAccessToken = jwt.verify(accessToken, config.jwt_s);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(errorHandler(403, 'Access token expired', 'Unauthorized'));
      }
      return next(errorHandler(403, 'Invalid access token', 'Unauthorized'));
    }

    const theatre = await Theatre.findById(decodedAccessToken._id);
    if (!theatre) {
      return next(errorHandler(403, 'theatre not found', 'Unauthorized'));
    }

    try {
      const decodedRefreshToken = jwt.verify(refreshToken, config.jwt_refresh_s);

      if (decodedRefreshToken._id !== decodedAccessToken._id) { 
        return next(errorHandler(403, 'Token mismatch', 'Unauthorized'));
      }
    } catch (err) {
      return next(errorHandler(403, 'Invalid refresh token', 'Unauthorized'));
    }
    req.theatre = theatre;
    next();
  } catch (error) {
    return next(errorHandler(403, 'Unauthorized: Invalid tokens', 'Unauthorized'));
  }
};

module.exports = theatreAuthToken;
