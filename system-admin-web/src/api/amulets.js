/**
 * 平安符管理 API
 */
import request from './request';

/**
 * 取得平安符列表
 * @param {Object} params - 查詢參數
 */
export const getAmuletList = (params) => {
  return request.get('/amulet/', { params });
};

/**
 * 取得平安符詳情
 * @param {number} amuletId - 平安符 ID
 */
export const getAmuletDetail = (amuletId) => {
  return request.get(`/amulet/${amuletId}`);
};

/**
 * 刪除平安符
 * @param {number} amuletId - 平安符 ID
 */
export const deleteAmulet = (amuletId) => {
  return request.delete(`/amulet/${amuletId}`);
};
