/**
 * @deprecated 此檔案已棄用，請改用 services/templeAdminApi.js
 *
 * 移轉指引：
 * - templeOrderAPI.list(templeId, params) → templeAdminApi.orders.list(templeId, params)
 * - templeOrderAPI.detail(redemptionId) → templeAdminApi.orders.get(templeId, redemptionId)
 * - templeOrderAPI.updateStatus(templeId, redemptionId, status, notes) → templeAdminApi.orders.updateStatus(templeId, redemptionId, status, notes)
 *
 * 此檔案暫時保留以維持向後相容性，未來版本將移除
 */

import { client } from './client';

/**
 * 廟方訂單管理 API
 */
export const templeOrderAPI = {
  /**
   * 獲取廟宇訂單列表
   * @param {number} templeId - 廟宇 ID
   * @param {Object} params - 查詢參數 (page, per_page, status, keyword, start_date, end_date)
   */
  list: async (templeId, params = {}) => {
    const response = await client.get(`/redemptions/temple/${templeId}`, { params });
    return response.data;
  },

  /**
   * 獲取訂單詳情
   * @param {number} redemptionId - 訂單 ID
   */
  detail: async (redemptionId) => {
    const response = await client.get(`/redemptions/${redemptionId}`);
    return response.data;
  },

  /**
   * 更新訂單狀態
   * @param {number} templeId - 廟宇 ID
   * @param {number} redemptionId - 訂單 ID
   * @param {Object} data - 狀態資料 { status, note, tracking_number }
   */
  updateStatus: async (templeId, redemptionId, data) => {
    const response = await client.put(
      `/redemptions/temple/${templeId}/${redemptionId}/status`,
      data
    );
    return response.data;
  },
};

export default templeOrderAPI;
