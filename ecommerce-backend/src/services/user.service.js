const { Op } = require('sequelize');
const { User, Product, Order } = require('../models/index');
const { sequelize } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler.middleware');
const { getPagination, getPaginationMeta } = require('../utils/paginate.util');

/**
 * Get all users with pagination and optional role filter
 * @param {object} query - req.query
 * @returns {{ users, pagination }}
 */
const getAllUsers = async (query) => {
  const { page, limit, offset } = getPagination(query);

  const whereClause = {};

  // Filter by role if provided — ?role=seller
  if (query.role) {
    const validRoles = ['admin', 'seller', 'user'];
    if (!validRoles.includes(query.role)) {
      throw new AppError(
        'Invalid role filter — must be admin, seller or user',
        400
      );
    }
    whereClause.role = query.role;
  }

  // Search by name or email
  if (query.search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${query.search}%` } },
      { email: { [Op.like]: `%${query.search}%` } },
    ];
  }

  // Filter by active status
  if (query.is_active !== undefined) {
    whereClause.is_active = query.is_active === 'true';
  }

  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
    attributes: [
      'id',
      'name',
      'slug',
      'email',
      'role',
      'phone',
      'is_active',
      'created_at',
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const pagination = getPaginationMeta(count, page, limit);

  return { users: rows, pagination };
};

/**
 * Get a single user by slug with full details
 * For sellers — include their products count
 * For users — include their orders count
 * @param {string} slug
 * @returns {object}
 */
const getUserBySlug = async (slug) => {
  const user = await User.findOne({
    where: { slug },
    attributes: [
      'id',
      'name',
      'slug',
      'email',
      'role',
      'phone',
      'is_active',
      'created_at',
      'updated_at',
    ],
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const userJson = user.toJSON();

  // Attach seller-specific stats
  if (user.role === 'seller') {
    const productCount = await Product.count({
      where: { seller_id: user.id },
    });

    const activeProductCount = await Product.count({
      where: { seller_id: user.id, is_active: true },
    });

    userJson.sellerStats = {
      totalProducts: productCount,
      activeProducts: activeProductCount,
    };
  }

  // Attach user-specific stats
  if (user.role === 'user') {
    const orderCount = await Order.count({
      where: { user_id: user.id },
    });

    const totalSpentResult = await Order.findOne({
      attributes: [
        [
          require('../config/database')
            .sequelize.fn(
              'SUM',
              require('../config/database').sequelize.col(
                'total_amount'
              )
            ),
          'totalSpent',
        ],
      ],
      where: {
        user_id: user.id,
        status: {
          [Op.notIn]: ['cancelled'],
        },
      },
      raw: true,
    });

    userJson.userStats = {
      totalOrders: orderCount,
      totalSpent: parseFloat(
        totalSpentResult?.totalSpent || 0
      ).toFixed(2),
    };
  }

  return userJson;
};

/**
 * Activate or deactivate a user account
 * Admin cannot deactivate their own account
 * @param {string} slug
 * @param {boolean} is_active
 * @param {string} adminId - ID of the admin performing the action
 * @returns {User}
 */
const updateUserStatus = async (slug, is_active, adminId) => {
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findOne({ where: { slug }, transaction });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent admin from deactivating their own account
    if (user.id === adminId) {
      throw new AppError(
        'You cannot deactivate your own account',
        400
      );
    }

    // Prevent deactivating other admins
    if (user.role === 'admin' && !is_active) {
      throw new AppError(
        'Cannot deactivate an admin account',
        400
      );
    }

    user.is_active = is_active;
    await user.save({ transaction });

    let deactivatedProductCount = 0;

    // Business rule: when seller is deactivated, deactivate all active products.
    if (user.role === 'seller' && is_active === false) {
      const [updatedCount] = await Product.update(
        { is_active: false },
        {
          where: {
            seller_id: user.id,
            is_active: true,
          },
          transaction,
        }
      );

      deactivatedProductCount = updatedCount;
    }

    await transaction.commit();

    return {
      id: user.id,
      name: user.name,
      slug: user.slug,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      deactivatedProductCount,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

class UserService {
  constructor() {
    this.getAllUsers = getAllUsers;
    this.getUserBySlug = getUserBySlug;
    this.updateUserStatus = updateUserStatus;
  }
}

module.exports = new UserService();