/**
 * 檢舉管理 API
 */
import request from './request';
import { API_ENDPOINTS } from './config';

/**
 * 取得檢舉列表
 * @param {Object} params - 查詢參數
 */
export const getReportList = (params) => {
  return request.get(API_ENDPOINTS.REPORTS, { params });
};

/**
 * 取得檢舉詳情
 * @param {number} reportId - 檢舉 ID
 */
export const getReportDetail = (reportId) => {
  return request.get(API_ENDPOINTS.REPORT_DETAIL(reportId));
};

/**
 * 更新檢舉狀態
 * @param {number} reportId - 檢舉 ID
 * @param {string} status - 狀態（processing/resolved/rejected）
 * @param {string} remarks - 備註
 */
export const updateReportStatus = (reportId, status, remarks) => {
  return request.put(API_ENDPOINTS.REPORT_STATUS(reportId), {
    status,
    remarks
  });
};
