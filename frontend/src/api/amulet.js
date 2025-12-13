import { client } from './client';

export const amuletAPI = {
  create: (data) => client.post('/amulet/', data),
  list: (params) => client.get('/amulet/', { params }),
  detail: (amuletId) => client.get(`/amulet/${amuletId}`),
  update: (amuletId, data) => client.patch(`/amulet/${amuletId}`, data),
  remove: (amuletId) => client.delete(`/amulet/${amuletId}`),
  // legacy aliases
  getAll: (params) => client.get('/amulet/', { params }),
  getById: (amuletId) => client.get(`/amulet/${amuletId}`),
};

export default amuletAPI;
