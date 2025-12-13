/**
 * 系統設定 API
 */
import request from './request';
import { API_ENDPOINTS } from './config';

/**
 * 取得系統設定列表
 */
export const getSettings = () => {
  return request.get(API_ENDPOINTS.SETTINGS);
};

export const getSettingList = getSettings; // 別名

/**
 * 取得單一設定
 * @param {string} key - 設定鍵名
 */
export const getSetting = (key) => {
  return request.get(API_ENDPOINTS.SETTING_DETAIL(key));
};

/**
 * 新增設定
 * @param {Object} data - 設定資料
 */
export const createSetting = (data) => {
  return request.post(API_ENDPOINTS.SETTINGS, data);
};

/**
 * 更新設定
 * @param {string} key - 設定鍵名
 * @param {Object} data - 設定資料
 */
export const updateSetting = (key, data) => {
  return request.put(API_ENDPOINTS.SETTING_DETAIL(key), data);
};

/**
 * 刪除設定
 * @param {string} key - 設定鍵名
 */
export const deleteSetting = (key) => {
  return request.delete(API_ENDPOINTS.SETTING_DETAIL(key));
};
