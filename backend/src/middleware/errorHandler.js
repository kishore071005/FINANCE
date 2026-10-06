const apiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((val) => val.message);
    message = 'Validation Error';
    return apiResponse.error(res, message, statusCode, errors);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value entered';
    return apiResponse.error(res, message, statusCode);
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
    return apiResponse.error(res, message, statusCode);
  }

  // Log full details server-side only — never send them to clients.
  console.error(err);

  // Don't expose stack traces or internal details in production
  if (statusCode >= 500) {
    return res.status(statusCode).json({
      success: false,
      message: 'Internal Server Error'
    });
  }

  const errorResponse = {
    success: false,
    message
  };

  return res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;