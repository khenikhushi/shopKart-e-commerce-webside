const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  registerValidator,
  loginValidator,
} = require('../validators/auth.validator');

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user or seller
 *     description: Create a new account with email and password. Role defaults to 'user'.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Minimum 6 characters with at least 1 number
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [user, seller]
 *                 default: user
 *                 example: user
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: "+919876543210"
 *     responses:
 *       '201':
 *         $ref: '#/components/responses/AuthResponse'
 *       '409':
 *         $ref: '#/components/responses/ConflictResponse'
 *       '422':
 *         $ref: '#/components/responses/ValidationErrorResponse'
 */
router.post(
  '/register',
  registerValidator,
  validate,
  authController.register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login and receive JWT token
 *     description: Authenticate user with email and password to receive a JWT bearer token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/AuthResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.post(
  '/login',
  loginValidator,
  validate,
  authController.login
);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Fetch the profile of the currently authenticated user. Requires valid JWT token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
