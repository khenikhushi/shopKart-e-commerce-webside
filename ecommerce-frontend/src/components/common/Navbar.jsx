import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import categoryApi from '../../api/category.api';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import '../../styles/navbar.css';

const Navbar = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [globalSearch, setGlobalSearch] = useState('');
  const [marketCategories, setMarketCategories] = useState([]);

  const marketShortcuts = [
    { label: 'All', type: 'all' },
    { label: "Today's Deals", type: 'deals' },
    ...marketCategories.map((category) => ({
      label: category.name,
      type: 'category',
      categoryId: category.id,
    })),
  ];

  const isActive = (path) =>
    location.pathname.startsWith(path) ? 'active fw-bold text-warning' : '';

  const showGlobalSearch = !isAuthenticated() || role === 'user';

  useEffect(() => {
    if (!location.pathname.startsWith('/products')) {
      return;
    }

    const params = new URLSearchParams(location.search);
    const currentSearch = params.get('search') || '';
    setGlobalSearch(currentSearch);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!location.pathname.startsWith('/products')) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      const currentSearch = params.get('search') || '';
      const nextSearch = globalSearch.trim();

      if (nextSearch === currentSearch) {
        return;
      }

      if (nextSearch) {
        params.set('search', nextSearch);
      } else {
        params.delete('search');
      }

      navigate(
        {
          pathname: '/products',
          search: params.toString() ? `?${params.toString()}` : '',
        },
        { replace: true }
      );
    }, 350);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [globalSearch, location.pathname, location.search, navigate]);

  useEffect(() => {
    let isMounted = true;

    const loadMarketCategories = async () => {
      try {
        const response = await categoryApi.getTree();
        if (!isMounted) {
          return;
        }

        const categories = (response.data.data.categories || [])
          .filter((category) => category?.id)
          .slice(0, 6);

        setMarketCategories(categories);
      } catch {
        if (isMounted) {
          setMarketCategories([]);
        }
      }
    };

    loadMarketCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const nextSearch = globalSearch.trim();
    const params = location.pathname.startsWith('/products')
      ? new URLSearchParams(location.search)
      : new URLSearchParams();

    if (nextSearch) {
      params.set('search', nextSearch);
    } else {
      params.delete('search');
    }

    navigate({
      pathname: '/products',
      search: params.toString() ? `?${params.toString()}` : '',
    });
  };

  const handleShortcutClick = (shortcut) => {
    const params = new URLSearchParams();

    if (shortcut.type === 'category' && shortcut.categoryId) {
      params.set('categoryId', shortcut.categoryId);
    }

    if (shortcut.type === 'deals') {
      params.set('sort', 'price');
      params.set('order', 'asc');
    }

    navigate({
      pathname: '/products',
      search: params.toString() ? `?${params.toString()}` : '',
    });
  };

  const isShortcutActive = (shortcut) => {
    if (!location.pathname.startsWith('/products')) {
      return false;
    }

    const params = new URLSearchParams(location.search);
    const currentCategoryId = params.get('categoryId') || '';
    const currentSearch = (params.get('search') || '').trim().toLowerCase();
    const currentSort = params.get('sort') || '';
    const currentOrder = params.get('order') || '';

    if (shortcut.type === 'all') {
      return !currentCategoryId && !currentSearch && !currentSort && !currentOrder;
    }

    if (shortcut.type === 'deals') {
      return currentSort === 'price' && currentOrder === 'asc';
    }

    if (shortcut.type === 'category') {
      return currentCategoryId === shortcut.categoryId;
    }

    return false;
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
          className={`nav-link ${location.pathname === '/' ? 'active fw-bold text-warning' : ''}`}
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
    </>
  );

  const renderAccountMenuLinks = () => {
    if (role === 'admin') {
      return (
        <>
          <li><Link className="dropdown-item py-2" to="/profile">My Profile</Link></li>
          <li><Link className="dropdown-item py-2" to="/admin/dashboard">Dashboard</Link></li>
          <li><Link className="dropdown-item py-2" to="/admin/users">Manage Users</Link></li>
          <li><hr className="dropdown-divider" /></li>
        </>
      );
    }

    if (role === 'seller') {
      return (
        <>
          <li><Link className="dropdown-item py-2" to="/profile">My Profile</Link></li>
          <li><Link className="dropdown-item py-2" to="/seller/dashboard">Seller Dashboard</Link></li>
          <li><Link className="dropdown-item py-2" to="/seller/products">My Products</Link></li>
          <li><Link className="dropdown-item py-2" to="/seller/orders">My Orders</Link></li>
          <li><hr className="dropdown-divider" /></li>
        </>
      );
    }

    if (role === 'user') {
      return (
        <>
          <li><Link className="dropdown-item py-2" to="/profile">My Profile</Link></li>
          <li><Link className="dropdown-item py-2" to="/orders">My Orders</Link></li>
          <li><hr className="dropdown-divider" /></li>
        </>
      );
    }

    return null;
  };

  const showAccountQuickActions =
    isAuthenticated() &&
    (role === 'seller' || role === 'user');

  return (
    <header className="sticky-top shadow-sm w-100" style={{ zIndex: 1030 }}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-2">
        <div className="container-fluid px-3 px-lg-4">
          <Link className="navbar-brand fw-bold fs-4 text-warning d-flex align-items-center gap-2" to="/">
            shopKart
          </Link>

          <button
            className="navbar-toggler border-0 focus-ring-none"
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
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center">
              {role === 'admin' && renderAdminLinks()}
              {role === 'seller' && renderSellerLinks()}
              {role === 'user' && renderUserLinks()}
            </ul>

            {showGlobalSearch && (
              <form className="d-flex flex-grow-1 mx-lg-4 my-3 my-lg-0" onSubmit={handleSearchSubmit}>
                <div className="input-group">
                  <input
                    type="search"
                    className="form-control border-0 shadow-none px-3"
                    placeholder="Search for products, brands and more..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-warning px-4 fw-semibold border-0">
                    Search
                  </button>
                </div>
              </form>
            )}

            <div className="d-flex align-items-center gap-3 ms-lg-auto pb-2 pb-lg-0">
              {showAccountQuickActions && (
                <>
                  <Link
                    className="btn btn-outline-light btn-sm fw-semibold px-3"
                    to="/profile"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    className="btn btn-warning btn-sm fw-semibold px-3"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )}

              {isAuthenticated() ? (
                <div className="dropdown">
                  <a
                    href="#"
                    role="button"
                    className="nav-link dropdown-toggle d-flex flex-column align-items-start px-2 py-1"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    onClick={(e) => e.preventDefault()}
                  >
                    <small className="text-light lh-1">
                      Hello, {user?.name?.split(' ')[0] || 'User'}
                    </small>
                    <span className="fw-bold text-white lh-sm">
                      Account & Lists
                    </span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                    <li>
                      <span className="dropdown-item-text text-muted small">
                        Signed in as <strong>{role}</strong>
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    {renderAccountMenuLinks()}
                    <li>
                      <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <Link className="btn btn-outline-light btn-sm fw-semibold px-3" to="/login">
                    Login
                  </Link>
                  <Link className="btn btn-warning btn-sm fw-semibold px-3" to="/register">
                    Register
                  </Link>
                </div>
              )}

              {role === 'user' && (
                <Link className="nav-link text-white position-relative d-flex align-items-end px-2" to="/cart">
                  <div className="position-relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                    </svg>
                    {cartCount > 0 && (
                      <span 
                        className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-warning text-dark border border-dark"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="ms-1 fw-bold d-none d-sm-block pb-1">Cart</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navbar for Categories */}
      {showGlobalSearch && (
        <div className="w-100" style={{ backgroundColor: '#232f3e' }}>
          <div className="container-fluid px-3 px-lg-4 py-1 d-flex gap-3 overflow-auto" style={{ whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
            {marketShortcuts.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`btn btn-link text-white text-decoration-none px-2 py-1 m-0 ${isShortcutActive(item) ? 'fw-bold border-bottom border-2 border-warning rounded-0' : 'opacity-75'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleShortcutClick(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
