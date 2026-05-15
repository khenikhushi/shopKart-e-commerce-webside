/**
 * @swagger
 * tags:
 *   - name: Seller Products
 *     description: Product management for sellers (seller only)
 *   - name: Seller Orders
 *     description: Order management for sellers (seller only)
 */

const { Router } = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');

const router = Router();

router.use(authenticate);
router.use(requireRole('seller'));

// ─── Mount Seller Sub-routes ──────────────────────────────
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

module.exports = router;