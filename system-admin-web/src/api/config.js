/**
 * API 設定檔
 */

// API 基礎 URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Token 儲存鍵名
export const TOKEN_KEY = 'admin_token';

// 請求逾時時間（毫秒）
export const REQUEST_TIMEOUT = 30000;

// 分頁預設值
export const DEFAULT_PAGE_SIZE = 20;

// API 端點
export const API_ENDPOINTS = {
  // 認證
  LOGIN: '/admin/login',
  LOGOUT: '/admin/logout',
  PROFILE: '/admin/profile',

  // 使用者管理
  USERS: '/admin/users',
  USER_DETAIL: (id) => `/admin/users/${id}`,
  USER_POINTS: (id) => `/admin/users/${id}/points`,
  USER_ROLE: (id) => `/admin/users/${id}/role`,
  USER_TOGGLE: (id) => `/admin/users/${id}/toggle`,

  // 廟宇管理
  TEMPLES: '/admin/temples',
  TEMPLE_DETAIL: (id) => `/admin/temples/${id}`,
  TEMPLE_TOGGLE: (id) => `/admin/temples/${id}/toggle`,
  TEMPLE_APPLICATIONS: '/admin/temple-applications',
  TEMPLE_APPLICATION_DETAIL: (id) => `/admin/temple-applications/${id}`,
  TEMPLE_APPLICATION_REVIEW: (id) => `/admin/temple-applications/${id}/review`,

  // 商品管理
  PRODUCTS: '/admin/products',
  PRODUCT_DETAIL: (id) => `/admin/products/${id}`,
  PRODUCT_REVIEW: (id) => `/admin/products/${id}/review`,

  // 兌換管理
  REDEMPTIONS: '/admin/redemptions',
  REDEMPTION_DETAIL: (id) => `/admin/redemptions/${id}`,
  REDEMPTION_STATUS: (id) => `/admin/redemptions/${id}/status`,

  // 數據分析
  ANALYTICS_OVERVIEW: '/admin/analytics/overview',
  ANALYTICS_USERS: '/admin/analytics/users',
  ANALYTICS_REDEMPTIONS: '/admin/analytics/redemptions',
  ANALYTICS_TEMPLES: '/admin/analytics/temples',
  ANALYTICS_CHECKINS: '/admin/analytics/checkins',

  // 系統設定
  SETTINGS: '/admin/settings',
  SETTING_DETAIL: (key) => `/admin/settings/${key}`,

  // 檢舉管理
  REPORTS: '/admin/reports',
  REPORT_DETAIL: (id) => `/admin/reports/${id}`,
  REPORT_STATUS: (id) => `/admin/reports/${id}/handle`,

  // 系統日誌
  LOGS: '/admin/logs',

  // 管理員管理
  ADMINS: '/admin/admins',
  ADMIN_DETAIL: (id) => `/admin/admins/${id}`,
  ADMIN_PERMISSIONS: (id) => `/admin/admins/${id}/permissions`
};
