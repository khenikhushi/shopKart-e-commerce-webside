const { Router } = require('express');
const orderController = require('../../controllers/order.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  updateOrderStatusValidator,
} = require('../../validators/order.validator');

const router = Router();

/**
 * @swagger
 * /api/v1/seller/orders:
 *   get:
 *     summary: Get seller's orders
 *     description: Retrieve all orders containing this seller's products with pagination
 *     tags:
 *       - Seller Orders
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
router.get('/', orderController.getSellerOrders);

/**
 * @swagger
 * /api/v1/seller/orders/{slug}:
 *   get:
 *     summary: Get single order detail
 *     description: Retrieve complete order information including items belonging to this seller
 *     tags:
 *       - Seller Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: ORD-20240316-A1B2C3
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/:slug', orderController.getSellerOrderBySlug);

/**
 * @swagger
 * /api/v1/seller/orders/{slug}/status:
 *   patch:
 *     summary: Update order status
 *     description: Update the status of seller-managed order items (seller only)
 *     tags:
 *       - Seller Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: ORD-20240316-A1B2C3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *               trackingNumber:
 *                 type: string
 *                 description: Tracking number for shipped orders
 *               notes:
 *                 type: string
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
router.patch(
  '/:slug/status',
  updateOrderStatusValidator,
  validate,
  orderController.updateOrderStatus
);

module.exports = router;
