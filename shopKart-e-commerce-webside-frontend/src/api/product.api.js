import api from './axios.instance';

const getRequestConfig = (data) => {
  if (
    typeof FormData !== 'undefined' &&
    data instanceof FormData
  ) {
    return {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  }

  return undefined;
};

const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getBrands: (params) => api.get('/products/brands', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),

  getAllAdmin: (params) => api.get('/admin/products', { params }),
  updateStatusAdmin: (slug, data) =>
    api.patch(`/admin/products/${slug}/status`, data),

  getSellerProducts: (params) =>
    api.get('/seller/products', { params }),
  getSellerProductBySlug: (slug) =>
    api.get(`/seller/products/${slug}`),
  createSellerProduct: (data) =>
    api.post(
      '/seller/products',
      data,
      getRequestConfig(data)
    ),
  updateSellerProduct: (slug, data) =>
    api.put(
      `/seller/products/${slug}`,
      data,
      getRequestConfig(data)
    ),
  deleteSellerProduct: (slug) =>
    api.delete(`/seller/products/${slug}`),
  assignFilters: (slug, data) =>
    api.post(`/seller/products/${slug}/filters`, data),
};

export default productApi;
