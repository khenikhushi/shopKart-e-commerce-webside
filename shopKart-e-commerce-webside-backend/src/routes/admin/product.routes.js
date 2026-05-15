const { Router } = require('express');
const productController = require('../../controllers/product.controller');

const router = Router();

/**
 * @swagger
 * /api/v1/admin/products:
 *   get:
 *     summary: Get all products (admin view)
 *     description: Retrieve all products across all sellers with admin filtering options
 *     tags:
 *       - Admin Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: seller
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/PaginatedResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/', productController.getAllProductsAdmin);

/**
 * @swagger
 * /api/v1/admin/products/{slug}/status:
 *   patch:
 *     summary: Update product status
 *     description: Approve, reject, or change product status (admin only)
 *     tags:
 *       - Admin Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: iphone-15-pro
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
 *                 enum: [approved, rejected, pending]
 *               rejectionReason:
 *                 type: string
 *                 description: Required if status is rejected
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.patch('/:slug/status', productController.updateProductStatus);

module.exports = router;
