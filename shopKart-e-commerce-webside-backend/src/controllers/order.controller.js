const orderService = require('../services/order.service');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const {
  sendSuccess,
  sendCreated,
  sendPaginated,
} = require('../utils/response.util');
const {
  getApiBaseUrlFromRequest,
  normalizeOrderImage,
  normalizeOrderCollection,
} = require('../utils/image.util');

class OrderController {
  constructor() {
    /**
     * @group Orders
     * @route POST /api/v1/orders
     */
    this.placeOrder = asyncHandler(async (req, res) => {
      const {
        shipping_address,
        payment_method,
        buy_now,
        product_id,
        quantity,
      } = req.body;

      const order = await orderService.placeOrder(
        req.user.id,
        shipping_address,
        payment_method,
        buy_now ? 'buy_now' : 'cart',
        buy_now ? product_id : null,
        buy_now ? quantity : 1
      );
      const normalizedOrder = normalizeOrderImage(
        order,
        getApiBaseUrlFromRequest(req)
      );

      return sendCreated(res, 'Order placed successfully', { order: normalizedOrder });
    });

    /**
     * @group Orders
     * @route GET /api/v1/orders
     */
    this.getUserOrders = asyncHandler(async (req, res) => {
      const { orders, pagination } = await orderService.getUserOrders(
        req.user.id,
        req.query
      );
      const normalizedOrders = normalizeOrderCollection(
        orders,
        getApiBaseUrlFromRequest(req)
      );

      return sendPaginated(
        res,
        'Orders fetched successfully',
        { orders: normalizedOrders },
        pagination
      );
    });

    /**
     * @group Orders — Seller
     * @route GET /api/v1/seller/orders
     */
    this.getSellerOrders = asyncHandler(async (req, res) => {
      const { orders, pagination } = await orderService.getSellerOrders(
        req.user.id,
        req.query
      );
      const normalizedOrders = normalizeOrderCollection(
        orders,
        getApiBaseUrlFromRequest(req)
      );

      return sendPaginated(
        res,
        'Orders fetched successfully',
        { orders: normalizedOrders },
        pagination
      );
    });

    /**
     * @group Orders
     * @route GET /api/v1/orders/:slug
     */
    this.getOrderBySlug = asyncHandler(async (req, res) => {
      const order = await orderService.getOrderBySlug(
        req.params.slug,
        req.user.role === 'admin' ? null : req.user.id
      );
      const normalizedOrder = normalizeOrderImage(
        order,
        getApiBaseUrlFromRequest(req)
      );

      return sendSuccess(res, 'Order fetched successfully', { order: normalizedOrder });
    });

    /**
     * @group Orders — Seller
     * @route GET /api/v1/seller/orders/:slug
     */
    this.getSellerOrderBySlug = asyncHandler(async (req, res) => {
      const order = await orderService.getSellerOrderBySlug(
        req.params.slug,
        req.user.id
      );
      const normalizedOrder = normalizeOrderImage(
        order,
        getApiBaseUrlFromRequest(req)
      );

      return sendSuccess(res, 'Order fetched successfully', { order: normalizedOrder });
    });

    /**
     * @group Orders
     * @route POST /api/v1/orders/:slug/cancel
     */
    this.cancelOrder = asyncHandler(async (req, res) => {
      const order = await orderService.cancelOrder(
        req.params.slug,
        req.user.id
      );
      const normalizedOrder = normalizeOrderImage(
        order,
        getApiBaseUrlFromRequest(req)
      );

      return sendSuccess(res, 'Order cancelled successfully', { order: normalizedOrder });
    });

    /**
     * @group Orders — Admin
     * @route GET /api/v1/admin/orders
     */
    this.getAllOrdersAdmin = asyncHandler(async (req, res) => {
      const { orders, pagination } = await orderService.getAllOrdersAdmin(
        req.query
      );
      const normalizedOrders = normalizeOrderCollection(
        orders,
        getApiBaseUrlFromRequest(req)
      );

      return sendPaginated(
        res,
        'All orders fetched successfully',
        { orders: normalizedOrders },
        pagination
      );
    });

    /**
     * @group Orders
     * @route PATCH /api/v1/admin/orders/:slug/status
     * @route PATCH /api/v1/seller/orders/:slug/status
     */
    this.updateOrderStatus = asyncHandler(async (req, res) => {
      const order = await orderService.updateOrderStatus(
        req.params.slug,
        req.body.status,
        req.user
      );
      const normalizedOrder = normalizeOrderImage(
        order,
        getApiBaseUrlFromRequest(req)
      );

      return sendSuccess(res, 'Order status updated successfully', { order: normalizedOrder });
    });

    /**
     * @group Admin
     * @route GET /api/v1/admin/dashboard
     */
    this.getDashboard = asyncHandler(async (req, res) => {
      const stats = await orderService.getDashboardStats();

      return sendSuccess(res, 'Dashboard stats fetched successfully', {
        stats,
      });
    });
  }
}

module.exports = new OrderController();
