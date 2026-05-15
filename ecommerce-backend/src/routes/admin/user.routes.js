const { Router } = require('express');
const userController = require('../../controllers/user.controller');

const router = Router();

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users with optional filtering by role, search, and status
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, seller]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
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
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /api/v1/admin/users/{slug}:
 *   get:
 *     summary: Get user details with stats
 *     description: Retrieve single user information including order count, total spent, etc.
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: john-doe-abc123
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/:slug', userController.getUserBySlug);

/**
 * @swagger
 * /api/v1/admin/users/{slug}/status:
 *   patch:
 *     summary: Update user account status
 *     description: Activate or deactivate a user account
 *     tags:
 *       - Admin Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: john-doe-abc123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *               reason:
 *                 type: string
 *                 description: Reason for deactivation (if isActive is false)
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.patch('/:slug/status', userController.updateUserStatus);

module.exports = router;
