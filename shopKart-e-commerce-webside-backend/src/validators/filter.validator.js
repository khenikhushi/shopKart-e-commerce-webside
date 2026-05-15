const { body, param } = require('express-validator');

const createFilterValidator = [
  body('subcategory_id')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage('subcategory_id must be a valid UUID'),

  body('category_id')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage('category_id must be a valid UUID'),

  body().custom((bodyData) => {
    if (!bodyData.category_id && !bodyData.subcategory_id) {
      throw new Error('Either category_id or subcategory_id is required');
    }
    return true;
  }),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Filter name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('display_name')
    .trim()
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Display name must be between 2 and 100 characters'),

  body('filter_type')
    .notEmpty()
    .withMessage('Filter type is required')
    .isIn(['checkbox', 'range', 'radio'])
    .withMessage('Filter type must be checkbox, range or radio'),
];

const addFilterValueValidator = [
  param('filterId')
    .notEmpty()
    .withMessage('Filter ID is required')
    .isUUID()
    .withMessage('Filter ID must be a valid UUID'),

  body('value')
    .trim()
    .notEmpty()
    .withMessage('Filter value is required')
    .isLength({ min: 1, max: 150 })
    .withMessage('Value must be between 1 and 150 characters'),
];

const assignProductFiltersValidator = [
  body('filters')
    .isArray()
    .withMessage('filters must be an array'),

  body('filters.*.filter_value_id')
    .notEmpty()
    .withMessage('Each filter must have a filter_value_id')
    .isUUID()
    .withMessage('filter_value_id must be a valid UUID'),
];

module.exports = {
  createFilterValidator,
  addFilterValueValidator,
  assignProductFiltersValidator,
};
