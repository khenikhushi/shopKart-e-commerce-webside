const { Router } = require('express');
const orderController = require('../../controllers/order.controller');

const router = Router();

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get platform statistics
 *     description: Retrieve dashboard statistics including total sales, orders, users, etc. (admin only)
 *     tags:
 *       - Admin Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/', orderController.getDashboard);

module.exports = router;
