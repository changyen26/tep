// 廟宇獎勵規則 API 模組
import { client as apiClient } from './client';

// 將 token 帶入 Authorization
const withAuth = (config = {}) => {
  const token = localStorage.getItem('token');
  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

const rewardAPI = {
  createReward: (payload) => apiClient.post('/rewards/', payload, withAuth()),
  getTempleRewards: (templeId, { isActive } = {}) =>
    apiClient.get(`/rewards/temple/${templeId}`, {
      params: { is_active: typeof isActive === 'undefined' ? undefined : isActive },
      ...withAuth(),
    }),
  getRewardDetail: (id) => apiClient.get(`/rewards/${id}`, withAuth()),
  updateReward: (id, payload) => apiClient.put(`/rewards/${id}`, payload, withAuth()),
  deleteReward: (id) => apiClient.delete(`/rewards/${id}`, withAuth()),
};

export default rewardAPI;
