import { client } from './client';

export const templeAPI = {
  list: (params) => client.get('/temples/', { params }),
  detail: (templeId) => client.get(`/temples/${templeId}`),
  nearby: (params) => client.get('/temples/nearby', { params }),

  // 系統管理員專用 API
  create: (data) => client.post('/temples/admin/temples', data),
  update: (templeId, data) => client.put(`/temples/admin/temples/${templeId}`, data),
  remove: (templeId) => client.delete(`/temples/admin/temples/${templeId}`),

  // 廟方管理員專用 API
  updateAsTempleAdmin: (templeId, data) => client.put(`/temple-admins/temples/${templeId}`, data),
};

// 便捷函數：取得單一廟宇資訊
export async function getTempleById(templeId) {
  const response = await templeAPI.detail(templeId);
  return response.data;
}

export default templeAPI;
