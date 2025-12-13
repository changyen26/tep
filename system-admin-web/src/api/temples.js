/**
 * 廟宇管理 API
 */
import request from './request';
import { API_ENDPOINTS } from './config';

/**
 * 取得廟宇列表
 * @param {Object} params - 查詢參數
 */
export const getTempleList = (params) => {
  return request.get(API_ENDPOINTS.TEMPLES, { params });
};

/**
 * 取得廟宇詳情
 * @param {number} templeId - 廟宇 ID
 */
export const getTempleDetail = (templeId) => {
  return request.get(API_ENDPOINTS.TEMPLE_DETAIL(templeId));
};

/**
 * 啟用/停用廟宇
 * @param {number} templeId - 廟宇 ID
 */
export const toggleTempleStatus = (templeId) => {
  return request.put(API_ENDPOINTS.TEMPLE_TOGGLE(templeId));
};

/**
 * 取得廟宇申請列表
 * @param {Object} params - 查詢參數
 */
export const getTempleApplicationList = (params) => {
  return request.get(API_ENDPOINTS.TEMPLE_APPLICATIONS, { params });
};

/**
 * 取得廟宇申請詳情
 * @param {number} applicationId - 申請 ID
 */
export const getTempleApplicationDetail = (applicationId) => {
  return request.get(API_ENDPOINTS.TEMPLE_APPLICATION_DETAIL(applicationId));
};

/**
 * 審核廟宇申請
 * @param {number} applicationId - 申請 ID
 * @param {string} action - 操作（approve/reject）
 * @param {string} remarks - 備註
 */
export const reviewTempleApplication = (applicationId, action, remarks) => {
  return request.post(API_ENDPOINTS.TEMPLE_APPLICATION_REVIEW(applicationId), {
    action,
    remarks
  });
};
