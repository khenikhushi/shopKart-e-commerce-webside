const morgan = require('morgan');
const logger = require('../utils/logger.util');

/**
 * HTTP request logger middleware
 * Logs: method, URL, status code, response time
 * Uses morgan with a custom stream that writes to Winston
 */

class LoggerMiddleware {
  constructor() {
    this.stream = {
      write: (message) => {
        logger.info(message.trim());
      },
    };

    this.skip = () => {
      return process.env.NODE_ENV === 'test';
    };

    this.requestLogger = morgan(
      ':method :url :status :res[content-length] bytes - :response-time ms',
      { stream: this.stream, skip: this.skip }
    );
  }
}

const loggerMiddleware = new LoggerMiddleware();

module.exports = { requestLogger: loggerMiddleware.requestLogger };