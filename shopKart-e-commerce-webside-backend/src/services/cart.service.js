const { Cart, CartItem, Product, User } = require('../models/index');
const { AppError } = require('../middlewares/errorHandler.middleware');

/**
 * Build standard cart include for consistent responses
 */
const getCartIncludes = () => [
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
          'slug',
          'price',
          'mrp',
          'stock',
          'thumbnail_url',
          'brand',
          'is_active',
        ],
      },
    ],
  },
];

/**
 * Calculate cart total from items
 * @param {CartItem[]} items
 * @returns {number}
 */
const calculateCartTotal = (items) => {
  return items.reduce((total, item) => {
    const price = parseFloat(item.product.price);
    return total + price * item.quantity;
  }, 0);
};

/**
 * Get or create a cart for a user
 * Core utility — called by every other cart method
 * @param {string} userId
 * @returns {Cart}
 */
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ where: { user_id: userId } });

  if (!cart) {
    cart = await Cart.create({ user_id: userId });
  }

  return cart;
};

/**
 * Get cart with all items and product details
 * @param {string} userId
 * @returns {{ cart, totalItems, totalAmount }}
 */
const getCartWithItems = async (userId) => {
  const cart = await Cart.findOne({
    where: { user_id: userId },
    include: getCartIncludes(),
  });

  // Return empty cart structure if no cart exists yet
  if (!cart) {
    return {
      cart: {
        id: null,
        user_id: userId,
        items: [],
      },
      totalItems: 0,
      totalAmount: 0,
    };
  }


  // Filter out items where product has been deactivated
//   const activeItems = cart.items.filter(
//     (item) => item.product && item.product.is_active
//   );

//   const totalItems = activeItems.reduce(
//     (sum, item) => sum + item.quantity,
//     0
//   );

//   const totalAmount = calculateCartTotal(activeItems);

//   return {
//     cart: {
//       ...cart.toJSON(),
//       items: activeItems,
//     },
//     totalItems,
//     totalAmount: parseFloat(totalAmount.toFixed(2)),
//   };
// };




const activeItems = cart.items
  .filter(item => item.product && item.product.is_active)
  .map(item => item.toJSON());

const totalItems = activeItems.reduce(
  (sum, item) => sum + item.quantity,
  0
);

const totalAmount = calculateCartTotal(activeItems);

return {
  cart: {
    ...cart.toJSON(),
    items: activeItems,
  },
  totalItems,
  totalAmount: parseFloat(totalAmount.toFixed(2)),
};
};

/**
 * Add a product to cart
 * If product already in cart — increment quantity
 * @param {string} userId
 * @param {string} productId
 * @param {number} quantity
 * @returns {{ cart, totalItems, totalAmount }}
 */
const addItemToCart = async (userId, productId, quantity) => {
  // Verify product exists and is active
  const product = await Product.findOne({
    where: { id: productId, is_active: true },
  });

  if (!product) {
    throw new AppError('Product not found or is no longer available', 404);
  }

  // Check stock availability
  if (product.stock < quantity) {
    throw new AppError(
      `Insufficient stock — only ${product.stock} unit(s) available`,
      400
    );
  }

  // Get or create the user's cart
  const cart = await getOrCreateCart(userId);

  // Check if product already exists in cart
  const existingItem = await CartItem.findOne({
    where: { cart_id: cart.id, product_id: productId },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    // Check combined quantity against stock
    if (newQuantity > product.stock) {
      throw new AppError(
        `Cannot add ${quantity} more — only ${product.stock - existingItem.quantity} additional unit(s) available`,
        400
      );
    }

    existingItem.quantity = newQuantity;
    await existingItem.save();
  } else {
    await CartItem.create({
      cart_id: cart.id,
      product_id: productId,
      quantity,
    });
  }

  // Return updated cart
  return getCartWithItems(userId);
};

/**
 * Update quantity of a specific cart item
 * @param {string} userId
 * @param {string} itemId
 * @param {number} quantity
 * @returns {{ cart, totalItems, totalAmount }}
 */
const updateCartItem = async (userId, itemId, quantity) => {
  // Find cart for this user
  const cart = await Cart.findOne({ where: { user_id: userId } });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  // Find the specific cart item and verify it belongs to this user's cart
  const cartItem = await CartItem.findOne({
    where: { id: itemId, cart_id: cart.id },
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'stock', 'is_active'],
      },
    ],
  });

  if (!cartItem) {
    throw new AppError('Cart item not found', 404);
  }

  if (!cartItem.product.is_active) {
    throw new AppError(
      'This product is no longer available',
      400
    );
  }

  // Check stock
  if (quantity > cartItem.product.stock) {
    throw new AppError(
      `Insufficient stock — only ${cartItem.product.stock} unit(s) available`,
      400
    );
  }

  cartItem.quantity = quantity;
  await cartItem.save();

  return getCartWithItems(userId);
};

/**
 * Remove a specific item from cart
 * @param {string} userId
 * @param {string} itemId
 * @returns {{ cart, totalItems, totalAmount }}
 */
const removeCartItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ where: { user_id: userId } });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const cartItem = await CartItem.findOne({
    where: { id: itemId, cart_id: cart.id },
  });

  if (!cartItem) {
    throw new AppError('Cart item not found', 404);
  }

  await cartItem.destroy();

  return getCartWithItems(userId);
};

/**
 * Clear all items from cart
 * Called after order is placed
 * @param {string} userId
 */
const clearCart = async (userId) => {
  const cart = await Cart.findOne({ where: { user_id: userId } });

  if (!cart) return;

  await CartItem.destroy({ where: { cart_id: cart.id } });
};

class CartService {
  constructor() {
    this.getOrCreateCart = getOrCreateCart;
    this.getCartWithItems = getCartWithItems;
    this.addItemToCart = addItemToCart;
    this.updateCartItem = updateCartItem;
    this.removeCartItem = removeCartItem;
    this.clearCart = clearCart;
  }
}

module.exports = new CartService();