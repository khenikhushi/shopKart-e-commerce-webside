const { body, param } = require('express-validator');

const createSubCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('SubCategory name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('category_id')
    .trim()
    .notEmpty()
    .withMessage('category_id is required')
    .isUUID()
    .withMessage('category_id must be a valid UUID'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
];

const updateSubCategoryValidator = [
  param('slug')
    .notEmpty()
    .withMessage('SubCategory slug is required'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('category_id')
    .optional()
    .isUUID()
    .withMessage('category_id must be a valid UUID'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be true or false'),
];

module.exports = {
  createSubCategoryValidator,
  updateSubCategoryValidator,
};