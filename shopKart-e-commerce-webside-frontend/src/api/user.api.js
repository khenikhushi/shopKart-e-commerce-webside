import api from './axios.instance';

const userApi = {
  getAllAdmin: (params) => api.get('/admin/users', { params }),
  getBySlug: (slug) => api.get(`/admin/users/${slug}`),
  updateStatus: (slug, data) =>
    api.patch(`/admin/users/${slug}/status`, data),
};

export default userApi;