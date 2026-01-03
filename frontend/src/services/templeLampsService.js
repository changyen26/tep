/**
 * Temple Lamps Service
 * 點燈管理服務層
 *
 * 可透過 USE_MOCK 開關切換 Mock 資料或真實 API
 */

import { client } from '../api/client';
import { mockTempleLampsAPI } from '../mocks/templeLampsMockData';

// ===== 開關：切換 Mock / 真實 API =====
const USE_MOCK = true; // 設為 false 則使用真實 API
// =========================================

/**
 * 獲取燈種列表
 * @param {Object} params - { templeId, year, isActive, q, page, pageSize }
 * @returns {Promise}
 */
export const listLampTypes = async (params = {}) => {
  if (USE_MOCK) {
    return mockTempleLampsAPI.listLampTypes(params);
  }

  // 真實 API
  const response = await client.get('/api/temple-admin/lamps/', { params });
  return response.data;
};

/**
 * 獲取單一燈種
 * @param {number|string} templeId - 廟宇 ID
 * @param {number|string} lampTypeId - 燈種 ID
 * @returns {Promise}
 */
export const getLampType = async (templeId, lampTypeId) => {
  if (USE_MOCK) {
    return mockTempleLampsAPI.getLampType(templeId, lampTypeId);
  }

  // 真實 API
  const response = await client.get(`/api/temple-admin/lamps/${lampTypeId}/`);
  return response.data;
};

/**
 * 建立燈種
 * @param {number|string} templeId - 廟宇 ID
 * @param {Object} payload - 燈種資料
 * @returns {Promise}
 */
export const createLampType = async (templeId, payload) => {
  if (USE_MOCK) {
    return mockTempleLampsAPI.createLampType(templeId, payload);
  }

  // 真實 API
  const response = await client.post('/api/temple-admin/lamps/', payload);
  return response.data;
};

/**
 * 更新燈種
 * @param {number|string} templeId - 廟宇 ID
 * @param {number|string} lampTypeId - 燈種 ID
 * @param {Object} payload - 燈種資料
 * @returns {Promise}
 */
export const updateLampType = async (templeId, lampTypeId, payload) => {
  if (USE_MOCK) {
    return mockTempleLampsAPI.updateLampType(templeId, lampTypeId, payload);
  }

  // 真實 API
  const response = await client.put(`/api/temple-admin/lamps/${lampTypeId}/`, payload);
  return response.data;
};

/**
 * 切換燈種開放狀態
 * @param {number|string} templeId - 廟宇 ID
 * @param {number|string} lampTypeId - 燈種 ID
 * @param {boolean} isActive - 開放狀態
 * @returns {Promise}
 */
export const toggleLampTypeActive = async (templeId, lampTypeId, isActive) => {
  if (USE_MOCK) {
    return mockTempleLampsAPI.toggleLampTypeActive(templeId, lampTypeId, isActive);
  }

  // 真實 API
  const response = await client.put(`/api/temple-admin/lamps/${lampTypeId}/toggle/`, { isActive });
  return response.data;
};

/**
 * 獲取點燈申請名冊
 * @param {number|string} templeId - 廟宇 ID
 * @param {number|string} lampTypeId - 燈種 ID
 * @param {Object} params - { status, q, page, pageSize }
 * @returns {Promise}
 */
export const listLampApplications = async (templeId, lampTypeId, params = {}) => {
  if (USE_MOCK) {
    return mockTempleLampsAPI.listLampApplications(templeId, lampTypeId, params);
  }

  // 真實 API
  const response = await client.get(
    `/api/temple-admin/lamps/${lampTypeId}/applications/`,
    { params }
  );
  return response.data;
};

/**
 * 更新申請狀態
 * @param {number|string} templeId - 廟宇 ID
 * @param {number|string} lampTypeId - 燈種 ID
 * @param {number|string} appId - 申請 ID
 * @param {string} status - 新狀態
 * @returns {Promise}
 */
export const updateLampApplicationStatus = async (templeId, lampTypeId, appId, status) => {
  if (USE_MOCK) {
    return mockTempleLampsAPI.updateLampApplicationStatus(templeId, lampTypeId, appId, status);
  }

  // 真實 API
  const response = await client.put(
    `/api/temple-admin/lamps/${lampTypeId}/applications/${appId}/status/`,
    { status }
  );
  return response.data;
};

/**
 * 匯出點燈申請名冊為 CSV（前端實作）
 * @param {Array} applications - 申請資料陣列
 * @param {string} lampTypeName - 燈種名稱
 */
export const exportLampApplicationsToCSV = (applications, lampTypeName) => {
  if (!applications || applications.length === 0) {
    alert('沒有資料可匯出');
    return;
  }

  // CSV 標題行
  const headers = [
    '申請ID',
    '姓名',
    '電話',
    'Email',
    '生日',
    '農曆生日',
    '生肖',
    '地址',
    '祈願',
    '狀態',
    '申請時間',
  ];

  // 狀態中文對照
  const statusMap = {
    pending: '待處理',
    paid: '已付款',
    completed: '已完成',
    canceled: '已取消',
  };

  // 資料行
  const rows = applications.map((app) => [
    app.id,
    app.applicantName,
    app.phone,
    app.email || '',
    app.birthday,
    app.lunarBirthday || '',
    app.zodiac,
    app.address || '',
    app.wish || '',
    statusMap[app.status] || app.status,
    new Date(app.createdAt).toLocaleString('zh-TW'),
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
    `${lampTypeName}_點燈名冊_${new Date().toISOString().slice(0, 10)}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
