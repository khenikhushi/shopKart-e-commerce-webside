const { Router } = require('express');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin/index');
const sellerRoutes = require('./seller/index');
const userRoutes = require('./user/index');

const router = Router();

// ─── Auth ─────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ─── Admin ────────────────────────────────────────────────
router.use('/admin', adminRoutes);

// ─── Seller ───────────────────────────────────────────────
router.use('/seller', sellerRoutes);

// ─── Public / User ────────────────────────────────────────
router.use('/', userRoutes);

module.exports = router;