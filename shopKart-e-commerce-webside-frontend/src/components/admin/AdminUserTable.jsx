import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import '../../styles/navbar.css';

const Navbar = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname.startsWith(path) ? 'active-link' : '';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const renderAdminLinks = () => (
    <>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive('/admin/dashboard')}`}
          to="/admin/dashboard"
        >
          Dashboard
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive('/admin/users')}`}
          to="/admin/users"
        >
          Users
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive('/admin/categories')}`}
          to="/admin/categories"
        >
          Categories
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive('/admin/subcategories')}`}
          to="/admin/subcategories"
        >
          SubCategories
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive('/admin/products')}`}
          to="/admin/products"
        >
          Products
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive('/admin/orders')}`}
          to="/admin/orders"
        >
          Orders
        </Link>
      </li>
    </>
  );

  const renderSellerLinks = () => (
    <>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive('/seller/dashboard')}`}
          to="/seller/dashboard"
        >
          Dashboard
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive('/seller/products')}`}
          to="/seller/products"
        >
          My Products
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive('/seller/orders')}`}
          to="/seller/orders"
        >
          My Orders
        </Link>
      </li>
    </>
  );

  const renderUserLinks = () => (
    <>
      <li className="nav-item">
        <Link
          className={`nav-link ${location.pathname === '/' ? 'active-link' : ''}`}
          to="/"
        >
          Home
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive('/products')}`}
          to="/products"
        >
          Products
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className={`nav-link ${isActive('/orders')}`}
          to="/orders"
        >
          My Orders
        </Link>
      </li>
      <li className="nav-item ms-2">
        <Link className="nav-link cart-badge" to="/cart">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="white"
            viewBox="0 0 16 16"
          >
            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1
              .485.379L2.89 3H14.5a.5.5 0 0 1
              .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5
              0 0 1-.491-.408L2.01 3.607 1.61
              2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0
              0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2
              2 0 0 0 0-4z" />
          </svg>
          {cartCount > 0 && (
            <span className="cart-count">{cartCount}</span>
          )}
        </Link>
      </li>
    </>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand navbar-brand-custom" to="/">
          shopKart
        </Link>

        <button
          className="navbar-toggler navbar-toggler-custom"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {role === 'admin' && renderAdminLinks()}
            {role === 'seller' && renderSellerLinks()}
            {role === 'user' && renderUserLinks()}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {isAuthenticated() ? (
              <div className="dropdown">
                <button
                  className="user-menu-btn dropdown-toggle btn"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user?.name || 'Account'}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span
                      className="dropdown-item-text text-muted"
                      style={{ fontSize: 12 }}
                    >
                      Signed in as {role}
                    </span>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link className="btn btn-sm btn-light" to="/login">
                  Login
                </Link>
                <Link
                  className="btn btn-sm btn-outline-light"
                  to="/register"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
