const jwt = require('jsonwebtoken');
const { config } = require('../config/config');
const User = require('../models/user.model');
const errorHandler = require('./errorHandler');

const userAuthToken = async (req, res, next) => {
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

    const user = await User.findById(decodedAccessToken._id);
    if (!user) {
      return next(errorHandler(403, 'User not found', 'Unauthorized'));
    }

    try {
      const decodedRefreshToken = jwt.verify(refreshToken, config.jwt_s);

      if (decodedRefreshToken._id !== decodedAccessToken._id) { 
        return next(errorHandler(403, 'Token mismatch', 'Unauthorized'));
      }
    } catch (err) {
      return next(errorHandler(403, 'Invalid refresh token', 'Unauthorized'));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(errorHandler(403, 'Unauthorized: Invalid tokens', 'Unauthorized'));
  }
};

module.exports = userAuthToken;
