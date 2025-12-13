import { client } from './client';

export const energyAPI = {
  add: (data) => client.post('/energy/add', data),
  consume: (data) => client.post('/energy/consume', data),
  logs: (params) => client.get('/energy/logs', { params }),
  byAmulet: (amuletId) => client.get(`/energy/amulet/${amuletId}`),
  // legacy aliases
  getLogs: (params) => client.get('/energy/logs', { params }),
  getByAmulet: (amuletId) => client.get(`/energy/amulet/${amuletId}`),
};

export default energyAPI;
