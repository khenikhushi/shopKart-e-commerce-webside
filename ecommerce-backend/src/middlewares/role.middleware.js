const { AppError } = require('./errorHandler.middleware');

/**
 * Role guard middleware factory
 * Returns a middleware that only allows specified roles
 *
 * Usage:
 *   requireRole('admin')              — admin only
 *   requireRole('seller')             — seller only
 *   requireRole('admin', 'seller')    — admin OR seller
 *
 * Always use AFTER authenticate middleware
 */
class RoleMiddleware {
  requireRole = (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return next(
          new AppError('Access denied — authentication required', 401)
        );
      }

      if (!roles.includes(req.user.role)) {
        return next(
          new AppError(
            `Access denied — requires role: ${roles.join(' or ')}`,
            403
          )
        );
      }

      next();
    };
  };
}

const roleMiddleware = new RoleMiddleware();

module.exports = { requireRole: roleMiddleware.requireRole };