const logger = require('../utils/logger.util');
const { sendError } = require('../utils/response.util');

/**
 * Custom application error class
 * Use this to throw controlled errors from services
 * Example: throw new AppError('Product not found', 404)
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * Must be registered LAST in app.js after all routes
 * Prevents exposure of sensitive information in production
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 422;
    message = err.errors.map((e) => e.message).join(', ');
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = `${err.errors[0]?.path || 'value'} already exists`;
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference — related record does not exist';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired — please login again';
  }

  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds maximum limit (5MB)';
    }
  }

  // Do NOT expose stack traces or detailed errors in production
  if (process.env.NODE_ENV === 'production') {
    // Generic message for 5xx errors to avoid leaking internal details
    if (statusCode >= 500) {
      message = 'An error occurred. Please try again later.';
    }
  }

  // Log all errors with full details for debugging
  if (statusCode >= 500) {
    logger.error(`${statusCode} — ${message}`, { 
      stack: err.stack,
      originalMessage: err.message,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn(`${statusCode} — ${message}`, {
      path: req.path,
      method: req.method,
    });
  }

  return sendError(res, message, statusCode);
};

/**
 * Wrap async controller functions to avoid try/catch in every controller
 * Usage: router.get('/', asyncHandler(controller.getAll))
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { AppError, errorHandler, asyncHandler };
