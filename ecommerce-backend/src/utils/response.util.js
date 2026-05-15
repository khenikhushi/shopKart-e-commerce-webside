/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {string} message - Human readable message
 * @param {any} data - Response payload
 * @param {number} statusCode - HTTP status code (default 200)
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 */
const sendCreated = (res, message, data = null) => {
  return sendSuccess(res, message, data, 201);
};

/**
 * Send a paginated success response
 * @param {object} res
 * @param {string} message
 * @param {any} data
 * @param {object} pagination - { totalItems, totalPages, currentPage, limit }
 */
const sendPaginated = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

/**
 * Send an error response
 * @param {object} res
 * @param {string} message
 * @param {number} statusCode
 * @param {any} errors - Validation errors or extra detail
 */
const sendError = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendError,
};