/**
 * SpendDistribution - 消費洞察元件
 * 包含消費金額分布和會員轉換漏斗
 */
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const SpendDistribution = ({ spendData, funnelData }) => {
  // 消費金額分布資料
  const distribution = spendData || [];

  return (
    <div className="analysis-grid">
      {/* 左側：消費金額分布 */}
      <div className="chart-card">
        <h3>消費金額分布</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [value, '人數']}
                labelFormatter={(label) => `消費 ${label}`}
              />
              <Bar
                dataKey="count"
                fill="#e74c3c"
                radius={[4, 4, 0, 0]}
                label={{ position: 'top', fontSize: 11 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 右側：會員轉換漏斗 */}
      <div className="chart-card">
        <h3>會員轉換漏斗</h3>
        <ConversionFunnel data={funnelData} />
      </div>
    </div>
  );
};

// 轉換漏斗子元件
const ConversionFunnel = ({ data }) => {
  if (!data) return <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>暫無資料</div>;

  const steps = [
    { key: 'all_members', label: '總會員', value: data.all_members || 0 },
    { key: 'active_30d', label: '活躍會員 (30天)', value: data.active_30d || 0 },
    { key: 'made_order', label: '有下單', value: data.made_order || 0 },
    { key: 'repeat_order', label: '回購會員', value: data.repeat_order || 0 },
  ];

  const maxValue = Math.max(...steps.map(s => s.value), 1);

  return (
    <div className="funnel-container">
      {steps.map((step, index) => {
        const widthPercent = (step.value / maxValue) * 100;
        const prevValue = index > 0 ? steps[index - 1].value : step.value;
        const conversionRate = prevValue > 0 ? ((step.value / prevValue) * 100).toFixed(1) : 0;

        return (
          <div key={step.key} className="funnel-step">
            <div
              className="funnel-bar"
              style={{ width: `${Math.max(widthPercent, 15)}%` }}
            >
              {step.value.toLocaleString()}
            </div>
            <span className="funnel-label">{step.label}</span>
            {index > 0 && (
              <span className="funnel-rate">({conversionRate}%)</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SpendDistribution;
