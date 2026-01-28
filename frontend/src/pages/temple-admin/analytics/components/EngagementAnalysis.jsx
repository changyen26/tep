/**
 * EngagementAnalysis - 互動分析元件
 * 包含打卡頻率分布和 Top 10 信眾排行榜
 */
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const EngagementAnalysis = ({ checkinFrequency, topDevotees }) => {
  const navigate = useNavigate();
  const { templeId } = useParams();

  // 打卡頻率分布資料
  const frequencyData = checkinFrequency || [];

  // Top 10 信眾資料
  const devotees = topDevotees || [];

  const handleDevoteeClick = (publicUserId) => {
    if (publicUserId) {
      navigate(`/temple-admin/${templeId}/devotees/${publicUserId}`);
    }
  };

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'default';
  };

  return (
    <div className="analysis-grid">
      {/* 左側：打卡頻率分布 */}
      <div className="chart-card">
        <h3>打卡頻率分布</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={frequencyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="range"
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip
                formatter={(value, name) => [value, '人數']}
                labelFormatter={(label) => `打卡 ${label}`}
              />
              <Bar
                dataKey="count"
                fill="#3498db"
                radius={[0, 4, 4, 0]}
                label={{ position: 'right', fontSize: 12 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 右側：Top 10 信眾排行榜 */}
      <div className="chart-card">
        <h3>Top 10 信眾排行榜</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="ranking-table">
            <thead>
              <tr>
                <th>排名</th>
                <th>姓名</th>
                <th>打卡數</th>
                <th>消費總額</th>
              </tr>
            </thead>
            <tbody>
              {devotees.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#999' }}>
                    暫無資料
                  </td>
                </tr>
              ) : (
                devotees.map((devotee, index) => (
                  <tr
                    key={devotee.public_user_id || index}
                    onClick={() => handleDevoteeClick(devotee.public_user_id)}
                    style={{ cursor: devotee.public_user_id ? 'pointer' : 'default' }}
                  >
                    <td>
                      <span className={`rank-badge ${getRankBadgeClass(index + 1)}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td>{devotee.name_masked || devotee.name || '***'}</td>
                    <td>{devotee.checkins_count?.toLocaleString() || 0}</td>
                    <td>{devotee.spend_total?.toLocaleString() || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EngagementAnalysis;
