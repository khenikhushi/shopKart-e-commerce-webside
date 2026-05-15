import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import userApi from '../../api/user.api';
import { formatDate } from '../../utils/format.util';
import '../../styles/sidebar.css';
import '../../styles/dashboard.css';

const ROLES = ['admin', 'seller', 'user'];

const getRoleBadgeClass = (role) => {
  const map = {
    admin: 'badge-admin',
    seller: 'badge-seller',
    user: 'badge-user',
  };
  return map[role] || 'badge-user';
};

const AdminUsersPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Filters
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // Status toggle
  const [toggleUser, setToggleUser] = useState(null);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
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

  // ── Fetch users ───────────────────────────────────────
  const fetchUsers = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, limit };
      if (filterRole) params.role = filterRole;
      if (filterActive !== '')
        params.is_active = filterActive;
      if (search.trim()) params.search = search.trim();

      const res = await userApi.getAllAdmin(params);
      setUsers(res.data.data.users);
      setTotalPages(res.data.pagination.totalPages);
      setTotalItems(res.data.pagination.totalItems);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load users.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page, filterRole, filterActive]);

  // Search on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchUsers(1);
    }
  };

  // ── Toggle user status ────────────────────────────────
  const openToggleModal = (user) => {
    setToggleUser(user);
    setToggleModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!toggleUser) return;
    setToggleLoading(true);
    try {
      await userApi.updateStatus(toggleUser.slug, {
        is_active: !toggleUser.is_active,
      });
      showToast(
        `User "${toggleUser.name}" ${
          !toggleUser.is_active
            ? 'activated'
            : 'deactivated'
        } successfully!`
      );
      setToggleModalOpen(false);
      setToggleUser(null);
      fetchUsers(page);
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

          <div className="page-title">All Users</div>
          <div className="page-subtitle">
            {totalItems} accounts on the platform
          </div>

          {/* Filters row */}
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <input
              type="text"
              className="form-control"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              style={{ maxWidth: 260, fontSize: 13 }}
            />
            <select
              className="form-select"
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPage(1);
              }}
              style={{ maxWidth: 160, fontSize: 13 }}
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value);
                setPage(1);
              }}
              style={{ maxWidth: 160, fontSize: 13 }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setFilterRole('');
                setFilterActive('');
                setPage(1);
              }}
              style={{ fontSize: 13 }}
            >
              Clear Filters
            </button>
          </div>

          {loading && (
            <Loader text="Loading users..." />
          )}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => fetchUsers(page)}
            />
          )}

          {!loading && !error && (
            <>
              {users.length === 0 ? (
                <EmptyState
                  title="No users found"
                  message="No users match the current filters."
                  icon="👥"
                />
              ) : (
                <div className="section-card p-0">
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, idx) => (
                          <tr key={user.id}>
                            <td style={{ color: '#878787' }}>
                              {(page - 1) * limit + idx + 1}
                            </td>
                            <td>
                              <div
                                className="d-flex
                                  align-items-center gap-2"
                              >
                                {/* Avatar circle */}
                                <div style={{
                                  width: 32, height: 32,
                                  borderRadius: '50%',
                                  background: '#e8f0fe',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: 'var(--primary)',
                                  flexShrink: 0,
                                }}>
                                  {user.name
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <button
                                  className="btn btn-link p-0"
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    textAlign: 'left',
                                  }}
                                  onClick={() =>
                                    navigate(
                                      `/admin/users/${user.slug}`
                                    )
                                  }
                                >
                                  {user.name}
                                </button>
                              </div>
                            </td>
                            <td style={{
                              fontSize: 12,
                              color: '#878787',
                            }}>
                              {user.email}
                            </td>
                            <td style={{
                              fontSize: 12,
                              color: '#878787',
                            }}>
                              {user.phone || '—'}
                            </td>
                            <td>
                              <span className={`status-badge
                                ${getRoleBadgeClass(
                                  user.role
                                )}`}>
                                {user.role
                                  .charAt(0)
                                  .toUpperCase() +
                                  user.role.slice(1)}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge
                                ${user.is_active
                                  ? 'badge-active'
                                  : 'badge-inactive'}`}>
                                {user.is_active
                                  ? 'Active'
                                  : 'Inactive'}
                              </span>
                            </td>
                            <td style={{
                              fontSize: 12,
                              color: '#878787',
                            }}>
                              {formatDate(user.created_at)}
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button
                                  className="action-btn"
                                  onClick={() =>
                                    navigate(
                                      `/admin/users/${user.slug}`
                                    )
                                  }
                                  title="View profile"
                                >
                                  👁️
                                </button>
                                {user.role !== 'admin' && (
                                  <button
                                    className={`action-btn
                                      ${user.is_active
                                        ? 'danger'
                                        : ''}`}
                                    onClick={() =>
                                      openToggleModal(user)
                                    }
                                    title={user.is_active
                                      ? 'Deactivate'
                                      : 'Activate'}
                                  >
                                    {user.is_active
                                      ? '🔴'
                                      : '🟢'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-3">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    hasNext={page < totalPages}
                    hasPrev={page > 1}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Toggle Status Modal */}
      <ConfirmModal
        show={toggleModalOpen}
        title={toggleUser?.is_active
          ? 'Deactivate Account'
          : 'Activate Account'}
        message={`Are you sure you want to ${
          toggleUser?.is_active ? 'deactivate' : 'activate'
        } "${toggleUser?.name}"? ${
          toggleUser?.is_active
            ? 'They will not be able to log in.'
            : 'They will regain access to their account.'
        }`}
        confirmLabel={toggleUser?.is_active
          ? 'Deactivate' : 'Activate'}
        confirmVariant={toggleUser?.is_active
          ? 'danger' : 'success'}
        loading={toggleLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => {
          setToggleModalOpen(false);
          setToggleUser(null);
        }}
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

export default AdminUsersPage;