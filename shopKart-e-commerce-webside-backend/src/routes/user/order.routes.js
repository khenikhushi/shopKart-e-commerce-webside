const { Router } = require('express');
const orderController = require('../../controllers/order.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { placeOrderValidator } = require('../../validators/order.validator');

const router = Router();

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Place a new order
 *     description: Create a new order from the user's current cart. Clears cart after successful order placement.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               notes:
 *                 type: string
 *     responses:
 *       '201':
 *         $ref: '#/components/responses/CreatedResponse'
 *       '400':
 *         $ref: '#/components/responses/BadRequestResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.post(
  '/',
  placeOrderValidator,
  validate,
  orderController.placeOrder
);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get user's order history
 *     description: Retrieve all orders placed by the current user with pagination support
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/PaginatedResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/', orderController.getUserOrders);

/**
 * @swagger
 * /api/v1/orders/{slug}:
 *   get:
 *     summary: Get single order details
 *     description: Retrieve complete information for a specific order including items and tracking
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: ORD-2024-001-abc123
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/:slug', orderController.getOrderBySlug);

/**
 * @swagger
 * /api/v1/orders/{slug}/cancel:
 *   post:
 *     summary: Cancel an order
 *     description: Cancel a pending order. Can only cancel orders that haven't been shipped.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: ORD-2024-001-abc123
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '400':
 *         $ref: '#/components/responses/BadRequestResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.post('/:slug/cancel', orderController.cancelOrder);

module.exports = router;
