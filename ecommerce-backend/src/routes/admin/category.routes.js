const { Router } = require('express');
const categoryController = require('../../controllers/category.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  createCategoryValidator,
  updateCategoryValidator,
} = require('../../validators/category.validator');

const router = Router();

/**
 * @swagger
 * /api/v1/admin/categories:
 *   get:
 *     summary: Get all categories (admin view)
 *     description: Retrieve all categories including inactive ones (admin-only view)
 *     tags:
 *       - Admin Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/', categoryController.getAllCategoriesAdmin);

/**
 * @swagger
 * /api/v1/admin/categories:
 *   post:
 *     summary: Create a new category
 *     description: Create a new product category (admin only)
 *     tags:
 *       - Admin Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
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
  createCategoryValidator,
  validate,
  categoryController.createCategory
);

/**
 * @swagger
 * /api/v1/admin/categories/{slug}:
 *   put:
 *     summary: Update a category
 *     description: Update category details (admin only)
 *     tags:
 *       - Admin Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: electronics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
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
  updateCategoryValidator,
  validate,
  categoryController.updateCategory
);

/**
 * @swagger
 * /api/v1/admin/categories/{slug}:
 *   delete:
 *     summary: Delete a category
 *     description: Delete a product category (admin only)
 *     tags:
 *       - Admin Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: electronics
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '400':
 *         $ref: '#/components/responses/BadRequestResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.delete('/:slug', categoryController.deleteCategory);

module.exports = router;
