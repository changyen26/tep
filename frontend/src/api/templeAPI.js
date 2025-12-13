// 廟宇管理 API 模組（含管理員操作）
import { client as apiClient } from './client';

// 從 localStorage 取得 token 並帶入 Authorization
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

export const templeAPI = {
  // 公開：取得廟宇列表
  getTemples: ({ search, isActive, limit = 50, offset = 0 } = {}) =>
    apiClient.get('/temples/', {
      params: {
        search: search || undefined,
        is_active: typeof isActive === 'undefined' ? undefined : isActive,
        limit,
        offset,
      },
    }),

  // 管理員：建立廟宇
  createTemple: (payload) =>
    apiClient.post('/temples/admin/temples', payload, withAuth()),

  // 管理員：更新廟宇
  updateTemple: (id, payload) =>
    apiClient.put(`/temples/admin/temples/${id}`, payload, withAuth()),

  // 管理員：刪除廟宇
  deleteTemple: (id) =>
    apiClient.delete(`/temples/admin/temples/${id}`, withAuth()),
};

export default templeAPI;
