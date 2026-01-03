/**
 * @deprecated 此檔案包含混合的 API，請依用途改用正確的 API：
 *
 * 【一般廟宇資訊查詢 - 所有角色可用】
 * - templeAPI.list(params) → 保留使用（公開 API）
 * - templeAPI.detail(templeId) → 保留使用（公開 API）
 * - templeAPI.nearby(params) → 保留使用（公開 API）
 *
 * 【系統管理員專用 - 禁止廟方管理員使用】
 * - templeAPI.create(data) → 移至 systemAdminApi.temples.create(data)
 * - templeAPI.update(templeId, data) → 移至 systemAdminApi.temples.update(templeId, data)
 * - templeAPI.remove(templeId) → 移至 systemAdminApi.temples.delete(templeId)
 *
 * 【廟方管理員專用】
 * - templeAPI.updateAsTempleAdmin(templeId, data) → templeAdminApi.temples.updateTemple(templeId, data)
 *
 * 此檔案暫時保留以維持向後相容性，未來版本將移除
 */

import { client } from './client';

export const templeAPI = {
  list: (params) => client.get('/temples/', { params }),
  detail: (templeId) => client.get(`/temples/${templeId}`),
  nearby: (params) => client.get('/temples/nearby', { params }),

  // ⚠️ 系統管理員專用 API - 廟方管理員禁止使用
  create: (data) => client.post('/temples/admin/temples', data),
  update: (templeId, data) => client.put(`/temples/admin/temples/${templeId}`, data),
  remove: (templeId) => client.delete(`/temples/admin/temples/${templeId}`),

  // ⚠️ 廟方管理員專用 API - 請改用 templeAdminApi
  updateAsTempleAdmin: (templeId, data) => client.put(`/temple-admins/temples/${templeId}`, data),
};

// 便捷函數：取得單一廟宇資訊
export async function getTempleById(templeId) {
  const response = await templeAPI.detail(templeId);
  return response.data;
}

export default templeAPI;
