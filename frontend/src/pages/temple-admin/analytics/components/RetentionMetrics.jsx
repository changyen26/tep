/**
 * RetentionMetrics - 留存指標元件
 */
import React from 'react';

const RetentionMetrics = ({ data }) => {
  if (!data) {
    return (
      <div className="chart-card">
        <h3>留存指標</h3>
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          暫無資料
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: '月留存率',
      value: `${data.mom_retention_rate || 0}%`,
      description: '上月活躍用戶本月回訪比例',
      positive: (data.mom_retention_rate || 0) >= 50,
    },
    {
      label: '週回訪率',
      value: `${data.weekly_return_rate || 0}%`,
      description: '一個月內 2+ 週有互動的比例',
      positive: (data.weekly_return_rate || 0) >= 30,
    },
    {
      label: '本月流失數',
      value: data.churned_this_month?.toLocaleString() || 0,
      description: '從活躍變休眠的人數',
      positive: false,
      isNegativeMetric: true,
    },
    {
      label: '平均回訪間隔',
      value: `${data.avg_return_days || 0} 天`,
      description: '會員平均回訪間隔天數',
      positive: (data.avg_return_days || 999) <= 14,
    },
  ];

  return (
    <div className="chart-card">
      <h3>留存指標</h3>
      <div className="retention-cards">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`retention-card ${
              metric.isNegativeMetric
                ? 'negative'
                : metric.positive
                ? 'positive'
                : ''
            }`}
          >
            <div className="metric-value">{metric.value}</div>
            <div className="metric-label">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RetentionMetrics;
