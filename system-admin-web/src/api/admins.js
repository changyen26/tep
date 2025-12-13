/**
 * 管理員管理 API
 */
import request from './request';
import { API_ENDPOINTS } from './config';

/**
 * 取得管理員列表
 * @param {Object} params - 查詢參數
 */
export const getAdminList = (params) => {
  return request.get(API_ENDPOINTS.ADMINS, { params });
};

/**
 * 取得管理員詳情
 * @param {number} adminId - 管理員 ID
 */
export const getAdminDetail = (adminId) => {
  return request.get(API_ENDPOINTS.ADMIN_DETAIL(adminId));
};

/**
 * 新增管理員
 * @param {Object} data - 管理員資料
 */
export const createAdmin = (data) => {
  return request.post(API_ENDPOINTS.ADMINS, data);
};

/**
 * 更新管理員
 * @param {number} adminId - 管理員 ID
 * @param {Object} data - 管理員資料
 */
export const updateAdmin = (adminId, data) => {
  return request.put(API_ENDPOINTS.ADMIN_DETAIL(adminId), data);
};

/**
 * 刪除管理員
 * @param {number} adminId - 管理員 ID
 */
export const deleteAdmin = (adminId) => {
  return request.delete(API_ENDPOINTS.ADMIN_DETAIL(adminId));
};

/**
 * 更新管理員權限
 * @param {number} adminId - 管理員 ID
 * @param {Object} permissions - 權限設定
 */
export const updateAdminPermissions = (adminId, permissions) => {
  return request.put(API_ENDPOINTS.ADMIN_PERMISSIONS(adminId), { permissions });
};
