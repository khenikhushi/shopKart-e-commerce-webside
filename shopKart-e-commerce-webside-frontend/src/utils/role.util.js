import { getToken } from './token.util';

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
};

const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
};

const getRoleFromToken = () => {
  const user = getUserFromToken();
  return user?.role || null;
};

const isTokenExpired = () => {
  const user = getUserFromToken();
  if (!user?.exp) return true;
  return Date.now() >= user.exp * 1000;
};

export {
  decodeToken,
  getUserFromToken,
  getRoleFromToken,
  isTokenExpired,
};