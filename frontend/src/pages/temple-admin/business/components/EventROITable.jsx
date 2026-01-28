/**
 * EventROITable - 活動投資報酬分析表
 *
 * 評估每場活動的成效與 ROI
 */
import React from 'react';

const EventROITable = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="event-roi-section">
        <div className="section-header">
          <h3>📅 活動成效分析</h3>
        </div>
        <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
          近期沒有已完成的活動數據
        </div>
      </div>
    );
  }

  const getROIBadgeClass = (roi) => {
    if (roi >= 3) return 'excellent';
    if (roi >= 2) return 'good';
    if (roi >= 1) return 'fair';
    return 'poor';
  };

  const getROILabel = (roi) => {
    if (roi >= 3) return '優異';
    if (roi >= 2) return '良好';
    if (roi >= 1) return '持平';
    return '需檢討';
  };

  return (
    <div className="event-roi-section">
      <div className="section-header">
        <h3>📅 活動成效分析</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="event-roi-table">
          <thead>
            <tr>
              <th>活動名稱</th>
              <th>投入成本</th>
              <th>新增會員</th>
              <th>帶動營收</th>
              <th>獲客成本</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={index}>
                <td>
                  <div className="event-name">{event.name}</div>
                  <div className="event-date">{event.date}</div>
                </td>
                <td>${event.cost.toLocaleString()}</td>
                <td>{event.new_members} 人</td>
                <td>${event.revenue.toLocaleString()}</td>
                <td>
                  ${event.new_members > 0
                    ? Math.round(event.cost / event.new_members).toLocaleString()
                    : '-'}/人
                </td>
                <td>
                  <span className={`roi-badge ${getROIBadgeClass(event.roi)}`}>
                    {event.roi}x {getROILabel(event.roi)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 16, fontSize: 13, color: '#666', padding: '12px', background: '#f8f9fa', borderRadius: 8 }}>
        <strong>ROI 計算說明：</strong>
        ROI = (帶動營收 - 投入成本) / 投入成本。
        建議 ROI ≥ 2x 的活動可考慮擴大規模，&lt; 1x 需檢討改進方式。
      </div>
    </div>
  );
};

export default EventROITable;
