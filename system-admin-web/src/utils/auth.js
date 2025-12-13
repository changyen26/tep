/**
 * 認證工具函數
 */
import { TOKEN_KEY } from '../api/config';

/**
 * 儲存 token
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 取得 token
 * @returns {string|null} JWT token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 移除 token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * 檢查是否已登入
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken();
};
