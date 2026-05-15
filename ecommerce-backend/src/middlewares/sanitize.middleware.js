/**
 * Sanitize user inputs to prevent XSS attacks
 * Removes potentially dangerous HTML/JavaScript from strings
 */
class SanitizeMiddleware {
  sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    // Strip HTML tags and common script-like patterns.
    return str
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  sanitizeInput = (obj, excludeFields = ['password_hash']) => {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeInput(item, excludeFields));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (excludeFields.includes(key)) {
          sanitized[key] = value; // Don't sanitize passwords/hashes
        } else if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else {
          sanitized[key] = this.sanitizeInput(value, excludeFields);
        }
      }
      return sanitized;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    return obj;
  };

  sanitizeRequestBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeInput(req.body, ['password', 'password_hash']);
    }
    next();
  };
}

const sanitizeMiddleware = new SanitizeMiddleware();

module.exports = {
  sanitizeString: sanitizeMiddleware.sanitizeString,
  sanitizeInput: sanitizeMiddleware.sanitizeInput,
  sanitizeRequestBody: sanitizeMiddleware.sanitizeRequestBody,
};
