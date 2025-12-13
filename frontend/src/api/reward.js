import { client } from './client';

export const rewardAPI = {
  create: (data) => client.post('/rewards/', data),
  list: (params) => client.get('/rewards/', { params }),
  detail: (rewardId) => client.get(`/rewards/${rewardId}`),
  update: (rewardId, data) => client.put(`/rewards/${rewardId}`, data),
  remove: (rewardId) => client.delete(`/rewards/${rewardId}`),
  statistics: (rewardId, params) => client.get(`/rewards/${rewardId}/statistics`, { params }),
  listByTemple: (templeId, params) => client.get(`/rewards/temple/${templeId}`, { params }),
  available: (params) => client.get('/rewards/available', { params }),
  claim: (rewardId) => client.post(`/rewards/${rewardId}/claim`),
  myClaims: (params) => client.get('/rewards/my-claims', { params }),
};

export default rewardAPI;
