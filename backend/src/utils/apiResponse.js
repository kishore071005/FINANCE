const apiResponse = {
  success: (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  error: (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  },

  created: (res, data, message = 'Resource created successfully') => {
    return apiResponse.success(res, data, message, 201);
  },

  badRequest: (res, message = 'Bad Request', errors = null) => {
    return apiResponse.error(res, message, 400, errors);
  },

  notFound: (res, message = 'Resource not found') => {
    return apiResponse.error(res, message, 404);
  },

  unauthorized: (res, message = 'Unauthorized') => {
    return apiResponse.error(res, message, 401);
  },

  forbidden: (res, message = 'Forbidden') => {
    return apiResponse.error(res, message, 403);
  }
};

module.exports = apiResponse;