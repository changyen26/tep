/**
 * @deprecated 此檔案已棄用，請改用 services/templeAdminApi.js
 *
 * 移轉指引：
 * - templeStatsAPI.dashboard(templeId) → templeAdminApi.temples.getStats(templeId)
 * - templeStatsAPI.recentOrders(templeId) → templeAdminApi.orders.list(templeId, { limit, sort: 'recent' })
 * - templeStatsAPI.topProducts(templeId) → 待後端實作統計 API
 * - templeStatsAPI.lowStockAlerts(templeId) → 待後端實作統計 API
 * - templeStatsAPI.visitors(templeId) → 待後端實作統計 API
 * - templeStatsAPI.checkins(templeId) → templeAdminApi.checkins.list(templeId, params)
 * - templeStatsAPI.topUsers(templeId) → 待後端實作統計 API
 *
 * 此檔案暫時保留以維持向後相容性，未來版本將移除
 */

import { client } from './client';

/**
 * 廟方統計 API
 */
export const templeStatsAPI = {
  // 儀表板總覽統計
  dashboard: async (templeId) => {
    const response = await client.get(`/temple-stats/${templeId}/dashboard`);
    return response.data;
  },

  // 最新訂單列表
  recentOrders: async (templeId, limit = 5) => {
    const response = await client.get(`/temple-stats/${templeId}/recent-orders`, {
      params: { limit },
    });
    return response.data;
  },

  // 熱銷商品 Top N
  topProducts: async (templeId, limit = 3, period = 'all') => {
    const response = await client.get(`/temple-stats/${templeId}/top-products`, {
      params: { limit, period },
    });
    return response.data;
  },

  // 庫存警告列表
  lowStockAlerts: async (templeId) => {
    const response = await client.get(`/temple-stats/${templeId}/low-stock-alerts`);
    return response.data;
  },

  // 訪客統計
  visitors: async (templeId, period = 'month') => {
    const response = await client.get(`/temple-stats/${templeId}/visitors`, {
      params: { period },
    });
    return response.data;
  },

  // 打卡統計
  checkins: async (templeId, period = 'week') => {
    const response = await client.get(`/temple-stats/${templeId}/checkins`, {
      params: { period },
    });
    return response.data;
  },

  // 常客排行榜
  topUsers: async (templeId, limit = 10, period = 'all') => {
    const response = await client.get(`/temple-stats/${templeId}/top-users`, {
      params: { limit, period },
    });
    return response.data;
  },
};

export default templeStatsAPI;
