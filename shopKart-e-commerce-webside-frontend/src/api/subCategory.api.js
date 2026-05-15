import api from './axios.instance';

const subCategoryApi = {
  getAll: (params) => api.get('/subcategories', { params }),
  getAllAdmin: (params) => api.get('/admin/subcategories', { params }),
  getBySlug: (slug) => api.get(`/subcategories/${slug}`),
  create: (data) => api.post('/admin/subcategories', data),
  update: (slug, data) => api.put(`/admin/subcategories/${slug}`, data),
  delete: (slug) => api.delete(`/admin/subcategories/${slug}`),
};

export default subCategoryApi;