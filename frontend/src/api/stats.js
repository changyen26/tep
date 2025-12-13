import { client } from './client';

export const statsAPI = {
  dashboard: () => client.get('/stats/dashboard'),
  topSellingProducts: (params) => client.get('/stats/products/top-selling', { params }),
  lowStockProducts: (params) => client.get('/stats/products/low-stock', { params }),
  activeUsers: (params) => client.get('/stats/users/active', { params }),
  topSpenders: (params) => client.get('/stats/users/top-spenders', { params }),
  redemptionsTrend: (params) => client.get('/stats/redemptions/trend', { params }),
  redemptionsStatusDistribution: () => client.get('/stats/redemptions/status-distribution'),
  pointsFlow: (params) => client.get('/stats/points/flow', { params }),
  mySummary: () => client.get('/stats/my/summary'),
};

export default statsAPI;
