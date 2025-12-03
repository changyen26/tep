import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// 創建 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 自動添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器 - 處理錯誤
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ===== 認證 API =====
export const authAPI = {
  // 註冊
  register: (data) => api.post('/auth/register', data),

  // 登入
  login: (data) => api.post('/auth/login', data),

  // 獲取當前用戶
  getCurrentUser: () => api.get('/auth/me'),
};

// ===== 護身符 API =====
export const amuletAPI = {
  // 創建護身符
  create: (data) => api.post('/amulet/', data),

  // 獲取所有護身符
  getAll: (params) => api.get('/amulet/', { params }),

  // 獲取單個護身符
  getById: (id) => api.get(`/amulet/${id}`),

  // 更新護身符
  update: (id, data) => api.patch(`/amulet/${id}`, data),

  // 刪除護身符
  delete: (id) => api.delete(`/amulet/${id}`),
};

// ===== 簽到 API =====
export const checkinAPI = {
  // 簽到
  checkin: (data) => api.post('/checkin/', data),

  // 獲取簽到記錄
  getAll: (params) => api.get('/checkin/', { params }),

  // 獲取特定護身符的簽到記錄
  getByAmulet: (amuletId) => api.get(`/checkin/amulet/${amuletId}`),

  // 檢查今天是否已簽到
  checkToday: (amuletId) => api.get('/checkin/today', { params: { amulet_id: amuletId } }),
};

// ===== 能量 API =====
export const energyAPI = {
  // 增加能量
  add: (data) => api.post('/energy/add', data),

  // 消耗能量
  consume: (data) => api.post('/energy/consume', data),

  // 獲取能量記錄
  getLogs: (params) => api.get('/energy/logs', { params }),

  // 獲取特定護身符的能量記錄和統計
  getByAmulet: (amuletId) => api.get(`/energy/amulet/${amuletId}`),
};

export default api;
