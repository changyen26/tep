/**
 * ActivityTrendChart - 活動趨勢圖表元件
 */
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3498db', '#e74c3c', '#27ae60'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="item" style={{ color: entry.color }}>
            <span
              className="legend-color"
              style={{ backgroundColor: entry.color, display: 'inline-block', width: 10, height: 10, borderRadius: 2 }}
            />
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ActivityTrendChart = ({ trendData, interactionData }) => {
  // 格式化趨勢資料的日期
  const formattedTrendData = trendData?.map(item => ({
    ...item,
    date: item.date ? new Date(item.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }) : '',
  })) || [];

  // 互動類型分布資料
  const pieData = interactionData || [];

  return (
    <div className="chart-grid">
      {/* 左側折線圖 */}
      <div className="chart-card">
        <h3>活動趨勢</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="checkins"
                name="打卡數"
                stroke="#3498db"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                name="訂單數"
                stroke="#e74c3c"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="events"
                name="活動報名"
                stroke="#27ae60"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 右側圓餅圖 */}
      <div className="chart-card">
        <h3>互動類型分布</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="count"
                nameKey="type"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend">
          {pieData.map((item, index) => (
            <div key={index} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              {item.type}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityTrendChart;
