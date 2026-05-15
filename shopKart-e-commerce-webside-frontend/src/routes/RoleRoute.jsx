import { Navigate } from 'react-router-dom';
import { getRoleFromToken } from '../utils/role.util';
import { hasToken } from '../utils/token.util';
import Loader from '../components/common/Loader';
import useAuth from '../hooks/useAuth';

const RoleRoute = ({ children, requiredRole }) => {
  const { loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (!hasToken()) {
    return <Navigate to="/login" replace />;
  }

  const role = getRoleFromToken();

  if (role !== requiredRole) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'seller') return <Navigate to="/seller/dashboard" replace />;
    if (role === 'user') return <Navigate to="/" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleRoute;
