import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoleRoute from './RoleRoute';

import LoginPage from '../pages/common/LoginPage';
import RegisterPage from '../pages/common/RegisterPage';
import NotFoundPage from '../pages/common/NotFoundPage';
import ProfilePage from '../pages/common/ProfilePage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminUserDetailPage from '../pages/admin/AdminUserDetailPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminSubCategoriesPage from '../pages/admin/AdminSubCategoriesPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';

import SellerDashboardPage from '../pages/seller/SellerDashboardPage';
import SellerProductsPage from '../pages/seller/SellerProductsPage';
import SellerAddProductPage from '../pages/seller/SellerAddProductPage';
import SellerEditProductPage from '../pages/seller/SellerEditProductPage';
import SellerOrdersPage from '../pages/seller/SellerOrdersPage';

import HomePage from '../pages/user/HomePage';
import ProductListPage from '../pages/user/ProductListPage';
import ProductDetailPage from '../pages/user/ProductDetailPage';
import CartPage from '../pages/user/CartPage';
import CheckoutPage from '../pages/user/CheckoutPage';
import OrderHistoryPage from '../pages/user/OrderHistoryPage';
import PrivateRoute from './PrivateRoute';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes ─────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/profile" element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        } />

        {/* ── Admin routes ──────────────────────────── */}
        <Route path="/admin/dashboard" element={
          <RoleRoute requiredRole="admin"><AdminDashboardPage /></RoleRoute>
        } />
        <Route path="/admin/users" element={
          <RoleRoute requiredRole="admin"><AdminUsersPage /></RoleRoute>
        } />
        <Route path="/admin/users/:slug" element={
          <RoleRoute requiredRole="admin"><AdminUserDetailPage /></RoleRoute>
        } />
        <Route path="/admin/categories" element={
          <RoleRoute requiredRole="admin"><AdminCategoriesPage /></RoleRoute>
        } />
        <Route path="/admin/subcategories" element={
          <RoleRoute requiredRole="admin"><AdminSubCategoriesPage /></RoleRoute>
        } />
        <Route path="/admin/products" element={
          <RoleRoute requiredRole="admin"><AdminProductsPage /></RoleRoute>
        } />
        <Route path="/admin/orders" element={
          <RoleRoute requiredRole="admin"><AdminOrdersPage /></RoleRoute>
        } />

        {/* ── Seller routes ─────────────────────────── */}
        <Route path="/seller/dashboard" element={
          <RoleRoute requiredRole="seller"><SellerDashboardPage /></RoleRoute>
        } />
        <Route path="/seller/products" element={
          <RoleRoute requiredRole="seller"><SellerProductsPage /></RoleRoute>
        } />
        <Route path="/seller/products/add" element={
          <RoleRoute requiredRole="seller"><SellerAddProductPage /></RoleRoute>
        } />
        <Route path="/seller/products/edit/:slug" element={
          <RoleRoute requiredRole="seller"><SellerEditProductPage /></RoleRoute>
        } />
        <Route path="/seller/orders" element={
          <RoleRoute requiredRole="seller"><SellerOrdersPage /></RoleRoute>
        } />

        {/* ── User routes ───────────────────────────── */}
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={
          <RoleRoute requiredRole="user"><CartPage /></RoleRoute>
        } />
        <Route path="/checkout" element={
          <RoleRoute requiredRole="user"><CheckoutPage /></RoleRoute>
        } />
        <Route path="/orders" element={
          <RoleRoute requiredRole="user"><OrderHistoryPage /></RoleRoute>
        } />

        {/* ── 404 ───────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
