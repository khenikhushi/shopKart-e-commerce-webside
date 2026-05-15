const { body, param } = require('express-validator');

const placeOrderValidator = [
  body('shipping_address')
    .trim()
    .notEmpty()
    .withMessage('Shipping address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage(
      'Shipping address must be between 10 and 500 characters'
    ),

  body('payment_method')
    .optional()
    .isIn(['cod', 'online'])
    .withMessage('Payment method must be cod or online'),

  body('buy_now')
    .optional()
    .isBoolean()
    .withMessage('Invalid buy_now flag'),

  body('product_id')
    .if((value, { req }) => req.body.buy_now === true)
    .notEmpty()
    .withMessage('Product id is required for buy now')
    .bail()
    .isUUID(4)
    .withMessage('Product id must be a valid UUID'),

  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

const updateOrderStatusValidator = [
  param('slug')
    .notEmpty()
    .withMessage('Order slug is required'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn([
      'confirmed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ])
    .withMessage(
      'Invalid status value'
    ),
];

module.exports = {
  placeOrderValidator,
  updateOrderStatusValidator,
};
