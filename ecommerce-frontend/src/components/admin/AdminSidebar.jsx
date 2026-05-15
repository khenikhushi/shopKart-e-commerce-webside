import { useLocation, Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const navItems = [
  {
    section: 'Overview',
    links: [
      { label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
    ],
  },
  {
    section: 'Management',
    links: [
      { label: 'Users', icon: '👥', path: '/admin/users' },
      { label: 'Categories', icon: '📁', path: '/admin/categories' },
      {
        label: 'SubCategories',
        icon: '📂',
        path: '/admin/subcategories',
      },
      { label: 'Products', icon: '📦', path: '/admin/products' },
      { label: 'Orders', icon: '🛒', path: '/admin/orders' },
    ],
  },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) =>
    location.pathname === path ||
    (path !== '/admin/dashboard' &&
      location.pathname.startsWith(path));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* User info header */}
        <div className="sidebar-header">
          <span className="role-tag">Admin</span>
          <div className="user-name">
            {user?.name || 'Administrator'}
          </div>
          <div className="user-email">
            {user?.email || ''}
          </div>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section}>
              <div className="sidebar-section-label">
                {section.section}
              </div>
              {section.links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`sidebar-link
                    ${isActive(link.path) ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="link-icon">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span className="link-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
