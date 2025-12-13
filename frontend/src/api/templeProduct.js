import { client } from './client';

/**
 * 廟方商品管理 API
 */
export const templeProductAPI = {
  /**
   * 獲取廟宇商品列表
   * @param {number} templeId - 廟宇 ID
   * @param {Object} params - 查詢參數 (page, per_page, category, keyword)
   */
  list: async (templeId, params = {}) => {
    const response = await client.get(`/products/temple/${templeId}`, { params });
    return response.data;
  },

  /**
   * 新增商品
   * @param {number} templeId - 廟宇 ID
   * @param {Object} data - 商品資料
   */
  create: async (templeId, data) => {
    const response = await client.post(`/products/temple/${templeId}`, data);
    return response.data;
  },

  /**
   * 更新商品
   * @param {number} templeId - 廟宇 ID
   * @param {number} productId - 商品 ID
   * @param {Object} data - 商品資料
   */
  update: async (templeId, productId, data) => {
    const response = await client.put(`/products/temple/${templeId}/${productId}`, data);
    return response.data;
  },

  /**
   * 刪除商品
   * @param {number} templeId - 廟宇 ID
   * @param {number} productId - 商品 ID
   */
  delete: async (templeId, productId) => {
    const response = await client.delete(`/products/temple/${templeId}/${productId}`);
    return response.data;
  },

  /**
   * 獲取單一商品詳情
   * @param {number} productId - 商品 ID
   */
  detail: async (productId) => {
    const response = await client.get(`/products/${productId}`);
    return response.data;
  },
};

export default templeProductAPI;
