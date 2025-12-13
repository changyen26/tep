/**
 * 認證相關 API
 */
import request from './request';
import { API_ENDPOINTS } from './config';

/**
 * 管理員登入
 * @param {string} username - 使用者名稱
 * @param {string} password - 密碼
 */
export const login = (username, password) => {
  return request.post(API_ENDPOINTS.LOGIN, { username, password });
};

/**
 * 管理員登出
 */
export const logout = () => {
  return request.post(API_ENDPOINTS.LOGOUT);
};

/**
 * 取得管理員資料
 */
export const getProfile = () => {
  return request.get(API_ENDPOINTS.PROFILE);
};
