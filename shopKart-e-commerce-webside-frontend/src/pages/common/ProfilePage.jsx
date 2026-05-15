import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import authApi from '../../api/auth.api';
import useAuth from '../../hooks/useAuth';

const ROLE_META = {
  admin: {
    label: 'Administrator',
    badgeBg: '#e8f0fe',
    badgeColor: '#1a73e8',
  },
  seller: {
    label: 'Seller',
    badgeBg: '#fff3cd',
    badgeColor: '#856404',
  },
  user: {
    label: 'Customer',
    badgeBg: '#e8f5e9',
    badgeColor: '#2e7d32',
  },
};

const formatDate = (value) => {
  if (!value) return 'Not available';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Not available';
  }

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const ProfilePage = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const joinedOn = profile?.createdAt || profile?.created_at;

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await authApi.getMe();

        if (!isMounted) {
          return;
        }

        setProfile(res.data.data.user || user);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(
          err.response?.data?.message ||
          'Failed to load profile.'
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const quickLinks = role === 'seller'
    ? [
      { label: 'Seller Dashboard', to: '/seller/dashboard' },
      { label: 'My Products', to: '/seller/products' },
      { label: 'My Orders', to: '/seller/orders' },
    ]
    : role === 'admin'
      ? [
        { label: 'Admin Dashboard', to: '/admin/dashboard' },
        { label: 'Manage Users', to: '/admin/users' },
        { label: 'Manage Products', to: '/admin/products' },
      ]
      : [
        { label: 'Browse Products', to: '/products' },
        { label: 'My Orders', to: '/orders' },
        { label: 'My Cart', to: '/cart' },
      ];

  const roleMeta = ROLE_META[role] || ROLE_META.user;
  const showRoleDetails = role !== 'user';

  return (
    <>
      <Navbar />
      <main className="container py-4 py-lg-5">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="mb-4">
              <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                <h1 className="h3 mb-0">My Profile</h1>
                {showRoleDetails && (
                  <span
                    className="px-3 py-1 rounded-pill fw-semibold"
                    style={{
                      background: roleMeta.badgeBg,
                      color: roleMeta.badgeColor,
                      fontSize: 13,
                    }}
                  >
                    {roleMeta.label}
                  </span>
                )}
              </div>
              <p className="text-muted mb-0">
                Review your account details and jump to your main actions.
              </p>
            </div>

            {loading && <Loader fullPage text="Loading profile..." />}

            {!loading && error && (
              <ErrorMessage message={error} />
            )}

            {!loading && !error && (
              <div className="row g-4">
                <div className="col-lg-7">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <h2 className="h5 mb-4">Account Details</h2>

                      <div className="row g-3">
                        <div className="col-sm-6">
                          <div className="text-muted small mb-1">Full Name</div>
                          <div className="fw-semibold">
                            {profile?.name || 'Not available'}
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="text-muted small mb-1">Email</div>
                          <div className="fw-semibold">
                            {profile?.email || 'Not available'}
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="text-muted small mb-1">Phone</div>
                          <div className="fw-semibold">
                            {profile?.phone || 'Not added'}
                          </div>
                        </div>
                        {showRoleDetails && (
                          <div className="col-sm-6">
                            <div className="text-muted small mb-1">Role</div>
                            <div className="fw-semibold">
                              {roleMeta.label}
                            </div>
                          </div>
                        )}
                        {showRoleDetails && (
                          <div className="col-sm-6">
                            <div className="text-muted small mb-1">Account Status</div>
                            <div className="fw-semibold">
                              {profile?.is_active ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        )}
                        <div className="col-sm-6">
                          <div className="text-muted small mb-1">Joined On</div>
                          <div className="fw-semibold">
                            {formatDate(joinedOn)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-5">
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                      <h2 className="h5 mb-3">Quick Actions</h2>
                      <div className="d-grid gap-2">
                        {quickLinks.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="btn btn-outline-dark text-start"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h2 className="h5 mb-2">Session</h2>
                      <p className="text-muted mb-3">
                        You can sign out from here any time.
                      </p>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
