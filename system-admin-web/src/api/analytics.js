/**
 * 數據分析 API
 */
import request from './request';
import { API_ENDPOINTS } from './config';

/**
 * 取得總覽數據
 */
export const getOverviewAnalytics = () => {
  return request.get(API_ENDPOINTS.ANALYTICS_OVERVIEW);
};

/**
 * 取得使用者分析數據
 * @param {Object} params - 查詢參數
 */
export const getUserAnalytics = (params) => {
  return request.get(API_ENDPOINTS.ANALYTICS_USERS, { params });
};

/**
 * 取得兌換分析數據
 * @param {Object} params - 查詢參數
 */
export const getRedemptionAnalytics = (params) => {
  return request.get(API_ENDPOINTS.ANALYTICS_REDEMPTIONS, { params });
};

/**
 * 取得廟宇分析數據
 * @param {Object} params - 查詢參數
 */
export const getTempleAnalytics = (params) => {
  return request.get(API_ENDPOINTS.ANALYTICS_TEMPLES, { params });
};

/**
 * 取得打卡分析數據
 * @param {Object} params - 查詢參數
 */
export const getCheckinAnalytics = (params) => {
  return request.get(API_ENDPOINTS.ANALYTICS_CHECKINS, { params });
};
