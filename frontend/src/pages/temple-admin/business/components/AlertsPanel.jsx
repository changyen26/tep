/**
 * AlertsPanel - 經營警示面板
 *
 * 顯示需要關注的經營問題和異常
 */
import React from 'react';

const AlertsPanel = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alerts-section">
        <div className="section-header">
          <h3>⚠️ 本月警示</h3>
        </div>
        <div style={{ textAlign: 'center', color: '#27ae60', padding: '20px' }}>
          ✓ 目前沒有需要關注的警示，經營狀況良好！
        </div>
      </div>
    );
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📌';
    }
  };

  return (
    <div className="alerts-section">
      <div className="section-header">
        <h3>
          ⚠️ 本月警示
          <span className="alert-count">{alerts.length}</span>
        </h3>
      </div>
      <div className="alert-list">
        {alerts.map((alert, index) => (
          <div key={index} className={`alert-item ${alert.severity}`}>
            <span className="alert-icon">{getAlertIcon(alert.severity)}</span>
            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-description">{alert.description}</div>
              {alert.action && (
                <span className="alert-action">
                  {alert.action} →
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
