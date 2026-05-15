import api from './axios.instance';

const filterApi = {
  getBySubCategory: (subCategorySlug) =>
    api.get(`/filters/${subCategorySlug}`),
  getByCategory: (categorySlug) =>
    api.get(`/filters/category/${categorySlug}`),

  getAllAdmin: (params) => api.get('/admin/filters', { params }),
  create: (data) => api.post('/admin/filters', data),
  addValue: (filterId, data) =>
    api.post(`/admin/filters/${filterId}/values`, data),
  deleteFilter: (filterId) =>
    api.delete(`/admin/filters/${filterId}`),
  deleteValue: (filterId, valueId) =>
    api.delete(`/admin/filters/${filterId}/values/${valueId}`),
};

export default filterApi;
