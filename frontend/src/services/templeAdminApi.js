/**
 * Temple Admin API - 廟方管理專用 API
 *
 * 【重要規範】
 * - 所有 API 路徑統一為：/temple-admin/temples/:templeId/...
 * - 每個方法的第一個參數必須是 templeId
 * - 只能被廟方管理頁面使用（frontend/src/pages/temple-admin/**）
 * - 禁止被系統管理頁面使用
 */

import { http } from './httpClient';

/**
 * ========================================
 * 廟宇資訊管理
 * ========================================
 */
export const temples = {
  /**
   * 取得廟宇詳情
   * GET /temple-admin/temples/:templeId
   */
  getTemple: (templeId) => {
    return http.get(`/temple-admin/temples/${templeId}`);
  },

  /**
   * 更新廟宇資訊
   * PUT /temple-admin/temples/:templeId
   */
  updateTemple: (templeId, payload) => {
    return http.put(`/temple-admin/temples/${templeId}`, payload);
  },

  /**
   * 取得廟宇統計資料
   * GET /temple-admin/temples/:templeId/stats
   */
  getStats: (templeId) => {
    return http.get(`/temple-admin/temples/${templeId}/stats`);
  },
};

/**
 * ========================================
 * 活動報名管理
 * ========================================
 */
export const events = {
  /**
   * 取得活動列表
   * GET /temple-admin/temples/:templeId/events
   */
  list: (templeId, params = {}) => {
    return http.get(`/temple-admin/temples/${templeId}/events`, { params });
  },

  /**
   * 取得單一活動
   * GET /temple-admin/temples/:templeId/events/:eventId
   */
  get: (templeId, eventId) => {
    return http.get(`/temple-admin/temples/${templeId}/events/${eventId}`);
  },

  /**
   * 建立活動
   * POST /temple-admin/temples/:templeId/events
   */
  create: (templeId, payload) => {
    return http.post(`/temple-admin/temples/${templeId}/events`, payload);
  },

  /**
   * 更新活動
   * PUT /temple-admin/temples/:templeId/events/:eventId
   */
  update: (templeId, eventId, payload) => {
    return http.put(`/temple-admin/temples/${templeId}/events/${eventId}`, payload);
  },

  /**
   * 發布活動
   * POST /temple-admin/temples/:templeId/events/:eventId/publish
   */
  publish: (templeId, eventId) => {
    return http.post(`/temple-admin/temples/${templeId}/events/${eventId}/publish`);
  },

  /**
   * 提前截止活動
   * POST /temple-admin/temples/:templeId/events/:eventId/close
   */
  close: (templeId, eventId) => {
    return http.post(`/temple-admin/temples/${templeId}/events/${eventId}/close`);
  },

  /**
   * 取消活動
   * POST /temple-admin/temples/:templeId/events/:eventId/cancel
   */
  cancel: (templeId, eventId) => {
    return http.post(`/temple-admin/temples/${templeId}/events/${eventId}/cancel`);
  },

  /**
   * 取得活動報名名單
   * GET /temple-admin/temples/:templeId/events/:eventId/registrations
   */
  listRegistrations: (templeId, eventId, params = {}) => {
    return http.get(`/temple-admin/temples/${templeId}/events/${eventId}/registrations`, {
      params,
    });
  },

  /**
   * 匯出報名名單（TODO: 待後端實作）
   * GET /temple-admin/temples/:templeId/events/:eventId/registrations/export
   */
  exportRegistrations: (templeId, eventId, params = {}) => {
    return http.get(`/temple-admin/temples/${templeId}/events/${eventId}/registrations/export`, {
      params,
      responseType: 'blob',
    });
  },
};

/**
 * ========================================
 * 點燈管理
 * ========================================
 */
export const lamps = {
  /**
   * 取得燈種列表
   * GET /temple-admin/temples/:templeId/lamps
   */
  list: (templeId, params = {}) => {
    return http.get(`/temple-admin/temples/${templeId}/lamps`, { params });
  },

  /**
   * 取得單一燈種
   * GET /temple-admin/temples/:templeId/lamps/:lampTypeId
   */
  get: (templeId, lampTypeId) => {
    return http.get(`/temple-admin/temples/${templeId}/lamps/${lampTypeId}`);
  },

  /**
   * 建立燈種
   * POST /temple-admin/temples/:templeId/lamps
   */
  create: (templeId, payload) => {
    return http.post(`/temple-admin/temples/${templeId}/lamps`, payload);
  },

  /**
   * 更新燈種
   * PUT /temple-admin/temples/:templeId/lamps/:lampTypeId
   */
  update: (templeId, lampTypeId, payload) => {
    return http.put(`/temple-admin/temples/${templeId}/lamps/${lampTypeId}`, payload);
  },

  /**
   * 切換燈種開放狀態
   * PUT /temple-admin/temples/:templeId/lamps/:lampTypeId/toggle
   */
  toggleActive: (templeId, lampTypeId, isActive) => {
    return http.put(`/temple-admin/temples/${templeId}/lamps/${lampTypeId}/toggle`, {
      isActive,
    });
  },

  /**
   * 取得點燈申請名冊
   * GET /temple-admin/temples/:templeId/lamps/:lampTypeId/applications
   */
  listApplications: (templeId, lampTypeId, params = {}) => {
    return http.get(`/temple-admin/temples/${templeId}/lamps/${lampTypeId}/applications`, {
      params,
    });
  },

  /**
   * 更新申請狀態
   * PUT /temple-admin/temples/:templeId/lamps/:lampTypeId/applications/:appId/status
   */
  updateApplicationStatus: (templeId, lampTypeId, appId, status) => {
    return http.put(
      `/temple-admin/temples/${templeId}/lamps/${lampTypeId}/applications/${appId}/status`,
      { status }
    );
  },

  /**
   * 匯出申請名冊（TODO: 待後端實作）
   * GET /temple-admin/temples/:templeId/lamps/:lampTypeId/applications/export
   */
  exportApplications: (templeId, lampTypeId, params = {}) => {
    return http.get(
      `/temple-admin/temples/${templeId}/lamps/${lampTypeId}/applications/export`,
      {
        params,
        responseType: 'blob',
      }
    );
  },
};

/**
 * ========================================
 * 打卡紀錄管理
 * ========================================
 */
export const checkins = {
  /**
   * 取得打卡記錄列表
   * GET /temple-admin/temples/:templeId/checkins
   */
  list: (templeId, params = {}) => {
    return http.get(`/temple-admin/temples/${templeId}/checkins`, { params });
  },

  /**
   * 匯出打卡記錄（TODO: 待後端實作）
   * GET /temple-admin/temples/:templeId/checkins/export
   */
  export: (templeId, params = {}) => {
    return http.get(`/temple-admin/temples/${templeId}/checkins/export`, {
      params,
      responseType: 'blob',
    });
  },
};

/**
 * ========================================
 * 商品管理
 * ========================================
 */
export const products = {
  /**
   * 取得商品列表
   * GET /temple-admin/temples/:templeId/products
   */
  list: (templeId, params = {}) => {
    return http.get(`/temple-admin/temples/${templeId}/products`, { params });
  },

  /**
   * 取得單一商品
   * GET /temple-admin/temples/:templeId/products/:productId
   */
  get: (templeId, productId) => {
    return http.get(`/temple-admin/temples/${templeId}/products/${productId}`);
  },

  /**
   * 建立商品
   * POST /temple-admin/temples/:templeId/products
   */
  create: (templeId, payload) => {
    return http.post(`/temple-admin/temples/${templeId}/products`, payload);
  },

  /**
   * 更新商品
   * PUT /temple-admin/temples/:templeId/products/:productId
   */
  update: (templeId, productId, payload) => {
    return http.put(`/temple-admin/temples/${templeId}/products/${productId}`, payload);
  },

  /**
   * 刪除商品
   * DELETE /temple-admin/temples/:templeId/products/:productId
   */
  delete: (templeId, productId) => {
    return http.delete(`/temple-admin/temples/${templeId}/products/${productId}`);
  },

  /**
   * 切換商品狀態
   * PUT /temple-admin/temples/:templeId/products/:productId/toggle
   */
  toggleStatus: (templeId, productId, isActive) => {
    return http.put(`/temple-admin/temples/${templeId}/products/${productId}/toggle`, {
      isActive,
    });
  },
};

/**
 * ========================================
 * 訂單管理
 * ========================================
 */
export const orders = {
  /**
   * 取得訂單列表
   * GET /temple-admin/temples/:templeId/orders
   */
  list: (templeId, params = {}) => {
    return http.get(`/temple-admin/temples/${templeId}/orders`, { params });
  },

  /**
   * 取得單一訂單
   * GET /temple-admin/temples/:templeId/orders/:orderId
   */
  get: (templeId, orderId) => {
    return http.get(`/temple-admin/temples/${templeId}/orders/${orderId}`);
  },

  /**
   * 更新訂單狀態
   * PUT /temple-admin/temples/:templeId/orders/:orderId/status
   */
  updateStatus: (templeId, orderId, status, notes) => {
    return http.put(`/temple-admin/temples/${templeId}/orders/${orderId}/status`, {
      status,
      notes,
    });
  },

  /**
   * 匯出訂單（TODO: 待後端實作）
   * GET /temple-admin/temples/:templeId/orders/export
   */
  export: (templeId, params = {}) => {
    return http.get(`/temple-admin/temples/${templeId}/orders/export`, {
      params,
      responseType: 'blob',
    });
  },
};

/**
 * ========================================
 * 收入報表
 * ========================================
 */
export const revenue = {
  /**
   * 取得收入報表
   * GET /temple-admin/temples/:templeId/revenue
   */
  getReport: (templeId, params = {}) => {
    return http.get(`/temple-admin/temples/${templeId}/revenue`, { params });
  },

  /**
   * 取得收入摘要
   * GET /temple-admin/temples/:templeId/revenue/summary
   */
  getSummary: (templeId) => {
    return http.get(`/temple-admin/temples/${templeId}/revenue/summary`);
  },
};


/**
 * ========================================
 * 設定管理
 * ========================================
 */
export const settings = {
  /**
   * 取得設定
   * GET /temple-admin/temples/:templeId/settings
   */
  get: (templeId) => {
    return http.get(`/temple-admin/temples/${templeId}/settings`);
  },

  /**
   * 更新設定
   * PUT /temple-admin/temples/:templeId/settings
   */
  update: (templeId, payload) => {
    return http.put(`/temple-admin/temples/${templeId}/settings`, payload);
  },
};

/**
 * ========================================
 * 信眾管理
 * ========================================
 */
export const devotees = {
  /**
   * 取得信眾列表
   * GET /temple-admin/temples/:templeId/devotees
   */
  list: (templeId, params = {}) => {
    return http.get(`/temple-admin/temples/${templeId}/devotees`, { params });
  },

  /**
   * 取得信眾詳細資訊
   * GET /temple-admin/temples/:templeId/devotees/:publicUserId
   */
  get: (templeId, publicUserId) => {
    return http.get(`/temple-admin/temples/${templeId}/devotees/${publicUserId}`);
  },
};

/**
 * 預設匯出所有 API
 */
export default {
  temples,
  events,
  lamps,
  checkins,
  products,
  orders,
  revenue,
  settings,
  devotees,
};
