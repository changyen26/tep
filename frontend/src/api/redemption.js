import { client } from './client';

export const redemptionAPI = {
  create: (data) => client.post('/redemptions/', data),
  list: (params) => client.get('/redemptions/', { params }),
  detail: (redemptionId) => client.get(`/redemptions/${redemptionId}`),
  cancel: (redemptionId) => client.post(`/redemptions/${redemptionId}/cancel`),
  stats: () => client.get('/redemptions/stats'),
  // legacy aliases
  getAll: (params) => client.get('/redemptions/', { params }),
  getById: (redemptionId) => client.get(`/redemptions/${redemptionId}`),
  getStats: () => client.get('/redemptions/stats'),
};

export default redemptionAPI;
