import { Navigate } from 'react-router-dom';
import { hasToken } from '../utils/token.util';
import { isTokenExpired } from '../utils/role.util';
import Loader from '../components/common/Loader';
import useAuth from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (!hasToken() || isTokenExpired()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;