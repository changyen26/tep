/**
 * RetentionCohort - 留存同類群分析表
 *
 * 顯示不同月份加入的會員在後續月份的回訪率
 */
import React from 'react';

const RetentionCohort = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="dashboard-card">
        <h3>📊 會員留存分析 (同類群)</h3>
        <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
          資料不足，需要至少 3 個月的數據
        </div>
      </div>
    );
  }

  const getCohortClass = (rate) => {
    if (rate >= 70) return 'high';
    if (rate >= 50) return 'medium-high';
    if (rate >= 30) return 'medium';
    if (rate >= 15) return 'medium-low';
    return 'low';
  };

  const months = ['M+1', 'M+2', 'M+3', 'M+4', 'M+5', 'M+6'];

  return (
    <div className="dashboard-card">
      <h3>📊 會員留存分析 (同類群)</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="cohort-table">
          <thead>
            <tr>
              <th>加入月份</th>
              <th>新會員</th>
              {months.slice(0, data[0]?.retention?.length || 0).map((m, i) => (
                <th key={i}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((cohort, rowIndex) => (
              <tr key={rowIndex}>
                <td>{cohort.month}</td>
                <td>{cohort.new_members}</td>
                {cohort.retention.map((rate, colIndex) => (
                  <td key={colIndex}>
                    {rate !== null ? (
                      <span className={`cohort-cell ${getCohortClass(rate)}`}>
                        {rate}%
                      </span>
                    ) : (
                      <span style={{ color: '#ccc' }}>-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 16, fontSize: 12, color: '#888' }}>
        顏色說明:
        <span style={{ marginLeft: 8 }}>
          <span className="cohort-cell high" style={{ padding: '2px 6px', marginRight: 4 }}>≥70%</span>
          <span className="cohort-cell medium" style={{ padding: '2px 6px', marginRight: 4 }}>30-50%</span>
          <span className="cohort-cell low" style={{ padding: '2px 6px' }}>&lt;15%</span>
        </span>
      </div>
    </div>
  );
};

export default RetentionCohort;
