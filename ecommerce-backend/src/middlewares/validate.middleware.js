const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response.util');

/**
 * Validation runner middleware
 * Collects all express-validator errors and returns them
 * Must be placed AFTER the validator array in a route
 *
 * Usage in route:
 *   router.post('/', productValidator.create, validate, controller.create)
 */
class ValidateMiddleware {
  validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));

      return sendError(
        res,
        'Validation failed',
        422,
        formattedErrors
      );
    }

    next();
  };
}

const validateMiddleware = new ValidateMiddleware();

module.exports = { validate: validateMiddleware.validate };