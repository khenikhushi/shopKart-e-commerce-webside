const { sequelize } = require('../config/database');
const {
  Order,
  OrderItem,
  Cart,
  CartItem,
  Product,
  User,
} = require('../models/index');
const { AppError } = require('../middlewares/errorHandler.middleware');
const { getPagination, getPaginationMeta } = require('../utils/paginate.util');

/**
 * Build standard order includes for consistent responses
 */
const getOrderIncludes = () => [
  {
    model: User,
    as: 'user',
    attributes: ['id', 'name', 'email', 'slug'],
  },
  {
    model: OrderItem,
    as: 'items',
    include: [
      {
        model: Product,
        as: 'product',
        attributes: [
          'id',
          'name',
          'slug',
          'thumbnail_url',
          'brand',
        ],
        required: false,
      },
    ],
  },
];

const VALID_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const ROLE_ALLOWED_STATUS_UPDATES = {
  seller: ['confirmed', 'shipped','cancelled'],
  admin: ['out_for_delivery', 'delivered', 'cancelled'],
};

const restoreOrderStock = async (orderId, transaction) => {
  const orderItems = await OrderItem.findAll({
    where: { order_id: orderId },
    transaction,
  });

  for (const item of orderItems) {
    await Product.increment(
      { stock: item.quantity },
      {
        where: { id: item.product_id },
        transaction,
      }
    );
  }
};

const assertSellerCanManageOrder = async (orderId, sellerId) => {
  const matchingItem = await OrderItem.findOne({
    where: { order_id: orderId },
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id'],
        where: { seller_id: sellerId },
        required: true,
      },
    ],
  });

  if (!matchingItem) {
    throw new AppError('Order not found', 404);
  }
};

/**
 * Place a new order from the user's current cart
 * Uses Sequelize transaction — all or nothing
 * @param {string} userId
 * @param {string} shipping_address
 * @param {string} payment_method
 * @returns {Order}
 */

const placeOrder = async (
  userId, 
  shipping_address, 
  payment_method = 'cod',
  type = 'cart',
  productId = null,
  quantity = 1) => {
  // Step 1 — Fetch cart with items before opening transaction
  let items = [];
  let cartInstance = null; // Use a local variable name
  if(type === 'cart'){

    cartInstance = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: [
                'id',
                'name',
                'price',
                'stock',
                'is_active',
              ],
            },
          ],
        },
      ],
    });

    // Step 2 — Validate cart exists and is not empty
    if (!cartInstance || !cartInstance.items || cartInstance.items.length === 0) {
      throw new AppError(
        'Your cart is empty — add products before placing an order',
        400
      );
    }

  // Step 3 — Validate every item before touching the database
  const validationErrors = [];

  // for (const item of cart.items) 
  for (const item of cartInstance.items) {
    if (!item.product) {
      validationErrors.push(
        `A product in your cart no longer exists`
      );
      continue;
    }

    if (!item.product.is_active) {
      validationErrors.push(
        `"${item.product.name}" is no longer available`
      );
      continue;
    }

    if (item.product.stock < item.quantity) {
      validationErrors.push(
        `"${item.product.name}" — requested ${item.quantity} but only ${item.product.stock} in stock`
      );
    }
  }


  // If any validation failed abort before transaction
  if (validationErrors.length > 0) {
    throw new AppError(validationErrors.join(' | '), 400);
  }
          items =cartInstance.items;

} else if (type === 'buy_now') {

    const product = await Product.findByPk(productId, {
    attributes: ['id', 'name', 'price', 'stock', 'is_active'],
  });

    if (!product.is_active) throw new AppError('Product not found', 404);

    if (product.stock < quantity) {
    throw new AppError(
      `"${product.name}" — only ${product.stock} left in stock`,
      400
    );
  }

    items = [{
      product: {
      id: product.id,
      name: product.name,
      price: product.price
    },
      quantity
    }];
  }

  if (!items || items.length === 0) {
  throw new AppError('No items found for order', 400);
}

  // Step 4 — Calculate total amount
  const totalAmount = items.reduce((total, item) => {
    const price = item.product?.price ?? 0;
    return total + parseFloat(item.product.price) * item.quantity;
  }, 0);
console.log("TYPE:", type);
console.log("ITEMS:", items);
  // Step 5 — Begin transaction
  const transaction = await sequelize.transaction();

  try {
    // Step 6 — Create order record
    const order = await Order.create(
      {
        user_id: userId,
        shipping_address,
        payment_method,
        total_amount: parseFloat(totalAmount.toFixed(2)),
        status: 'pending',
        payment_status: 'pending',
      },
      { transaction }
    );

    // Step 7 — Create order items and deduct stock
    for (const item of items) {
      // Snapshot product name and price at time of order
      await OrderItem.create(
        {
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: parseFloat(item.product.price),
        },
        { transaction }
      );

      // Deduct stock
      await Product.decrement(
        { stock: item.quantity },
        {
          where: { id: item.product.id },
          transaction,
        }
      );
    }

    // Step 8 — Clear cart items
    if (type === 'cart' && cartInstance) {
    await CartItem.destroy({
      where: { cart_id: cartInstance.id },
      transaction,
    });
    }

    // Step 9 — Commit transaction
    await transaction.commit();

    // Step 10 — Return full order detail
    const result = await Order.findByPk(order.id, {
      include: getOrderIncludes(),
    });

    return result;
  } catch (error) {
    // Something failed — roll everything back
    await transaction.rollback();
    throw new AppError(
      `Order placement failed: ${error.message}`,
      500
    );
  }
};

/**
 * Get all orders for a specific user
 * @param {string} userId
 * @param {object} query
 * @returns {{ orders, pagination }}
 */
const getUserOrders = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await Order.findAndCountAll({
    where: { user_id: userId },
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'slug', 'thumbnail_url'],
            required: false,
          },
        ],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const pagination = getPaginationMeta(count, page, limit);

  return { orders: rows, pagination };
};

/**
 * Get all orders containing products owned by a seller
 * @param {string} sellerId
 * @param {object} query
 * @returns {{ orders, pagination }}
 */
const getSellerOrders = async (sellerId, query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await Order.findAndCountAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'slug'],
      },
      {
        model: OrderItem,
        as: 'items',
        required: true,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'slug', 'thumbnail_url'],
            where: { seller_id: sellerId },
            required: true,
          },
        ],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    subQuery: false,
    distinct: true,
  });

  const pagination = getPaginationMeta(count, page, limit);

  return { orders: rows, pagination };
};

/**
 * Get a single order by slug
 * Users can only view their own orders
 * @param {string} slug
 * @param {string} userId - null if admin
 * @returns {Order}
 */
const getOrderBySlug = async (slug, userId = null) => {
  const whereClause = { slug };

  // Scope to user if not admin
  if (userId) {
    whereClause.user_id = userId;
  }

  const order = await Order.findOne({
    where: whereClause,
    include: getOrderIncludes(),
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return order;
};

/**
 * Cancel an order — user can only cancel their own pending orders
 * @param {string} slug
 * @param {string} userId
 * @returns {Order}
 */
/**
 * Get a single order by slug for seller
 * Seller can only view if at least one item in order belongs to them
 * @param {string} slug
 * @param {string} sellerId
 * @returns {Order}
 */
const getSellerOrderBySlug = async (slug, sellerId) => {
  const order = await Order.findOne({
    where: { slug },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'slug'],
      },
      {
        model: OrderItem,
        as: 'items',
        required: true,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'slug', 'thumbnail_url', 'brand'],
            where: { seller_id: sellerId },
            required: true,
          },
        ],
      },
    ],
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return order;
};

const cancelOrder = async (slug, userId) => {
  const order = await Order.findOne({
    where: { slug, user_id: userId },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Customers can cancel pending or confirmed orders they placed themselves
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new AppError(
      `Cannot cancel order — current status is "${order.status}"`,
      400
    );
  }

  const transaction = await sequelize.transaction();

  try {
    await restoreOrderStock(order.id, transaction);

    // Update order status
    order.status = 'cancelled';
    await order.save({ transaction });

    await transaction.commit();

    return order;
  } catch (error) {
    await transaction.rollback();
    throw new AppError(
      `Order cancellation failed: ${error.message}`,
      500
    );
  }
};

/**
 * Get all orders — admin view
 * @param {object} query
 * @returns {{ orders, pagination }}
 */
const getAllOrdersAdmin = async (query) => {
  const { page, limit, offset } = getPagination(query);

  const whereClause = {};

  // Filter by status if provided
  if (query.status) {
    whereClause.status = query.status;
  }

  const { count, rows } = await Order.findAndCountAll({
    where: whereClause,
    include: getOrderIncludes(),
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const pagination = getPaginationMeta(count, page, limit);

  return { orders: rows, pagination };
};

/**
 * Update order status
 * Enforces role-based access and valid status transitions
 * @param {string} slug
 * @param {string} status
 * @param {{ id: string, role: string }} actor
 * @returns {Order}
 */
const updateOrderStatus = async (slug, status, actor) => {
  const order = await Order.findOne({ where: { slug } });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const allowedStatusesForRole = ROLE_ALLOWED_STATUS_UPDATES[actor?.role] || [];

  if (!allowedStatusesForRole.includes(status)) {
    throw new AppError(
      `Role "${actor?.role || 'unknown'}" cannot update order status to "${status}"`,
      403
    );
  }

  if (actor?.role === 'seller') {
    await assertSellerCanManageOrder(order.id, actor.id);
  }

  const allowedNext = VALID_STATUS_TRANSITIONS[order.status] || [];

  if (!allowedNext.includes(status)) {
    throw new AppError(
      `Invalid transition — cannot move from "${order.status}" to "${status}". Allowed: ${allowedNext.join(', ') || 'none'}`,
      400
    );
  }

  const transaction = await sequelize.transaction();

  try {
    if (status === 'cancelled') {
      await restoreOrderStock(order.id, transaction);
    }

    order.status = status;

    // COD orders become paid once delivery is confirmed
    if (status === 'delivered' && order.payment_method === 'cod') {
      order.payment_status = 'paid';
    }

    await order.save({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      `Order status update failed: ${error.message}`,
      500
    );
  }

  const result = await Order.findByPk(order.id, {
    include: getOrderIncludes(),
  });

  return result;
};

/**
 * Get admin dashboard stats
 * @returns {object}
 */
const getDashboardStats = async () => {
  const { Op } = require('sequelize');

  const totalUsers = await User.count({ where: { role: 'user' } });
  const totalSellers = await User.count({ where: { role: 'seller' } });
  const totalProducts = await Product.count({ where: { is_active: true } });
  const totalOrders = await Order.count();

  const revenueResult = await Order.findOne({
    attributes: [
      [
        sequelize.fn('SUM', sequelize.col('total_amount')),
        'totalRevenue',
      ],
    ],
    where: {
      status: {
        [Op.notIn]: ['cancelled'],
      },
    },
    raw: true,
  });

  const pendingOrders = await Order.count({
    where: { status: 'pending' },
  });

  return {
    totalUsers,
    totalSellers,
    totalProducts,
    totalOrders,
    pendingOrders,
    totalRevenue: parseFloat(
      revenueResult?.totalRevenue || 0
    ).toFixed(2),
  };
};

class OrderService {
  constructor() {
    this.placeOrder = placeOrder;
    this.getUserOrders = getUserOrders;
    this.getSellerOrders = getSellerOrders;
    this.getOrderBySlug = getOrderBySlug;
    this.getSellerOrderBySlug = getSellerOrderBySlug;
    this.cancelOrder = cancelOrder;
    this.getAllOrdersAdmin = getAllOrdersAdmin;
    this.updateOrderStatus = updateOrderStatus;
    this.getDashboardStats = getDashboardStats;
  }
}

module.exports = new OrderService();
