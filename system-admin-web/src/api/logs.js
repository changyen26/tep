/**
 * 系統日誌 API
 */
import request from './request';
import { API_ENDPOINTS } from './config';

/**
 * 取得系統日誌列表
 * @param {Object} params - 查詢參數
 */
export const getLogList = (params) => {
  return request.get(API_ENDPOINTS.LOGS, { params });
};
