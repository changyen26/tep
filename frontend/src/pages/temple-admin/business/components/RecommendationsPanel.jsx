/**
 * RecommendationsPanel - 行動建議面板
 *
 * 根據數據分析提供具體的改善建議
 */
import React from 'react';

const RecommendationsPanel = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return '高優先';
      case 'medium': return '中優先';
      case 'low': return '可考慮';
      default: return '建議';
    }
  };

  return (
    <div className="recommendations-section">
      <div className="section-header">
        <h3>💡 建議行動</h3>
      </div>
      <div className="recommendation-cards">
        {recommendations.map((rec, index) => (
          <div key={index} className="recommendation-card">
            <span className={`recommendation-priority ${rec.priority}`}>
              {getPriorityLabel(rec.priority)}
            </span>
            <div className="recommendation-title">{rec.title}</div>
            <div className="recommendation-description">{rec.description}</div>
            <div className="recommendation-impact">
              <span>📈</span>
              <span>預期效果: {rec.expected_impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPanel;
