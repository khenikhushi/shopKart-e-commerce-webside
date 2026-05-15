import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmModal from '../../components/common/ConfirmModal';
import userApi from '../../api/user.api';
import {
  formatDate,
  formatCurrency,
} from '../../utils/format.util';
import '../../styles/sidebar.css';
import '../../styles/dashboard.css';

const AdminUserDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status toggle
  const [toggleModalOpen, setToggleModalOpen] =
    useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({
    show: false, message: '', type: 'success',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({
        show: false, message: '', type: 'success',
      }),
      3000
    );
  };

  const fetchUser = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userApi.getBySlug(slug);
      setUser(res.data.data.user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load user.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [slug]);

  const handleToggleStatus = async () => {
    if (!user) return;
    setToggleLoading(true);
    try {
      await userApi.updateStatus(user.slug, {
        is_active: !user.is_active,
      });
      showToast(
        `Account ${!user.is_active
          ? 'activated'
          : 'deactivated'} successfully!`
      );
      setToggleModalOpen(false);
      setUser((prev) =>
        prev
          ? { ...prev, is_active: !prev.is_active }
          : null
      );
    } catch (err) {
      showToast(
        err.response?.data?.message ||
        'Status update failed.',
        'error'
      );
      setToggleModalOpen(false);
    } finally {
      setToggleLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const map = {
      admin: '#084298',
      seller: '#856404',
      user: '#432874',
    };
    return map[role] || '#444';
  };

  const getRoleBg = (role) => {
    const map = {
      admin: '#cfe2ff',
      seller: '#fff3cd',
      user: '#e2d9f3',
    };
    return map[role] || '#eee';
  };

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <AdminSidebar
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

          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb"
              style={{ fontSize: 13 }}>
              <li className="breadcrumb-item">
                <button
                  className="btn btn-link p-0"
                  style={{ fontSize: 13 }}
                  onClick={() => navigate('/admin/users')}
                >
                  Users
                </button>
              </li>
              <li className="breadcrumb-item active">
                {user?.name || 'User Detail'}
              </li>
            </ol>
          </nav>

          {loading && (
            <Loader fullPage text="Loading user profile..." />
          )}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={fetchUser}
              fullPage
            />
          )}

          {!loading && !error && user && (
            <div className="row g-3">

              {/* Left column — Profile card */}
              <div className="col-lg-4">
                <div className="section-card text-center
                  mb-3">
                  {/* Avatar */}
                  <div style={{
                    width: 80, height: 80,
                    borderRadius: '50%',
                    background: getRoleBg(user.role),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    fontWeight: 700,
                    color: getRoleColor(user.role),
                    margin: '0 auto 12px',
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <h5 style={{
                    fontWeight: 700, marginBottom: 4,
                  }}>
                    {user.name}
                  </h5>

                  <div style={{
                    fontSize: 13,
                    color: '#878787',
                    marginBottom: 10,
                  }}>
                    {user.email}
                  </div>

                  {/* Role badge */}
                  <span style={{
                    background: getRoleBg(user.role),
                    color: getRoleColor(user.role),
                    padding: '3px 12px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'capitalize',
                  }}>
                    {user.role}
                  </span>

                  <div style={{
                    marginTop: 10,
                    marginBottom: 16,
                  }}>
                    <span className={`status-badge
                      ${user.is_active
                        ? 'badge-active'
                        : 'badge-inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Toggle button — not for admins */}
                  {user.role !== 'admin' && (
                    <button
                      className={`btn btn-sm w-100 ${
                        user.is_active
                          ? 'btn-outline-danger'
                          : 'btn-outline-success'
                      }`}
                      onClick={() =>
                        setToggleModalOpen(true)
                      }
                    >
                      {user.is_active
                        ? '🔴 Deactivate Account'
                        : '🟢 Activate Account'}
                    </button>
                  )}
                </div>

                {/* Account Info card */}
                <div className="section-card">
                  <div className="section-card-title">
                    Account Details
                  </div>
                  <table style={{
                    width: '100%', fontSize: 13,
                  }}>
                    <tbody>
                      <tr>
                        <td style={{
                          color: '#878787',
                          paddingBottom: 8,
                          width: '45%',
                        }}>
                          Phone
                        </td>
                        <td style={{
                          fontWeight: 500,
                          paddingBottom: 8,
                        }}>
                          {user.phone || '—'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{
                          color: '#878787',
                          paddingBottom: 8,
                        }}>
                          Slug
                        </td>
                        <td style={{ paddingBottom: 8 }}>
                          <code style={{
                            fontSize: 11,
                            background: '#f1f3f6',
                            padding: '2px 6px',
                            borderRadius: 3,
                          }}>
                            {user.slug}
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ color: '#878787' }}>
                          Joined
                        </td>
                        <td style={{ fontWeight: 500 }}>
                          {formatDate(user.created_at)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{
                          color: '#878787',
                          paddingTop: 8,
                        }}>
                          Updated
                        </td>
                        <td style={{
                          fontWeight: 500,
                          paddingTop: 8,
                        }}>
                          {formatDate(user.updated_at)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right column — Stats */}
              <div className="col-lg-8">

                {/* Seller stats */}
                {user.role === 'seller' &&
                  user.sellerStats && (
                  <div className="section-card mb-3">
                    <div className="section-card-title">
                      Seller Statistics
                    </div>
                    <div className="row g-3">
                      <div className="col-6">
                        <div style={{
                          background: '#f0f4ff',
                          borderRadius: 8,
                          padding: 16,
                          textAlign: 'center',
                        }}>
                          <div style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: 'var(--primary)',
                          }}>
                            {user.sellerStats.totalProducts}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: '#878787',
                            marginTop: 4,
                          }}>
                            Total Products
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div style={{
                          background: '#f0faf3',
                          borderRadius: 8,
                          padding: 16,
                          textAlign: 'center',
                        }}>
                          <div style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: '#26a541',
                          }}>
                            {user.sellerStats.activeProducts}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: '#878787',
                            marginTop: 4,
                          }}>
                            Active Products
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      marginTop: 16,
                      padding: 12,
                      background: '#fffbf0',
                      borderRadius: 6,
                      fontSize: 13,
                      color: '#856404',
                    }}>
                      📦{' '}
                      {user.sellerStats.totalProducts -
                        user.sellerStats.activeProducts}{' '}
                      inactive product(s) hidden from buyers.
                    </div>
                  </div>
                )}

                {/* User stats */}
                {user.role === 'user' &&
                  user.userStats && (
                  <div className="section-card mb-3">
                    <div className="section-card-title">
                      Buyer Statistics
                    </div>
                    <div className="row g-3">
                      <div className="col-6">
                        <div style={{
                          background: '#f0f4ff',
                          borderRadius: 8,
                          padding: 16,
                          textAlign: 'center',
                        }}>
                          <div style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: 'var(--primary)',
                          }}>
                            {user.userStats.totalOrders}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: '#878787',
                            marginTop: 4,
                          }}>
                            Total Orders
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div style={{
                          background: '#f0faf3',
                          borderRadius: 8,
                          padding: 16,
                          textAlign: 'center',
                        }}>
                          <div style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#26a541',
                          }}>
                            {formatCurrency(
                              user.userStats.totalSpent
                            )}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: '#878787',
                            marginTop: 4,
                          }}>
                            Total Spent
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin info panel */}
                {user.role === 'admin' && (
                  <div className="section-card mb-3">
                    <div className="section-card-title">
                      Admin Account
                    </div>
                    <div style={{
                      padding: 16,
                      background: '#f0f4ff',
                      borderRadius: 8,
                      fontSize: 14,
                      color: '#444',
                    }}>
                      <div style={{
                        fontSize: 24,
                        marginBottom: 8,
                      }}>
                        🛡️
                      </div>
                      This is an administrator account with
                      full platform access. Admin accounts
                      cannot be deactivated.
                    </div>
                  </div>
                )}

                {/* Quick actions */}
                <div className="section-card">
                  <div className="section-card-title">
                    Quick Actions
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-outline-primary
                        btn-sm"
                      onClick={() =>
                        navigate('/admin/users')
                      }
                    >
                      ← Back to Users
                    </button>
                    {user.role === 'seller' && (
                      <button
                        className="btn btn-outline-secondary
                          btn-sm"
                        onClick={() =>
                          navigate('/admin/products')
                        }
                      >
                        View All Products
                      </button>
                    )}
                    {user.role === 'user' && (
                      <button
                        className="btn btn-outline-secondary
                          btn-sm"
                        onClick={() =>
                          navigate('/admin/orders')
                        }
                      >
                        View All Orders
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toggle Status Modal */}
      <ConfirmModal
        show={toggleModalOpen}
        title={user?.is_active
          ? 'Deactivate Account'
          : 'Activate Account'}
        message={`Are you sure you want to ${
          user?.is_active ? 'deactivate' : 'activate'
        } "${user?.name}"? ${
          user?.is_active
            ? 'They will immediately lose access.'
            : 'They will regain full account access.'
        }`}
        confirmLabel={user?.is_active
          ? 'Deactivate' : 'Activate'}
        confirmVariant={user?.is_active
          ? 'danger' : 'success'}
        loading={toggleLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleModalOpen(false)}
      />

      {toast.show && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          zIndex: 9999,
          background: toast.type === 'success'
            ? '#26a541' : '#ff6161',
          color: 'white', padding: '12px 20px',
          borderRadius: 6, fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast.type === 'success' ? '✅' : '❌'}{' '}
          {toast.message}
        </div>
      )}
    </>
  );
};

export default AdminUserDetailPage;