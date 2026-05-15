import { createContext, useState, useEffect, useCallback } from 'react';
import { saveToken, getToken, removeToken } from '../utils/token.util';
import {
  getUserFromToken,
  isTokenExpired,
} from '../utils/role.util';
import authApi from '../api/auth.api';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load — restore session from token
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();

      if (!token || isTokenExpired()) {
        removeToken();
        setLoading(false);
        return;
      }

      try {
        const decoded = getUserFromToken();
        setUser(decoded);
        setRole(decoded?.role || null);

        // Fetch fresh user data from backend
        const res = await authApi.getMe();
        const freshUser = res.data.data.user;
        setUser({ ...decoded, ...freshUser });
        if (freshUser?.role) {
          setRole(freshUser.role);
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          removeToken();
          setUser(null);
          setRole(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback((token, userData = null) => {
    saveToken(token);
    const decoded = getUserFromToken();
    setUser(userData ? { ...decoded, ...userData } : decoded);
    setRole(userData?.role || decoded?.role || null);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setRole(null);
    setLoading(false);
  }, []);

  const isAuthenticated = useCallback(() => {
    const token = getToken();
    return !!token && !isTokenExpired();
  }, []);

  const isAdmin = useCallback(() => role === 'admin', [role]);
  const isSeller = useCallback(() => role === 'seller', [role]);
  const isUser = useCallback(() => role === 'user', [role]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isSeller,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
