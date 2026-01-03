/**
 * 打卡記錄管理 API
 */
import request from './request';

/**
 * 取得打卡記錄列表
 * @param {Object} params - 查詢參數
 */
export const getCheckinList = (params) => {
  return request.get('/admin/checkins/', { params });
};

/**
 * 取得打卡記錄詳情
 * @param {number} checkinId - 打卡 ID
 */
export const getCheckinDetail = (checkinId) => {
  return request.get(`/admin/checkins/${checkinId}/`);
};
