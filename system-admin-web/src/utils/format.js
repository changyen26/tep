/**
 * 格式化工具函數
 */
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';

dayjs.locale('zh-tw');

/**
 * 格式化日期時間
 * @param {string|Date} date - 日期
 * @param {string} format - 格式（預設：YYYY-MM-DD HH:mm:ss）
 * @returns {string}
 */
export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @returns {string}
 */
export const formatDate = (date) => {
  return formatDateTime(date, 'YYYY-MM-DD');
};

/**
 * 格式化時間
 * @param {string|Date} date - 日期
 * @returns {string}
 */
export const formatTime = (date) => {
  return formatDateTime(date, 'HH:mm:ss');
};

/**
 * 格式化相對時間（幾分鐘前、幾小時前等）
 * @param {string|Date} date - 日期
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

/**
 * 格式化數字（千分位）
 * @param {number} num - 數字
 * @returns {string}
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('zh-TW');
};

/**
 * 格式化點數
 * @param {number} points - 點數
 * @returns {string}
 */
export const formatPoints = (points) => {
  return `${formatNumber(points)} 點`;
};

/**
 * 格式化檔案大小
 * @param {number} bytes - 位元組數
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
