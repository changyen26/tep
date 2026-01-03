/**
 * @deprecated 此檔案已棄用，請改用 services/templeAdminApi.js
 *
 * 移轉指引：
 * - templeExportAPI.exportCheckins(templeId, ...) → templeAdminApi.checkins.export(templeId, params)
 * - templeExportAPI.exportOrders(templeId, ...) → templeAdminApi.orders.export(templeId, params)
 * - templeExportAPI.exportRevenue(templeId, ...) → 待後端實作 revenue export API
 *
 * 此檔案暫時保留以維持向後相容性，未來版本將移除
 */

import { client } from './client';

/**
 * 廟方資料匯出 API
 */
export const templeExportAPI = {
  /**
   * 匯出打卡記錄為 CSV
   * @param {number} templeId - 廟宇 ID
   * @param {string} startDate - 開始日期 (YYYY-MM-DD)
   * @param {string} endDate - 結束日期 (YYYY-MM-DD)
   */
  exportCheckins: async (templeId, startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await client.get(`/temple-export/${templeId}/checkins`, {
      params,
      responseType: 'blob', // 重要：處理檔案下載
    });

    // 建立下載連結
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `打卡記錄_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  },

  /**
   * 匯出訂單記錄為 CSV
   */
  exportOrders: async (templeId, startDate, endDate, status) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (status) params.status = status;

    const response = await client.get(`/temple-export/${templeId}/orders`, {
      params,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `訂單記錄_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  },

  /**
   * 匯出收入報表為 CSV
   */
  exportRevenue: async (templeId, startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await client.get(`/temple-export/${templeId}/revenue`, {
      params,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `收入報表_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  },
};

export default templeExportAPI;
