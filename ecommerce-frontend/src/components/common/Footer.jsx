import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: '#172337',
      color: '#fff',
      padding: '32px 0 16px',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div className="row g-4 mb-3">
          <div className="col-md-3">
            <h6 style={{ color: '#ff9f00', fontWeight: 700,
              letterSpacing: 1 }}>shopKart</h6>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>
              India's fastest growing e-commerce platform.
              Quality products from verified sellers.
            </p>
          </div>
          <div className="col-md-3">
            <h6 style={{ fontSize: 12, fontWeight: 600,
              color: '#aaa', marginBottom: 12 }}>ABOUT</h6>
            <ul className="list-unstyled" style={{ fontSize: 13 }}>
              <li style={{ marginBottom: 8 }}>
                <Link to="/" style={{ color: '#ccc' }}>About Us</Link>
              </li>
              <li style={{ marginBottom: 8 }}>
                <Link to="/register" style={{ color: '#ccc' }}>Careers</Link>
              </li>
              <li>
                <Link to="/products" style={{ color: '#ccc' }}>Press</Link>
              </li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 style={{ fontSize: 12, fontWeight: 600,
              color: '#aaa', marginBottom: 12 }}>HELP</h6>
            <ul className="list-unstyled" style={{ fontSize: 13 }}>
              <li style={{ marginBottom: 8 }}>
                <Link to="/checkout" style={{ color: '#ccc' }}>Payments</Link>
              </li>
              <li style={{ marginBottom: 8 }}>
                <Link to="/products" style={{ color: '#ccc' }}>Shipping</Link>
              </li>
              <li>
                <Link to="/orders" style={{ color: '#ccc' }}>Returns</Link>
              </li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 style={{ fontSize: 12, fontWeight: 600,
              color: '#aaa', marginBottom: 12 }}>SELL ON shopKart</h6>
            <ul className="list-unstyled" style={{ fontSize: 13 }}>
              <li style={{ marginBottom: 8 }}>
                <a href="/register" style={{ color: '#ccc' }}>
                  Become a Seller
                </a>
              </li>
              <li>
                <Link to="/seller/dashboard" style={{ color: '#ccc' }}>
                  Seller Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <hr style={{ borderColor: '#333' }} />
        <p style={{ fontSize: 12, color: '#888',
          textAlign: 'center', margin: 0 }}>
          © {new Date().getFullYear()} shopKart. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
