const { Router } = require('express');
const cartController = require('../../controllers/cart.controller');
const { validate } = require('../../middlewares/validate.middleware');
const {
  addCartItemValidator,
  updateCartItemValidator,
} = require('../../validators/cart.validator');

const router = Router();

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get current user's cart
 *     description: Retrieve all items in the current user's shopping cart with totals
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /api/v1/cart/items:
 *   post:
 *     summary: Add product to cart
 *     description: Add a new product item to the user's shopping cart or update quantity if already exists
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       '201':
 *         $ref: '#/components/responses/CreatedResponse'
 *       '400':
 *         $ref: '#/components/responses/BadRequestResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.post(
  '/items',
  addCartItemValidator,
  validate,
  cartController.addItem
);

/**
 * @swagger
 * /api/v1/cart/items/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     description: Update the quantity of an item in the shopping cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
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
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '404':
 *         $ref: '#/components/responses/NotFoundResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.put(
  '/items/:itemId',
  updateCartItemValidator,
  validate,
  cartController.updateItem
);

/**
 * @swagger
 * /api/v1/cart/items/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a single item from the user's shopping cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
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
router.delete('/items/:itemId', cartController.removeItem);

/**
 * @swagger
 * /api/v1/cart:
 *   delete:
 *     summary: Clear entire cart
 *     description: Remove all items from the user's shopping cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SuccessResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
router.delete('/', cartController.clearCart);

module.exports = router;
