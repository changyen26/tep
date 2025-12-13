import { client } from './client';

export const leaderboardAPI = {
  blessingPoints: (params) => client.get('/leaderboard/blessing-points', { params }),
  checkins: (params) => client.get('/leaderboard/checkins', { params }),
  temples: (params) => client.get('/leaderboard/temples', { params }),
  myRank: (params) => client.get('/leaderboard/my-rank', { params }),
};

export default leaderboardAPI;
