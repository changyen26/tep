import { client } from './client';

/**
 * 廟方收入報表 API
 */
export const templeRevenueAPI = {
  /**
   * 獲取收入報表
   * @param {number} templeId - 廟宇 ID
   * @param {object} params - 查詢參數
   * @param {string} params.start_date - 開始日期 (YYYY-MM-DD)
   * @param {string} params.end_date - 結束日期 (YYYY-MM-DD)
   * @param {string} params.group_by - 分組方式 (day/week/month)
   */
  getRevenue: async (templeId, params = {}) => {
    const response = await client.get(`/temple-revenue/${templeId}/revenue`, { params });
    return response.data;
  },

  /**
   * 獲取收入總覽
   * @param {number} templeId - 廟宇 ID
   */
  getSummary: async (templeId) => {
    const response = await client.get(`/temple-revenue/${templeId}/revenue/summary`);
    return response.data;
  },
};

export default templeRevenueAPI;
