import api from './axios.instance';
import { getToken } from '../utils/token.util';

const checkAuth = () => {
  if (!getToken()) {
    window.location.href = '/login';
    return false;
  }
  return true;
};

const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: (data) => checkAuth() && api.post('/cart/items', data),
  updateItem: (itemId, data) => checkAuth() && api.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId) => checkAuth() && api.delete(`/cart/items/${itemId}`),
  clearCart: () => checkAuth() && api.delete('/cart'),
};

export default cartApi; 