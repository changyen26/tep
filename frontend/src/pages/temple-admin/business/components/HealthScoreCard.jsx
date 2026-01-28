/**
 * HealthScoreCard - 經營健康度總覽卡片
 *
 * 顯示整體健康度評分和四大支柱指標
 */
import React from 'react';

const HealthScoreCard = ({ data }) => {
  if (!data) return null;

  const { overall, pillars } = data;

  // 根據分數決定狀態
  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return '優良';
    if (score >= 60) return '尚可';
    if (score >= 40) return '待改善';
    return '警戒';
  };

  const getStatusDot = (score) => {
    if (score >= 70) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  const getPillarScoreClass = (score) => {
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  const pillarConfig = {
    acquisition: { title: '獲客力', icon: '🎯', key: 'acquisition' },
    activation: { title: '活躍度', icon: '⚡', key: 'activation' },
    retention: { title: '留存力', icon: '🔄', key: 'retention' },
    revenue: { title: '變現力', icon: '💰', key: 'revenue' },
  };

  return (
    <div className="health-overview">
      {/* Header */}
      <div className="health-header">
        <div className="health-score-main">
          <div className={`score-circle ${getScoreClass(overall.score)}`}>
            <span className="score-number">{overall.score}</span>
            <span className="score-label">分</span>
          </div>
          <div className="health-info">
            <h2>本月經營健康度</h2>
            <div className="health-status">
              <span className={`status-dot ${getStatusDot(overall.score)}`} />
              <span>{getScoreLabel(overall.score)}</span>
              <span style={{ color: '#888', marginLeft: 8 }}>
                ({overall.benchmark_comparison})
              </span>
            </div>
          </div>
        </div>
        <div className="health-trend">
          <div className={`trend-value ${overall.trend > 0 ? 'up' : overall.trend < 0 ? 'down' : 'flat'}`}>
            {overall.trend > 0 ? '↑' : overall.trend < 0 ? '↓' : '→'}
            {Math.abs(overall.trend)}%
          </div>
          <div className="trend-label">較上月</div>
        </div>
      </div>

      {/* Four Pillars */}
      <div className="four-pillars">
        {Object.entries(pillarConfig).map(([key, config]) => {
          const pillar = pillars[key];
          if (!pillar) return null;

          return (
            <div key={key} className={`pillar-card ${key}`}>
              <div className="pillar-header">
                <span className="pillar-title">
                  {config.icon} {config.title}
                </span>
                <span className={`pillar-score ${getPillarScoreClass(pillar.score)}`}>
                  {pillar.score}分
                </span>
              </div>
              <div className="pillar-value">{pillar.value}</div>
              <div className={`pillar-change ${pillar.change >= 0 ? 'positive' : 'negative'}`}>
                {pillar.change >= 0 ? '↑' : '↓'} {Math.abs(pillar.change)}%
                <span style={{ color: '#888', marginLeft: 4 }}>vs 上月</span>
              </div>
              <div className="pillar-benchmark">
                業界標準: {pillar.benchmark}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthScoreCard;
