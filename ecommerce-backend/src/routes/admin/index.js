/**
 * @swagger
 * tags:
 *   - name: Admin Dashboard
 *     description: Platform statistics and analytics (admin only)
 *   - name: Admin Users
 *     description: User management (admin only)
 *   - name: Admin Categories
 *     description: Category management (admin only)
 *   - name: Admin SubCategories
 *     description: Subcategory management (admin only)
 *   - name: Admin Filters
 *     description: Product filter management (admin only)
 *   - name: Admin Products
 *     description: Product approval and management (admin only)
 *   - name: Admin Orders
 *     description: Order management and tracking (admin only)
 */

const { Router } = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const categoryRoutes = require('./category.routes');
const subCategoryRoutes = require('./subCategory.routes');
const filterRoutes = require('./filter.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const dashboardRoutes = require('./dashboard.routes');
const userRoutes = require('./user.routes');

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

// ─── Mount All Admin Sub-routes ───────────────────────────
router.use('/dashboard',     dashboardRoutes);
router.use('/users',         userRoutes);
router.use('/categories',    categoryRoutes);
router.use('/subcategories', subCategoryRoutes);
router.use('/filters',       filterRoutes);
router.use('/products',      productRoutes);
router.use('/orders',        orderRoutes);

module.exports = router;