const { Router } = require('express');
const orderController = require('../../controllers/order.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  updateOrderStatusValidator,
} = require('../../validators/order.validator');

const router = Router();

/**
 * @swagger
 * /api/v1/admin/orders:
 *   get:
 *     summary: Get all orders (admin view)
 *     description: Retrieve all orders from the platform with filtering options
 *     tags:
 *       - Admin Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/PaginatedResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/', orderController.getAllOrdersAdmin);

/**
 * @swagger
 * /api/v1/admin/orders/{slug}:
 *   get:
 *     summary: Get single order details (admin view)
 *     description: Retrieve complete order information including buyer and seller details
 *     tags:
 *       - Admin Orders
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
 * /api/v1/admin/orders/{slug}/status:
 *   patch:
 *     summary: Update order status
 *     description: Update order processing status (admin only)
 *     tags:
 *       - Admin Orders
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
