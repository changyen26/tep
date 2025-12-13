import { client } from './client';

export const addressAPI = {
  list: () => client.get('/addresses/'),
  create: (data) => client.post('/addresses/', data),
  update: (addressId, data) => client.put(`/addresses/${addressId}`, data),
  remove: (addressId) => client.delete(`/addresses/${addressId}`),
  setDefault: (addressId) => client.put(`/addresses/${addressId}/set-default`),
  // legacy aliases
  getAll: () => client.get('/addresses/'),
  delete: (addressId) => client.delete(`/addresses/${addressId}`),
};

export default addressAPI;
