/**
 * Temple Events Service
 * 廟方活動報名服務層
 *
 * 可透過 USE_MOCK 開關切換 Mock 資料或真實 API
 */

import { client } from '../api/client';
import { mockTempleEventsAPI } from '../mocks/templeEventsMockData';

// ===== 開關：切換 Mock / 真實 API =====
const USE_MOCK = true; // 設為 false 則使用真實 API
// =========================================

/**
 * 獲取活動列表
 * @param {Object} params - { temple_id, status, q, page, pageSize }
 * @returns {Promise}
 */
export const listEvents = async (params = {}) => {
  if (USE_MOCK) {
    return mockTempleEventsAPI.listEvents(params);
  }

  // 真實 API - 需要 temple_id 參數
  const response = await client.get('/api/temple-admin/events/', { params });
  return response.data;
};

/**
 * 獲取單一活動
 * @param {number|string} id - 活動 ID
 * @returns {Promise}
 */
export const getEvent = async (id) => {
  if (USE_MOCK) {
    return mockTempleEventsAPI.getEvent(id);
  }

  // 真實 API
  const response = await client.get(`/api/temple-admin/events/${id}/`);
  return response.data;
};

/**
 * 建立活動
 * @param {Object} payload - 活動資料
 * @returns {Promise}
 */
export const createEvent = async (payload) => {
  if (USE_MOCK) {
    return mockTempleEventsAPI.createEvent(payload);
  }

  // 真實 API
  const response = await client.post('/api/temple-admin/events/', payload);
  return response.data;
};

/**
 * 更新活動
 * @param {number|string} id - 活動 ID
 * @param {Object} payload - 活動資料
 * @returns {Promise}
 */
export const updateEvent = async (id, payload) => {
  if (USE_MOCK) {
    return mockTempleEventsAPI.updateEvent(id, payload);
  }

  // 真實 API
  const response = await client.put(`/api/temple-admin/events/${id}/`, payload);
  return response.data;
};

/**
 * 發布活動
 * @param {number|string} id - 活動 ID
 * @returns {Promise}
 */
export const publishEvent = async (id) => {
  if (USE_MOCK) {
    return mockTempleEventsAPI.publishEvent(id);
  }

  // 真實 API
  const response = await client.post(`/api/temple-admin/events/${id}/publish/`);
  return response.data;
};

/**
 * 提前截止活動
 * @param {number|string} id - 活動 ID
 * @returns {Promise}
 */
export const closeEvent = async (id) => {
  if (USE_MOCK) {
    return mockTempleEventsAPI.closeEvent(id);
  }

  // 真實 API
  const response = await client.post(`/api/temple-admin/events/${id}/close/`);
  return response.data;
};

/**
 * 取消活動
 * @param {number|string} id - 活動 ID
 * @returns {Promise}
 */
export const cancelEvent = async (id) => {
  if (USE_MOCK) {
    return mockTempleEventsAPI.cancelEvent(id);
  }

  // 真實 API
  const response = await client.post(`/api/temple-admin/events/${id}/cancel/`);
  return response.data;
};

/**
 * 獲取活動報名名單
 * @param {number|string} eventId - 活動 ID
 * @param {Object} params - { status, q, page, pageSize }
 * @returns {Promise}
 */
export const listRegistrations = async (eventId, params = {}) => {
  if (USE_MOCK) {
    return mockTempleEventsAPI.listRegistrations(eventId, params);
  }

  // 真實 API
  const response = await client.get(
    `/api/temple-admin/events/${eventId}/registrations/`,
    { params }
  );
  return response.data;
};

/**
 * 匯出報名名單為 CSV（前端實作）
 * @param {Array} registrations - 報名資料陣列
 * @param {string} eventTitle - 活動標題
 */
export const exportRegistrationsToCSV = (registrations, eventTitle) => {
  if (!registrations || registrations.length === 0) {
    alert('沒有資料可匯出');
    return;
  }

  // CSV 標題行
  const headers = ['報名ID', '姓名', '電話', 'Email', '狀態', '報名時間', '備註'];

  // 狀態中文對照
  const statusMap = {
    registered: '已報名',
    canceled: '已取消',
    waitlist: '候補',
  };

  // 資料行
  const rows = registrations.map((r) => [
    r.id,
    r.name,
    r.phone,
    r.email,
    statusMap[r.status] || r.status,
    new Date(r.registeredAt).toLocaleString('zh-TW'),
    r.notes || '',
  ]);

  // 組合 CSV 內容
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  // 加上 BOM 讓 Excel 正確識別 UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // 觸發下載
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${eventTitle}_報名名單_${new Date().toISOString().slice(0, 10)}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
