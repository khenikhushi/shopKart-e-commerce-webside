import api from './axios.instance';

const categoryApi = {
  getAll: (params) => api.get('/categories', { params }),
  getTree: (params) => api.get('/categories/tree', { params }),
  getAllAdmin: (params) => api.get('/admin/categories', { params }),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post('/admin/categories', data),
  update: (slug, data) => api.put(`/admin/categories/${slug}`, data),
  delete: (slug) => api.delete(`/admin/categories/${slug}`),
};

export default categoryApi;
