const { body, param } = require('express-validator');

const addCartItemValidator = [
  body('product_id')
    .trim()
    .notEmpty()
    .withMessage('product_id is required')
    .isUUID()
    .withMessage('product_id must be a valid UUID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

const updateCartItemValidator = [
  param('itemId')
    .notEmpty()
    .withMessage('Cart item ID is required')
    .isUUID()
    .withMessage('Cart item ID must be a valid UUID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

module.exports = {
  addCartItemValidator,
  updateCartItemValidator,
};