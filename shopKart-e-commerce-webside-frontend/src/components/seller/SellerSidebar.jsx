import { useLocation, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const navItems = [
  {
    section: 'Overview',
    links: [
      {
        label: 'Dashboard',
        icon: '📊',
        path: '/seller/dashboard',
      },
    ],
  },
  {
    section: 'Products',
    links: [
      {
        label: 'My Products',
        icon: '📦',
        path: '/seller/products',
      },
      {
        label: 'Add Product',
        icon: '➕',
        path: '/seller/products/add',
      },
    ],
  },
  {
    section: 'Sales',
    links: [
      {
        label: 'My Orders',
        icon: '🛒',
        path: '/seller/orders',
      },
    ],
  },
];

const SellerSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) =>
    location.pathname === path ||
    (path !== '/seller/dashboard' &&
      location.pathname.startsWith(path));

  const handleLogout = () => {};

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="role-tag"
            style={{ background: '#fff3cd',
              color: '#856404' }}>
            Seller
          </span>
          <div className="user-name">
            {user?.name || 'Seller'}
          </div>
          <div className="user-email">
            {user?.email || ''}
          </div>
        </div>

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
                  <span className="link-icon">
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ display: 'none' }}>
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

export default SellerSidebar;
