/**
 * HTTP Client - 統一處理所有 HTTP 請求
 *
 * 功能：
 * - 自動附加 Authorization header
 * - 統一錯誤格式
 * - 401 自動登出
 * - 403 回傳可顯示的錯誤
 */

import axios from 'axios';

// 從環境變數讀取 API Base URL，預設為 http://localhost:5000/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * 建立 axios 實例
 */
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 秒逾時
});

/**
 * 請求攔截器 - 自動附加 token
 */
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(normalizeError(error));
  }
);

/**
 * 回應攔截器 - 統一錯誤處理
 */
httpClient.interceptors.response.use(
  (response) => {
    // 成功回應，直接返回 data
    return response.data;
  },
  (error) => {
    const normalizedError = normalizeError(error);

    // 401 未授權 - 自動登出
    if (normalizedError.code === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 避免在登入頁面重複導向
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(normalizedError);
  }
);

/**
 * 統一錯誤格式
 * @param {Error} error - 原始錯誤物件
 * @returns {Object} 標準化錯誤物件 { message, code, details }
 */
function normalizeError(error) {
  // Axios 錯誤
  if (error.response) {
    const { status, data } = error.response;

    return {
      message: data?.message || getDefaultErrorMessage(status),
      code: status,
      details: data?.details || data || null,
    };
  }

  // 網路錯誤
  if (error.request) {
    return {
      message: '網路連線失敗，請檢查您的網路連線',
      code: 0,
      details: null,
    };
  }

  // 其他錯誤
  return {
    message: error.message || '發生未知錯誤',
    code: -1,
    details: null,
  };
}

/**
 * 根據 HTTP 狀態碼回傳預設錯誤訊息
 */
function getDefaultErrorMessage(statusCode) {
  const messages = {
    400: '請求參數錯誤',
    401: '未授權，請重新登入',
    403: '權限不足，無法執行此操作',
    404: '資源不存在',
    409: '資源衝突',
    422: '資料驗證失敗',
    500: '伺服器錯誤，請稍後再試',
    502: '伺服器暫時無法回應',
    503: '服務暫時無法使用',
  };

  return messages[statusCode] || `請求失敗 (${statusCode})`;
}

/**
 * 匯出 HTTP 方法（包裝後的 axios 方法）
 */
export const http = {
  get: (url, config) => httpClient.get(url, config),
  post: (url, data, config) => httpClient.post(url, data, config),
  put: (url, data, config) => httpClient.put(url, data, config),
  patch: (url, data, config) => httpClient.patch(url, data, config),
  delete: (url, config) => httpClient.delete(url, config),
};

export default httpClient;
