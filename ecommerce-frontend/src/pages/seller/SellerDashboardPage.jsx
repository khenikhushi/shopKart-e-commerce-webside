import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import SellerSidebar from '../../components/seller/SellerSidebar';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import productApi from '../../api/product.api';
import orderApi from '../../api/order.api';
import {
  formatDate,
} from '../../utils/format.util';
import '../../styles/sidebar.css';
import '../../styles/dashboard.css';

const SellerDashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [productStats, setProductStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [productsRes, ordersRes] = await Promise.all([
        productApi.getSellerProducts({ page: 1, limit: 100 }),
        orderApi.getSellerOrders({ page: 1, limit: 5 }),
      ]);

      const products =
        productsRes.data.data.products || [];
      const totalProducts = products.length;
      const activeProducts = products.filter(
        (p) => p.is_active
      ).length;
      const outOfStock = products.filter(
        (p) => p.stock === 0
      ).length;
      const lowStock = products.filter(
        (p) => p.stock > 0 && p.stock < 5
      ).length;

      setProductStats({
        totalProducts,
        activeProducts,
        outOfStock,
        lowStock,
      });

      setRecentOrders(ordersRes.data.data.orders || []);
    } catch (err) {
      // Try fetching just products if orders fail
      try {
        const productsRes =
          await productApi.getSellerProducts({
            page: 1,
            limit: 100,
          });
        const products =
          productsRes.data.data.products || [];
        setProductStats({
          totalProducts: products.length,
          activeProducts: products.filter(
            (p) => p.is_active
          ).length,
          outOfStock: products.filter(
            (p) => p.stock === 0
          ).length,
          lowStock: products.filter(
            (p) => p.stock > 0 && p.stock < 5
          ).length,
        });
      } catch (err2) {
        setError(
          err2.response?.data?.message ||
            err.response?.data?.message ||
            'Failed to load dashboard data.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <SellerSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="admin-content">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(true)}
          >
            ☰ Menu
          </button>

          <div className="page-title">
            Seller Dashboard
          </div>
          <div className="page-subtitle">
            Welcome back! Here is your store overview —{' '}
            {formatDate(new Date())}
          </div>

          {loading && (
            <Loader fullPage text="Loading dashboard..." />
          )}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={fetchDashboardData}
            />
          )}

          {!loading && !error && productStats && (
            <>
              {/* Stat cards */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-lg-3">
                  <div className="stat-card blue
                    position-relative">
                    <div className="stat-label">
                      Total Products
                    </div>
                    <div className="stat-value">
                      {productStats.totalProducts}
                    </div>
                    <div className="stat-sub">
                      All listings
                    </div>
                    <span className="stat-icon">📦</span>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="stat-card green
                    position-relative">
                    <div className="stat-label">
                      Active
                    </div>
                    <div className="stat-value">
                      {productStats.activeProducts}
                    </div>
                    <div className="stat-sub">
                      Visible to buyers
                    </div>
                    <span className="stat-icon">✅</span>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="stat-card orange
                    position-relative">
                    <div className="stat-label">
                      Low Stock
                    </div>
                    <div className="stat-value">
                      {productStats.lowStock}
                    </div>
                    <div className="stat-sub">
                      Less than 5 units
                    </div>
                    <span className="stat-icon">⚠️</span>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="stat-card red
                    position-relative">
                    <div className="stat-label">
                      Out of Stock
                    </div>
                    <div className="stat-value">
                      {productStats.outOfStock}
                    </div>
                    <div className="stat-sub">
                      Needs restocking
                    </div>
                    <span className="stat-icon">📭</span>
                  </div>
                </div>
              </div>

              {/* Recent orders summary */}
              <div className="section-card mb-3">
                <div className="section-card-title">
                  Recent Orders
                </div>
                <div style={{ fontSize: 14, color: '#555' }}>
                  {recentOrders.length} latest orders loaded.
                </div>
              </div>

              {/* Quick actions */}
              <div className="section-card mb-3">
                <div className="section-card-title">
                  Quick Actions
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {[
                    {
                      label: 'Add New Product',
                      path: '/seller/products/add',
                      icon: '➕',
                      primary: true,
                    },
                    {
                      label: 'View My Products',
                      path: '/seller/products',
                      icon: '📦',
                    },
                    {
                      label: 'View My Orders',
                      path: '/seller/orders',
                      icon: '🛒',
                    },
                  ].map((action) => (
                    <button
                      key={action.path}
                      className={`btn btn-sm ${
                        action.primary
                          ? 'btn-primary'
                          : 'btn-outline-primary'
                      }`}
                      onClick={() =>
                        navigate(action.path)
                      }
                      style={{ borderRadius: 4 }}
                    >
                      {action.icon} {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              {productStats.outOfStock > 0 && (
                <div className="alert alert-danger
                  d-flex align-items-center gap-2"
                  style={{ fontSize: 13 }}>
                  <span>🚨</span>
                  <span>
                    <strong>
                      {productStats.outOfStock} product(s)
                    </strong>{' '}
                    are out of stock. Update your inventory.
                  </span>
                  <button
                    className="btn btn-sm btn-danger ms-auto"
                    onClick={() =>
                      navigate('/seller/products')
                    }
                  >
                    Fix Now
                  </button>
                </div>
              )}

              {productStats.lowStock > 0 && (
                <div className="alert alert-warning
                  d-flex align-items-center gap-2"
                  style={{ fontSize: 13 }}>
                  <span>⚠️</span>
                  <span>
                    <strong>
                      {productStats.lowStock} product(s)
                    </strong>{' '}
                    are running low on stock.
                  </span>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default SellerDashboardPage;