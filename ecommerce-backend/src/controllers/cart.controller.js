const cartService = require('../services/cart.service');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { sendSuccess } = require('../utils/response.util');
const {
  getApiBaseUrlFromRequest,
  normalizeCartImageData,
} = require('../utils/image.util');

class CartController {
  constructor() {
    /**
     * @group Cart
     * @route GET /api/v1/cart
     */
    this.getCart = asyncHandler(async (req, res) => {
      const result = await cartService.getCartWithItems(req.user.id);
      const normalizedResult = normalizeCartImageData(
        result,
        getApiBaseUrlFromRequest(req)
      );

      return sendSuccess(res, 'Cart fetched successfully', normalizedResult);
    });

    /**
     * @group Cart
     * @route POST /api/v1/cart/items
     */
    this.addItem = asyncHandler(async (req, res) => {
      const { product_id, quantity } = req.body;

      const result = await cartService.addItemToCart(
        req.user.id,
        product_id,
        quantity
      );
      const normalizedResult = normalizeCartImageData(
        result,
        getApiBaseUrlFromRequest(req)
      );

      return sendSuccess(res, 'Item added to cart successfully', normalizedResult);
    });

    /**
     * @group Cart
     * @route PUT /api/v1/cart/items/:itemId
     */
    this.updateItem = asyncHandler(async (req, res) => {
      const result = await cartService.updateCartItem(
        req.user.id,
        req.params.itemId,
        req.body.quantity
      );
      const normalizedResult = normalizeCartImageData(
        result,
        getApiBaseUrlFromRequest(req)
      );

      return sendSuccess(res, 'Cart item updated successfully', normalizedResult);
    });

    /**
     * @group Cart
     * @route DELETE /api/v1/cart/items/:itemId
     */
    this.removeItem = asyncHandler(async (req, res) => {
      const result = await cartService.removeCartItem(
        req.user.id,
        req.params.itemId
      );
      const normalizedResult = normalizeCartImageData(
        result,
        getApiBaseUrlFromRequest(req)
      );

      return sendSuccess(res, 'Item removed from cart successfully', normalizedResult);
    });

    /**
     * @group Cart
     * @route DELETE /api/v1/cart
     */
    this.clearCart = asyncHandler(async (req, res) => {
      await cartService.clearCart(req.user.id);

      return sendSuccess(res, 'Cart cleared successfully');
    });
  }
}

module.exports = new CartController();
