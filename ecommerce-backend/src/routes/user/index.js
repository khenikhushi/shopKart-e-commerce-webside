/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Product category management and browsing
 *   - name: SubCategories
 *     description: Product subcategory operations
 *   - name: Filters
 *     description: Product filtering and search
 *   - name: Storefront
 *     description: Storefront display and featured products
 *   - name: Products
 *     description: Product browsing and details
 *   - name: Cart
 *     description: Shopping cart operations (requires authentication)
 *   - name: Orders
 *     description: Order management and history (requires authentication)
 */

const { Router } = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const publicRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');

const router = Router();

// ─── Public Browse Routes ─────────────────────────────────
router.use('/', publicRoutes);

// ─── Cart Routes ──────────────────────────────────────────
router.use(
  '/cart',
  authenticate,
  requireRole('user'),
  cartRoutes
);

// ─── Order Routes ─────────────────────────────────────────
router.use(
  '/orders',
  authenticate,
  requireRole('user'),
  orderRoutes
);

module.exports = router;