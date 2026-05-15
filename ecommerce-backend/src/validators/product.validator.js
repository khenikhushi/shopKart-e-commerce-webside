const { body, param, query } = require('express-validator');

const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Name must be between 3 and 200 characters'),

  body('subcategory_id')
    .trim()
    .notEmpty()
    .withMessage('subcategory_id is required')
    .isUUID()
    .withMessage('subcategory_id must be a valid UUID'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),

  body('mrp')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('MRP must be a positive number'),

  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand cannot exceed 100 characters'),

  // Optional image field; multer handles the file, controller sets the path
  body('image')
    .optional(),
];

const updateProductValidator = [
  param('slug')
    .notEmpty()
    .withMessage('Product slug is required'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Name must be between 3 and 200 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),

  body('mrp')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('MRP must be a positive number'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand cannot exceed 100 characters'),

  body('image')
    .optional(),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be true or false'),
];

const getProductsValidator = [
  query('search')
    .optional()
    .trim()
    .isString()
    .withMessage('Search term must be a string'),
  query('category')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Category must be a valid UUID'),
  query('sortBy')
    .optional()
    .trim()
    .isIn(['price', 'name', 'createdAt', 'relevance'])
    .withMessage('Invalid sortBy value. Must be one of: price, name, createdAt, relevance'),
  query('order')
    .optional()
    .trim()
    .isIn(['asc', 'desc'])
    .withMessage('Invalid order value. Must be one of: asc, desc'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  getProductsValidator,
};