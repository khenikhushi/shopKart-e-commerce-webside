import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const NotFoundPage = () => {
  return (
    <>
      <Navbar />
      <div
        className="d-flex flex-column align-items-center
          justify-content-center text-center"
        style={{ minHeight: '70vh', gap: 16 }}
      >
        <div style={{ fontSize: 80, fontWeight: 800,
          color: 'var(--primary)' }}>404</div>
        <h3 style={{ fontWeight: 700 }}>Page Not Found</h3>
        <p style={{ color: '#878787', maxWidth: 360 }}>
          The page you are looking for does not exist or
          has been moved.
        </p>
        <Link to="/" className="btn btn-primary mt-2">
          Go to Home
        </Link>
      </div>
      <Footer />
    </>
  );
};

export default NotFoundPage;