/**
 * ConversionFunnel - 轉換漏斗圖
 *
 * 視覺化呈現信眾轉換流程
 */
import React from 'react';

const ConversionFunnel = ({ data }) => {
  if (!data) return null;

  const stages = [
    { key: 'visitors', label: '訪客/打卡', subLabel: '來過本廟的人' },
    { key: 'members', label: '註冊會員', subLabel: '留下資料的人' },
    { key: 'active', label: '活躍會員', subLabel: '30天內有互動' },
    { key: 'converted', label: '消費會員', subLabel: '有過消費紀錄' },
  ];

  const maxValue = Math.max(...stages.map(s => data[s.key]?.count || 0), 1);

  const getConversionClass = (rate) => {
    if (rate >= 50) return 'good';
    if (rate >= 30) return 'warning';
    return 'bad';
  };

  return (
    <div className="dashboard-card">
      <h3>🔻 信眾轉換漏斗</h3>
      <div className="funnel-visual">
        {stages.map((stage, index) => {
          const stageData = data[stage.key] || { count: 0, rate: 0 };
          const widthPercent = (stageData.count / maxValue) * 100;
          const conversionRate = index > 0 ? stageData.rate : null;

          return (
            <div key={stage.key} className="funnel-stage">
              <div
                className="funnel-bar"
                style={{ width: `${Math.max(widthPercent, 20)}%` }}
              >
                {stageData.count.toLocaleString()}
              </div>
              <div className="funnel-info">
                <div className="funnel-label">{stage.label}</div>
                <div className="funnel-conversion">
                  {stage.subLabel}
                  {conversionRate !== null && (
                    <span className={getConversionClass(conversionRate)}>
                      {' '}(轉換率 {conversionRate}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversionFunnel;
