import { client } from './client';

export const productAPI = {
  list: (params) => client.get('/products/', { params }),
  detail: (productId) => client.get(`/products/${productId}`),
  categories: () => client.get('/products/categories'),
  create: (data) => client.post('/products/admin/products', data),
  update: (productId, data) => client.put(`/products/admin/products/${productId}`, data),
  remove: (productId) => client.delete(`/products/admin/products/${productId}`),
  // legacy aliases
  getAll: (params) => client.get('/products/', { params }),
  getById: (productId) => client.get(`/products/${productId}`),
};

export default productAPI;
