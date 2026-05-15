const { body, param } = require('express-validator');

const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

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

  body('parent_category_id')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage('parent_category_id must be a valid UUID'),
];

const updateCategoryValidator = [
  param('slug')
    .notEmpty()
    .withMessage('Category slug is required'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

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

  body('parent_category_id')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage('parent_category_id must be a valid UUID'),
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator,
};
