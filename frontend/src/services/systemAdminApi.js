/**
 * System Admin API - 系統管理員專用 API
 *
 * 【重要規範】
 * - 此檔案專供 system-admin-web 專案使用
 * - 禁止被 frontend 專案的廟方管理頁面（temple-admin）import
 * - 所有 API 路徑統一為：/api/system-admin/**
 *
 * 【TODO】
 * - 本檔案目前為空殼，待 system-admin-web 專案整合時實作
 * - 若 frontend 專案需要系統管理功能，應使用獨立頁面，不應混入 temple-admin
 */

import { http } from './httpClient';

/**
 * ========================================
 * 使用者管理（全站）
 * ========================================
 */
export const users = {
  // TODO: 系統管理員專用 - 查看所有使用者
  list: () => {
    throw new Error('systemAdminApi.users.list - 此 API 僅供系統管理員使用，請勿在廟方管理中呼叫');
  },

  // TODO: 系統管理員專用 - 啟用/停用使用者
  toggleStatus: () => {
    throw new Error('systemAdminApi.users.toggleStatus - 此 API 僅供系統管理員使用');
  },
};

/**
 * ========================================
 * 廟宇管理（全站）
 * ========================================
 */
export const temples = {
  // TODO: 系統管理員專用 - 查看所有廟宇
  list: () => {
    throw new Error('systemAdminApi.temples.list - 此 API 僅供系統管理員使用');
  },

  // TODO: 系統管理員專用 - 建立廟宇
  create: () => {
    throw new Error('systemAdminApi.temples.create - 此 API 僅供系統管理員使用');
  },

  // TODO: 系統管理員專用 - 審核廟宇申請
  approveApplication: () => {
    throw new Error('systemAdminApi.temples.approveApplication - 此 API 僅供系統管理員使用');
  },
};

/**
 * ========================================
 * 商品審核（全站）
 * ========================================
 */
export const productReviews = {
  // TODO: 系統管理員專用 - 審核商品
  list: () => {
    throw new Error('systemAdminApi.productReviews.list - 此 API 僅供系統管理員使用');
  },
};

/**
 * ========================================
 * 平安符管理（全站）
 * ========================================
 */
export const amulets = {
  // TODO: 系統管理員專用 - 查看所有平安符
  list: () => {
    throw new Error('systemAdminApi.amulets.list - 此 API 僅供系統管理員使用');
  },
};

/**
 * ========================================
 * 數據分析（全站）
 * ========================================
 */
export const analytics = {
  // TODO: 系統管理員專用 - 全站統計
  getOverview: () => {
    throw new Error('systemAdminApi.analytics.getOverview - 此 API 僅供系統管理員使用');
  },
};

/**
 * ========================================
 * 系統日誌
 * ========================================
 */
export const logs = {
  // TODO: 系統管理員專用 - 查看系統日誌
  list: () => {
    throw new Error('systemAdminApi.logs.list - 此 API 僅供系統管理員使用');
  },
};

/**
 * 預設匯出
 */
export default {
  users,
  temples,
  productReviews,
  amulets,
  analytics,
  logs,
};
