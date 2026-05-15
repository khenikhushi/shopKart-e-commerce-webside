const { PAGINATION } = require('../config/constants');

/**
 * Extract and normalize pagination params from query string
 * Usage: const { limit, offset, page } = getPagination(req.query)
 *
 * @param {object} query - req.query
 * @returns {{ page, limit, offset }}
 */
const getPagination = (query) => {
  let page = parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT;

  if (page < 1) page = 1;
  if (limit < 1) limit = PAGINATION.DEFAULT_LIMIT;
  if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Build pagination metadata for the response
 * @param {number} totalItems - Total records from DB (count)
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {{ totalItems, totalPages, currentPage, limit, hasNextPage, hasPrevPage }}
 */
const getPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { getPagination, getPaginationMeta };