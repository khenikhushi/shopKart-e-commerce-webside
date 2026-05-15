const { Router } = require('express');
const filterController = require('../../controllers/filter.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  createFilterValidator,
  addFilterValueValidator,
} = require('../../validators/filter.validator');

const router = Router();

/**
 * @swagger
 * /api/v1/admin/filters:
 *   get:
 *     summary: Get all filters (admin view)
 *     description: Retrieve all filters with their values (admin-only view)
 *     tags:
 *       - Admin Filters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/', filterController.getAllFiltersAdmin);

/**
 * @swagger
 * /api/v1/admin/filters:
 *   post:
 *     summary: Create a new filter
 *     description: Create a new filter for a subcategory (e.g., Color, Size)
 *     tags:
 *       - Admin Filters
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
 *               - subCategoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Color
 *               subCategoryId:
 *                 type: string
 *                 format: uuid
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
  createFilterValidator,
  validate,
  filterController.createFilter
);

/**
 * @swagger
 * /api/v1/admin/filters/{filterId}/values:
 *   post:
 *     summary: Add filter value
 *     description: Add a new value to an existing filter (e.g., add "Red" to Color filter)
 *     tags:
 *       - Admin Filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filterId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 example: Red
 *     responses:
 *       '201':
 *         $ref: '#/components/responses/CreatedResponse'
 *       '400':
 *         $ref: '#/components/responses/BadRequestResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.post(
  '/:filterId/values',
  addFilterValueValidator,
  validate,
  filterController.addFilterValue
);

/**
 * @swagger
 * /api/v1/admin/filters/{filterId}:
 *   delete:
 *     summary: Delete filter
 *     description: Delete a filter and all its values
 *     tags:
 *       - Admin Filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filterId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.delete('/:filterId', filterController.deleteFilter);

/**
 * @swagger
 * /api/v1/admin/filters/{filterId}/values/{valueId}:
 *   delete:
 *     summary: Delete filter value
 *     description: Delete a single value from a filter
 *     tags:
 *       - Admin Filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filterId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.delete(
  '/:filterId/values/:valueId',
  filterController.deleteFilterValue
);

module.exports = router;
