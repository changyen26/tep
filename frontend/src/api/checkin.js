import { client } from './client';

export const checkinAPI = {
  checkin: (data) => client.post('/checkin/', data),
  list: (params) => client.get('/checkin/', { params }),
  byAmulet: (amuletId) => client.get(`/checkin/amulet/${amuletId}`),
  checkToday: (amuletId) => client.get('/checkin/today', { params: { amulet_id: amuletId } }),
  history: (params) => client.get('/checkin/history', { params }),
  stats: () => client.get('/checkin/stats'),
  streak: () => client.get('/checkin/streak'),
  monthlyStats: (params) => client.get('/checkin/monthly-stats', { params }),
  // legacy aliases
  getAll: (params) => client.get('/checkin/', { params }),
  getByAmulet: (amuletId) => client.get(`/checkin/amulet/${amuletId}`),
};

export default checkinAPI;
