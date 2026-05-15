import api from './axios.instance';

const orderApi = {
  placeOrder: (data) => api.post('/orders', data),
  getUserOrders: (params) => api.get('/orders', { params }),
  getOrderBySlug: (slug) => api.get(`/orders/${slug}`),
  cancelOrder: (slug) => api.post(`/orders/${slug}/cancel`),

  getSellerOrders: (params) =>
    api.get('/seller/orders', { params }),
  getSellerOrder: (slug) =>
    api.get(`/seller/orders/${slug}`),

  getAllAdmin: (params) => api.get('/admin/orders', { params }),
  getOrderAdmin: (slug) => api.get(`/admin/orders/${slug}`),

  // USE THIS FOR ADMIN PAGE
  updateStatusAdmin: (slug, data) => 
    api.patch(`/admin/orders/${slug}/status`, data),

  // USE THIS FOR SELLER PAGE
  updateStatusSeller: (slug, data) => 
    api.patch(`/seller/orders/${slug}/status`, data),

  getDashboard: () => api.get('/admin/dashboard'),
};
  // updateStatus: (slug, data) =>
  //   api.patch(`/admin/orders/${slug}/status`, data),

  // getDashboard: () => api.get('/admin/dashboard'),


export default orderApi;
