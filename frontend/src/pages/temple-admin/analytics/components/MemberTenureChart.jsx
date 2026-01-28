/**
 * MemberTenureChart - 會員資歷分析元件
 */
import React from 'react';

const MemberTenureChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <h3>會員資歷分析</h3>
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          暫無資料
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  const tenureConfig = {
    newcomer: { label: '新手 (<30天)', className: 'newcomer' },
    establishing: { label: '建立期 (1-6月)', className: 'establishing' },
    loyal: { label: '忠實 (6-12月)', className: 'loyal' },
    veteran: { label: '資深 (>1年)', className: 'veteran' },
  };

  return (
    <div className="chart-card">
      <h3>會員資歷分析</h3>
      <div className="tenure-bars">
        {data.map((item, index) => {
          const config = tenureConfig[item.tenure] || {
            label: item.tenure,
            className: 'default',
          };
          const widthPercent = (item.count / maxCount) * 100;

          return (
            <div key={index} className="tenure-item">
              <span className="tenure-label">{config.label}</span>
              <div className="tenure-bar-wrapper">
                <div
                  className={`tenure-bar ${config.className}`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <span className="tenure-value">
                {item.count.toLocaleString()} ({item.percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemberTenureChart;
