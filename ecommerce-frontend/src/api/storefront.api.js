import api from './axios.instance';

const storefrontApi = {
  getHome: () => api.get('/storefront/home'),
};

export default storefrontApi;
