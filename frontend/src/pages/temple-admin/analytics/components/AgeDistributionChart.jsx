/**
 * AgeDistributionChart - 香客年齡結構分析
 */
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

const AgeDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <h3>香客年齡結構</h3>
        <div className="no-data">尚無年齡資料</div>
      </div>
    );
  }

  // 找出佔比最高的年齡層
  const maxGroup = data.reduce((max, item) =>
    item.percentage > max.percentage ? item : max
  , data[0]);

  // 計算總人數
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="age-distribution-section">
      {/* 圓餅圖 */}
      <div className="chart-card">
        <h3>年齡分布</h3>
        <div className="chart-container" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                nameKey="range"
                label={({ range, percentage }) => `${range} ${percentage}%`}
                labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} 人`, name]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-highlight">
          <span className="highlight-icon">💡</span>
          <span className="highlight-text">
            亮點：<strong>{maxGroup.range}</strong> 族群佔比最高（{maxGroup.percentage}%）
          </span>
        </div>
      </div>

      {/* 長條圖 */}
      <div className="chart-card">
        <h3>各年齡層人數</h3>
        <div className="chart-container" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="range"
                tick={{ fontSize: 12 }}
                width={70}
              />
              <Tooltip
                formatter={(value) => [`${value} 人`, '人數']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="age-stats">
          <div className="age-stat-item">
            <span className="stat-label">總人數</span>
            <span className="stat-value">{totalCount.toLocaleString()} 人</span>
          </div>
          <div className="age-stat-item">
            <span className="stat-label">青年比例 (18-34)</span>
            <span className="stat-value">
              {data
                .filter(d => d.range === '18-24歲' || d.range === '25-34歲')
                .reduce((sum, d) => sum + d.percentage, 0)}%
            </span>
          </div>
          <div className="age-stat-item">
            <span className="stat-label">熟齡比例 (50+)</span>
            <span className="stat-value">
              {data
                .filter(d => d.range === '50-64歲' || d.range === '65歲+')
                .reduce((sum, d) => sum + d.percentage, 0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeDistributionChart;
