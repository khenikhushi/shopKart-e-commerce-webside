const { verifyToken } = require('../utils/jwt.util');
const { AppError } = require('./errorHandler.middleware');
const { User } = require('../models/index');

/**
 * Authenticate middleware
 * Verifies JWT from Authorization header
 * Attaches decoded user to req.user
 *
 * Usage: router.get('/profile', authenticate, controller.getProfile)
 */
class AuthMiddleware {
  authenticate = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(
          'Access denied — no token provided',
          401
        );
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        throw new AppError('Access denied — invalid token format', 401);
      }

      const decoded = verifyToken(token);

      // Fetch fresh user from DB to ensure account still exists and is active
      const user = await User.findOne({
        where: {
          id: decoded.id,
          is_active: true,
        },
      });

      if (!user) {
        throw new AppError(
          'Access denied — user no longer exists or is deactivated',
          401
        );
      }

      // Attach user to request for downstream middleware and controllers
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        slug: user.slug,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

const authMiddleware = new AuthMiddleware();

module.exports = { authenticate: authMiddleware.authenticate };