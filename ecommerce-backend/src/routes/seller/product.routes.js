const { Router } = require('express');
const productController = require('../../controllers/product.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  createProductValidator,
  updateProductValidator,
} = require('../../validators/product.validator');
const {
  assignProductFiltersValidator,
} = require('../../validators/filter.validator');
const upload = require('../../middlewares/upload.middleware');

const router = Router();

/**
 * @swagger
 * /api/v1/seller/products:
 *   get:
 *     summary: Get seller's products
 *     description: Retrieve all products belonging to the logged-in seller
 *     tags:
 *       - Seller Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
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
router.get('/', productController.getSellerProducts);

/**
 * @swagger
 * /api/v1/seller/products:
 *   post:
 *     summary: Create a new product
 *     description: Add a new product listing with images and details (seller only)
 *     tags:
 *       - Seller Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: iPhone 15 Pro
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 999.99
 *               category:
 *                 type: string
 *               brand:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images (max 5)
 *     responses:
 *       '201':
 *         $ref: '#/components/responses/CreatedResponse'
 *       '400':
 *         $ref: '#/components/responses/ValidationErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.post(
  '/',
  upload.productImages(),
  createProductValidator,
  validate,
  productController.createProduct
);

/**
 * @swagger
 * /api/v1/seller/products/{slug}:
 *   get:
 *     summary: Get seller's product details
 *     description: Retrieve details of one of the seller's own products
 *     tags:
 *       - Seller Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: iphone-15-pro
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/:slug', productController.getSellerProductBySlug);

/**
 * @swagger
 * /api/v1/seller/products/{slug}:
 *   put:
 *     summary: Update seller's product
 *     description: Update product details and/or images (seller only, can only update own products)
 *     tags:
 *       - Seller Products
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.put(
  '/:slug',
  upload.productImages(),
  updateProductValidator,
  validate,
  productController.updateProduct
);

/**
 * @swagger
 * /api/v1/seller/products/{slug}:
 *   delete:
 *     summary: Delete seller's product
 *     description: Delete a product listing (seller only, can only delete own products)
 *     tags:
 *       - Seller Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: iphone-15-pro
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.delete('/:slug', productController.deleteProduct);

/**
 * @swagger
 * /api/v1/seller/products/{slug}/filters:
 *   post:
 *     summary: Assign filter values to product
 *     description: Add filter values (like color, size, etc.) to a product
 *     tags:
 *       - Seller Products
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
 *               - filters
 *             properties:
 *               filters:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     filterId:
 *                       type: string
 *                     valueId:
 *                       type: string
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
router.post(
  '/:slug/filters',
  assignProductFiltersValidator,
  validate,
  productController.assignFilters
);

module.exports = router;
