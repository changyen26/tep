/**
 * 商品管理 API
 */
import request from './request';
import { API_ENDPOINTS } from './config';

/**
 * 取得商品列表
 * @param {Object} params - 查詢參數
 */
export const getProductList = (params) => {
  return request.get('/products/', { params });
};

/**
 * 取得商品詳情
 * @param {number} productId - 商品 ID
 */
export const getProductDetail = (productId) => {
  return request.get(`/products/${productId}/`);
};

/**
 * 取得待審核商品列表
 * @param {Object} params - 查詢參數
 */
export const getPendingProducts = (params) => {
  return request.get(API_ENDPOINTS.PRODUCTS + '/pending', { params });
};

/**
 * 審核商品
 * @param {number} productId - 商品 ID
 * @param {string} action - 操作（approve/reject）
 * @param {string} remarks - 備註
 */
export const reviewProduct = (productId, action, remarks) => {
  return request.post(API_ENDPOINTS.PRODUCT_REVIEW(productId), {
    action,
    note: remarks
  });
};

/**
 * 切換商品狀態
 * @param {number} productId - 商品 ID
 * @param {boolean} isActive - 是否啟用
 */
export const toggleProductStatus = (productId, isActive) => {
  return request.put(`/admin/products/${productId}/toggle-status/`, {
    is_active: isActive
  });
};

/**
 * 新增商品
 * @param {Object} data - 商品資料
 */
export const createProduct = (data) => {
  return request.post('/products/admin/products/', data);
};

/**
 * 更新商品
 * @param {number} productId - 商品 ID
 * @param {Object} data - 商品資料
 */
export const updateProduct = (productId, data) => {
  return request.put(`/products/admin/products/${productId}/`, data);
};

/**
 * 刪除商品
 * @param {number} productId - 商品 ID
 */
export const deleteProduct = (productId) => {
  return request.delete(`/products/admin/products/${productId}/`);
};
