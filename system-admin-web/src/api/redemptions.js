/**
 * 兌換管理 API
 */
import request from './request';
import { API_ENDPOINTS } from './config';

/**
 * 取得兌換訂單列表
 * @param {Object} params - 查詢參數
 */
export const getRedemptionList = (params) => {
  return request.get(API_ENDPOINTS.REDEMPTIONS, { params });
};

/**
 * 取得兌換訂單詳情
 * @param {number} redemptionId - 兌換 ID
 */
export const getRedemptionDetail = (redemptionId) => {
  return request.get(API_ENDPOINTS.REDEMPTION_DETAIL(redemptionId));
};

/**
 * 更新兌換訂單狀態
 * @param {number} redemptionId - 兌換 ID
 * @param {string} status - 狀態
 * @param {string} remarks - 備註
 */
export const updateRedemptionStatus = (redemptionId, status, remarks) => {
  return request.put(API_ENDPOINTS.REDEMPTION_STATUS(redemptionId), {
    status,
    remarks
  });
};
