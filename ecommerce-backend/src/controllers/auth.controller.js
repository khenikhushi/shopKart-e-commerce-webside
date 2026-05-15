const authService = require('../services/auth.service');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const {
  sendSuccess,
  sendCreated,
} = require('../utils/response.util');

class AuthController {
  constructor() {
    /**
     * @group Authentication
     * @route POST /api/v1/auth/register
     */
    this.register = asyncHandler(async (req, res) => {
      const { name, email, password, role, phone } = req.body;

      const result = await authService.register({
        name,
        email,
        password,
        role,
        phone,
      });

      return sendCreated(res, 'Registration successful', {
        user: result.user,
        token: result.token,
      });
    });

    /**
     * @group Authentication
     * @route POST /api/v1/auth/login
     */
    this.login = asyncHandler(async (req, res) => {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      return sendSuccess(res, 'Login successful', {
        user: result.user,
        token: result.token,
      });
    });

    /**
     * @group Authentication
     * @route GET /api/v1/auth/me
     */
    this.getMe = asyncHandler(async (req, res) => {
      const user = await authService.getMe(req.user.id);

      return sendSuccess(res, 'Profile fetched successfully', { user });
    });
  }
}

module.exports = new AuthController();