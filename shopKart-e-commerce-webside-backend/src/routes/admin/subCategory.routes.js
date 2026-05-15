const { Router } = require('express');
const subCategoryController = require('../../controllers/subCategory.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  createSubCategoryValidator,
  updateSubCategoryValidator,
} = require('../../validators/subCategory.validator');

const router = Router();

/**
 * @swagger
 * /api/v1/admin/subcategories:
 *   get:
 *     summary: Get all subcategories (admin view)
 *     description: Retrieve all subcategories including inactive ones (admin-only view)
 *     tags:
 *       - Admin SubCategories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/', subCategoryController.getAllSubCategoriesAdmin);

/**
 * @swagger
 * /api/v1/admin/subcategories:
 *   post:
 *     summary: Create a new subcategory
 *     description: Create a new subcategory under a parent category (admin only)
 *     tags:
 *       - Admin SubCategories
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
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptops
 *               categoryId:
 *                 type: string
 *                 format: uuid
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
  createSubCategoryValidator,
  validate,
  subCategoryController.createSubCategory
);

/**
 * @swagger
 * /api/v1/admin/subcategories/{slug}:
 *   put:
 *     summary: Update a subcategory
 *     description: Update subcategory details (admin only)
 *     tags:
 *       - Admin SubCategories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: laptops
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
  updateSubCategoryValidator,
  validate,
  subCategoryController.updateSubCategory
);

/**
 * @swagger
 * /api/v1/admin/subcategories/{slug}:
 *   delete:
 *     summary: Delete a subcategory
 *     description: Delete a subcategory (admin only)
 *     tags:
 *       - Admin SubCategories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: laptops
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
router.delete('/:slug', subCategoryController.deleteSubCategory);

module.exports = router;
