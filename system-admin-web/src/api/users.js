/**
 * 使用者管理 API
 */
import request from './request';
import { API_ENDPOINTS } from './config';

/**
 * 取得使用者列表
 * @param {Object} params - 查詢參數
 */
export const getUserList = (params) => {
  return request.get(API_ENDPOINTS.USERS, { params });
};

/**
 * 取得使用者詳情
 * @param {number} userId - 使用者 ID
 */
export const getUserDetail = (userId) => {
  return request.get(API_ENDPOINTS.USER_DETAIL(userId));
};

/**
 * 調整使用者功德點數
 * @param {number} userId - 使用者 ID
 * @param {number} amount - 調整數量（正數為增加，負數為減少）
 * @param {string} reason - 調整原因
 */
export const adjustUserPoints = (userId, amount, reason) => {
  return request.put(API_ENDPOINTS.USER_POINTS(userId), { amount, reason });
};

/**
 * 更新使用者角色
 * @param {number} userId - 使用者 ID
 * @param {string} role - 角色（user/temple_admin）
 */
export const updateUserRole = (userId, role) => {
  return request.put(API_ENDPOINTS.USER_ROLE(userId), { role });
};

/**
 * 啟用/停用使用者
 * @param {number} userId - 使用者 ID
 */
export const toggleUserStatus = (userId) => {
  return request.put(API_ENDPOINTS.USER_TOGGLE(userId));
};
