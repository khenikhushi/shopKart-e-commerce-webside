/**
 * Database Query Optimization Utilities
 * Provides query strategy patterns to avoid N+1 and improve performance
 */

const { sequelize } = require('../config/database');
const logger = require('./logger.util');

/**
 * Logging utility for query performance
 */
const logQueryTime = (query, startTime, threshold = 100) => {
  const duration = Date.now() - startTime;
  if (duration > threshold) {
    logger.warn(`Slow query detected (${duration}ms): ${query}`);
  }
};

/**
 * Pagination helper
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @returns {{ offset: number, limit: number }}
 */
const getPaginationParams = (page = 1, limit = 20) => {
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  
  return {
    offset: (page - 1) * limit,
    limit,
  };
};

/**
 * Eager load associations to prevent N+1 queries
 * @example
 * const products = await Product.findAll({
 *   include: eagerLoadAssociations.product,
 *   limit: 20,
 * });
 */
const eagerLoadAssociations = {
  product: [
    {
      association: 'seller',
      attributes: ['id', 'name', 'email', 'slug'],
    },
    {
      association: 'subCategory',
      attributes: ['id', 'name', 'slug'],
      include: [
        {
          association: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    },
    {
      association: 'filters',
      attributes: ['id', 'name'],
      through: { attributes: [] }, // Exclude pivot table fields
    },
  ],

  category: [
    {
      association: 'children',
      attributes: ['id', 'name', 'slug'],
    },
    {
      association: 'parent',
      attributes: ['id', 'name', 'slug'],
    },
    {
      association: 'subCategories',
      attributes: ['id', 'name', 'slug'],
    },
  ],

  subCategory: [
    {
      association: 'category',
      attributes: ['id', 'name', 'slug'],
    },
    {
      association: 'products',
      attributes: ['id', 'name', 'price', 'thumbnail_url'],
      limit: 5, // Limit related products to 5
    },
  ],

  order: [
    {
      association: 'user',
      attributes: ['id', 'name', 'email'],
    },
    {
      association: 'orderItems',
      include: [
        {
          association: 'product',
          attributes: ['id', 'name', 'price', 'thumbnail_url'],
        },
      ],
    },
  ],

  cartItem: [
    {
      association: 'product',
      attributes: ['id', 'name', 'price', 'stock', 'thumbnail_url'],
    },
  ],
};

/**
 * Build query parameters with common safe defaults
 */
const buildSafeQueryOptions = (options = {}) => {
  const {
    include = [],
    attributes = undefined,
    limit = 20,
    offset = 0,
    order = [['created_at', 'DESC']],
    paranoid = true, // Respect soft deletes
    raw = false,
    subQuery = false,
    distinct = true, // Important for counts with includes
    ...rest
  } = options;

  return {
    include,
    attributes,
    limit,
    offset,
    order,
    paranoid,
    raw,
    subQuery,
    distinct,
    ...rest,
  };
};

/**
 * Count with include (properly handles counts when using associations)
 */
const countWithInclude = async (model, options = {}) => {
  const { include = [], where = {}, paranoid = true } = options;

  return model.count({
    where,
    include,
    paranoid,
    distinct: true,
  });
};

/**
 * Transaction wrapper for multiple operations
 */
const withTransaction = async (callback) => {
  const transaction = await sequelize.transaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Bulk operations helper
 */
const bulkCreate = async (model, data, options = {}) => {
  const { transaction = null, batch = 500 } = options;

  for (let i = 0; i < data.length; i += batch) {
    const chunk = data.slice(i, i + batch);
    await model.bulkCreate(chunk, {
      transaction,
      individualHooks: false, // Faster for bulk operations
    });
  }
};

module.exports = {
  logQueryTime,
  getPaginationParams,
  eagerLoadAssociations,
  buildSafeQueryOptions,
  countWithInclude,
  withTransaction,
  bulkCreate,
};
