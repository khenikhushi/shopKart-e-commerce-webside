import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminStatCard from '../../components/admin/AdminStatCard';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import orderApi from '../../api/order.api';
import { formatCurrency, formatDate } from '../../utils/format.util';
import '../../styles/sidebar.css';
import '../../styles/dashboard.css';

const AdminDashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.getDashboard();
      setStats(res.data.data.stats);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load dashboard stats.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="admin-content">
          {/* Mobile toggle */}
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(true)}
          >
            ☰ Menu
          </button>

          {/* Page header */}
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">
            Welcome back! Here is what is happening on shopKart
            today — {formatDate(new Date())}
          </div>

          {loading && <Loader fullPage text="Loading stats..." />}

          {error && (
            <ErrorMessage message={error} onRetry={fetchStats} />
          )}

          {!loading && !error && stats && (
            <>
              {/* Stat Cards Row 1 */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-lg-3">
                  <AdminStatCard
                    label="Total Users"
                    value={stats.totalUsers}
                    icon="👤"
                    color="blue"
                    sub="Registered buyers"
                  />
                </div>
                <div className="col-6 col-lg-3">
                  <AdminStatCard
                    label="Total Sellers"
                    value={stats.totalSellers}
                    icon="🏪"
                    color="purple"
                    sub="Active seller accounts"
                  />
                </div>
                <div className="col-6 col-lg-3">
                  <AdminStatCard
                    label="Total Products"
                    value={stats.totalProducts}
                    icon="📦"
                    color="green"
                    sub="Active listings"
                  />
                </div>
                <div className="col-6 col-lg-3">
                  <AdminStatCard
                    label="Total Orders"
                    value={stats.totalOrders}
                    icon="🛒"
                    color="orange"
                    sub={`${stats.pendingOrders} pending`}
                  />
                </div>
              </div>

              {/* Revenue Card — full width */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-lg-4">
                  <AdminStatCard
                    label="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    icon="💰"
                    color="teal"
                    sub="Excluding cancelled orders"
                  />
                </div>
                <div className="col-12 col-lg-4">
                  <AdminStatCard
                    label="Pending Orders"
                    value={stats.pendingOrders}
                    icon="⏳"
                    color="red"
                    sub="Awaiting confirmation"
                  />
                </div>
                <div className="col-12 col-lg-4">
                  <AdminStatCard
                    label="Platform Health"
                    value="Good"
                    icon="✅"
                    color="green"
                    sub="All systems operational"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="section-card">
                <div className="section-card-title">
                  Quick Actions
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {[
                    {
                      label: 'Manage Users',
                      path: '/admin/users',
                      icon: '👥',
                    },
                    {
                      label: 'View Orders',
                      path: '/admin/orders',
                      icon: '🛒',
                    },
                    {
                      label: 'Add Category',
                      path: '/admin/categories',
                      icon: '📁',
                    },
                    {
                      label: 'All Products',
                      path: '/admin/products',
                      icon: '📦',
                    },
                  ].map((action) => (
                    <a
                      key={action.path}
                      href={action.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 18px',
                        background: '#f0f4ff',
                        borderRadius: 6,
                        color: 'var(--primary)',
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: 'none',
                        border: '1px solid #d0deff',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'var(--primary)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          '#f0f4ff';
                        e.currentTarget.style.color =
                          'var(--primary)';
                      }}
                    >
                      <span>{action.icon}</span>
                      {action.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Summary Table */}
              <div className="section-card">
                <div className="section-card-title">
                  Platform Summary
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Count</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Registered Users</td>
                      <td><strong>{stats.totalUsers}</strong></td>
                      <td>
                        <span className="status-badge badge-active">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Verified Sellers</td>
                      <td><strong>{stats.totalSellers}</strong></td>
                      <td>
                        <span className="status-badge badge-active">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Live Products</td>
                      <td><strong>{stats.totalProducts}</strong></td>
                      <td>
                        <span className="status-badge badge-active">
                          Published
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Total Orders</td>
                      <td><strong>{stats.totalOrders}</strong></td>
                      <td>
                        <span className="status-badge badge-confirmed">
                          {stats.pendingOrders} Pending
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Total Revenue</td>
                      <td>
                        <strong>
                          {formatCurrency(stats.totalRevenue)}
                        </strong>
                      </td>
                      <td>
                        <span className="status-badge badge-active">
                          Collected
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminDashboardPage;