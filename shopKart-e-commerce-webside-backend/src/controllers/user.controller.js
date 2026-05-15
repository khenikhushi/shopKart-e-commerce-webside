const userService = require('../services/user.service');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { AppError } = require('../middlewares/errorHandler.middleware');
const {
  sendSuccess,
  sendPaginated,
} = require('../utils/response.util');

class UserController {
  constructor() {
    /**
     * @group Users — Admin
     * @route GET /api/v1/admin/users
     */
    this.getAllUsers = asyncHandler(async (req, res) => {
      const { users, pagination } = await userService.getAllUsers(
        req.query
      );

      return sendPaginated(
        res,
        'Users fetched successfully',
        { users },
        pagination
      );
    });

    /**
     * @group Users — Admin
     * @route GET /api/v1/admin/users/:slug
     */
    this.getUserBySlug = asyncHandler(async (req, res) => {
      const user = await userService.getUserBySlug(req.params.slug);

      return sendSuccess(res, 'User fetched successfully', { user });
    });

    /**
     * @group Users — Admin
     * @route PATCH /api/v1/admin/users/:slug/status
     */
    this.updateUserStatus = asyncHandler(async (req, res) => {
      const { is_active } = req.body;

      if (typeof is_active !== 'boolean') {
        throw new AppError('is_active must be a boolean value', 400);
      }

      const user = await userService.updateUserStatus(
        req.params.slug,
        is_active,
        req.user.id
      );

      return sendSuccess(
        res,
        `User account ${is_active ? 'activated' : 'deactivated'} successfully`,
        { user }
      );
    });
  }
}

module.exports = new UserController();