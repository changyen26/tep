/**
 * Axios 請求封裝
 */
import axios from 'axios';
import { message } from 'antd';
import { API_BASE_URL, TOKEN_KEY, REQUEST_TIMEOUT } from './config';

// 建立 axios 實例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 請求攔截器
request.interceptors.request.use(
  (config) => {
    // 從 localStorage 取得 token
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('請求錯誤:', error);
    return Promise.reject(error);
  }
);

// 回應攔截器
request.interceptors.response.use(
  (response) => {
    const { data } = response;

    // 後端統一回應格式: { success, data, message }
    if (data.success) {
      return data;
    } else {
      // 處理業務錯誤
      message.error(data.message || '請求失敗');
      return Promise.reject(new Error(data.message || '請求失敗'));
    }
  },
  (error) => {
    // 處理 HTTP 錯誤
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          message.error('未授權，請重新登入');
          // 清除 token
          localStorage.removeItem(TOKEN_KEY);
          // 跳轉到登入頁
          window.location.href = '/auth/login';
          break;
        case 403:
          message.error('沒有權限訪問此資源');
          break;
        case 404:
          message.error('請求的資源不存在');
          break;
        case 500:
          message.error('伺服器錯誤');
          break;
        default:
          message.error(data?.message || '請求失敗');
      }
    } else if (error.request) {
      message.error('網路連線失敗，請檢查網路設定');
    } else {
      message.error('請求配置錯誤');
    }

    return Promise.reject(error);
  }
);

export default request;
