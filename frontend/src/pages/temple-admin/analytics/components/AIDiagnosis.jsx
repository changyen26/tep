/**
 * AIDiagnosis - AI 智慧診斷與決策建議
 */
import React, { useState } from 'react';

const AIDiagnosis = ({ analyticsData, ageData }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // 模擬 AI 分析
  const runAIDiagnosis = async () => {
    setIsAnalyzing(true);

    // 模擬 AI 分析延遲
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 根據數據生成診斷結果
    const result = generateDiagnosis(analyticsData, ageData);
    setDiagnosis(result);
    setIsAnalyzing(false);
  };

  // 生成診斷結果（模擬 AI 邏輯）
  const generateDiagnosis = (analytics, age) => {
    const overview = analytics?.overview || {};
    const retention = analytics?.retention || {};
    const funnel = analytics?.funnel || {};

    // 計算各項指標
    const activeRate = overview.total_members > 0
      ? ((overview.active_members / overview.total_members) * 100).toFixed(1)
      : 0;
    const dormantRate = overview.total_members > 0
      ? ((overview.dormant_members / overview.total_members) * 100).toFixed(1)
      : 0;

    // 找出主要年齡層
    const mainAgeGroup = age?.reduce((max, item) =>
      item.percentage > max.percentage ? item : max
    , age?.[0] || { range: '未知', percentage: 0 });

    // 計算年輕族群比例
    const youngRate = age
      ?.filter(d => d.range === '18-24歲' || d.range === '25-34歲')
      .reduce((sum, d) => sum + d.percentage, 0) || 0;

    // 生成診斷
    return {
      score: calculateHealthScore(analytics, age),
      timestamp: new Date().toISOString(),
      summary: {
        strengths: generateStrengths(activeRate, youngRate, mainAgeGroup, retention),
        weaknesses: generateWeaknesses(dormantRate, retention, funnel),
        opportunities: generateOpportunities(age, analytics),
        threats: generateThreats(dormantRate, retention),
      },
      recommendations: generateRecommendations(analytics, age),
      ageInsights: generateAgeInsights(age),
      actionPlan: generateActionPlan(analytics, age),
    };
  };

  // 計算健康分數
  const calculateHealthScore = (analytics, age) => {
    let score = 60; // 基礎分數

    const overview = analytics?.overview || {};
    const retention = analytics?.retention || {};

    // 活躍率加分
    const activeRate = overview.total_members > 0
      ? (overview.active_members / overview.total_members) * 100
      : 0;
    if (activeRate > 40) score += 15;
    else if (activeRate > 25) score += 10;
    else if (activeRate > 15) score += 5;

    // 留存率加分
    if (retention.mom_retention_rate > 70) score += 10;
    else if (retention.mom_retention_rate > 50) score += 5;

    // 年輕族群加分
    const youngRate = age
      ?.filter(d => d.range === '18-24歲' || d.range === '25-34歲')
      .reduce((sum, d) => sum + d.percentage, 0) || 0;
    if (youngRate > 30) score += 10;
    else if (youngRate > 20) score += 5;

    return Math.min(100, Math.max(0, score));
  };

  // 生成優勢
  const generateStrengths = (activeRate, youngRate, mainAgeGroup, retention) => {
    const strengths = [];

    if (activeRate > 30) {
      strengths.push(`活躍會員比例達 ${activeRate}%，顯示信眾參與度高`);
    }
    if (youngRate > 25) {
      strengths.push(`年輕族群（18-34歲）佔比 ${youngRate}%，具有發展潛力`);
    }
    if (mainAgeGroup.percentage > 25) {
      strengths.push(`${mainAgeGroup.range} 為主力客群，可針對性經營`);
    }
    if (retention?.mom_retention_rate > 60) {
      strengths.push(`月留存率 ${retention.mom_retention_rate}%，信眾黏著度佳`);
    }

    return strengths.length > 0 ? strengths : ['持續收集數據以進行更精準分析'];
  };

  // 生成劣勢
  const generateWeaknesses = (dormantRate, retention, funnel) => {
    const weaknesses = [];

    if (dormantRate > 30) {
      weaknesses.push(`休眠會員達 ${dormantRate}%，需加強喚醒策略`);
    }
    if (retention?.mom_retention_rate < 50) {
      weaknesses.push('月留存率偏低，信眾回訪意願需提升');
    }
    if (funnel?.all_members > 0 && funnel?.made_order / funnel?.all_members < 0.2) {
      weaknesses.push('會員轉換率偏低，商品或服務吸引力待加強');
    }

    return weaknesses.length > 0 ? weaknesses : ['目前無明顯劣勢，建議持續監測'];
  };

  // 生成機會
  const generateOpportunities = (age, analytics) => {
    const opportunities = [];

    const youngRate = age
      ?.filter(d => d.range === '18-24歲' || d.range === '25-34歲')
      .reduce((sum, d) => sum + d.percentage, 0) || 0;

    if (youngRate > 20) {
      opportunities.push('年輕族群佔比可觀，可發展社群行銷與線上服務');
    }

    const seniorRate = age
      ?.filter(d => d.range === '50-64歲' || d.range === '65歲+')
      .reduce((sum, d) => sum + d.percentage, 0) || 0;

    if (seniorRate > 30) {
      opportunities.push('熟齡族群為主力，可強化傳統文化活動與健康祈福服務');
    }

    opportunities.push('善用 LINE 推播維繫信眾關係');
    opportunities.push('結合在地觀光資源，發展宗教文化旅遊');

    return opportunities;
  };

  // 生成威脅
  const generateThreats = (dormantRate, retention) => {
    const threats = [];

    if (dormantRate > 40) {
      threats.push('休眠會員比例過高，可能流失潛在信眾');
    }
    if (retention?.churned_this_month > 50) {
      threats.push(`本月流失 ${retention.churned_this_month} 位信眾，需關注原因`);
    }

    threats.push('宗教場所競爭，需持續提升服務品質');
    threats.push('年輕世代宗教參與度下降的社會趨勢');

    return threats;
  };

  // 生成建議
  const generateRecommendations = (analytics, age) => {
    const recommendations = [];

    // 根據年齡結構給建議
    const youngRate = age
      ?.filter(d => d.range === '18-24歲' || d.range === '25-34歲')
      .reduce((sum, d) => sum + d.percentage, 0) || 0;

    if (youngRate > 25) {
      recommendations.push({
        category: '數位經營',
        title: '強化社群與線上服務',
        description: '年輕族群佔比高，建議加強 Instagram、LINE 社群經營，提供線上點燈、線上祈福等服務。',
        priority: 'high',
        impact: '提升年輕族群參與度 20%',
      });
    }

    const seniorRate = age
      ?.filter(d => d.range === '50-64歲' || d.range === '65歲+')
      .reduce((sum, d) => sum + d.percentage, 0) || 0;

    if (seniorRate > 30) {
      recommendations.push({
        category: '活動企劃',
        title: '規劃適合熟齡族群的活動',
        description: '熟齡信眾為主力，建議舉辦健康祈福、長輩關懷等活動，並提供交通接駁服務。',
        priority: 'high',
        impact: '提升熟齡族群滿意度',
      });
    }

    // 根據留存率給建議
    const retention = analytics?.retention || {};
    if (retention.mom_retention_rate < 60) {
      recommendations.push({
        category: '會員經營',
        title: '建立會員關懷機制',
        description: '定期發送生日祝福、節日問候，舉辦會員專屬活動，提升信眾歸屬感。',
        priority: 'medium',
        impact: '提升留存率 15%',
      });
    }

    // 根據休眠率給建議
    const overview = analytics?.overview || {};
    const dormantRate = overview.total_members > 0
      ? (overview.dormant_members / overview.total_members) * 100
      : 0;

    if (dormantRate > 25) {
      recommendations.push({
        category: '喚醒策略',
        title: '啟動休眠會員喚醒計畫',
        description: '針對 90 天以上未互動的信眾，發送專屬優惠或活動邀請，重新建立連結。',
        priority: 'high',
        impact: `喚醒 ${Math.round(overview.dormant_members * 0.2)} 位休眠會員`,
      });
    }

    recommendations.push({
      category: '數據收集',
      title: '完善會員資料',
      description: '鼓勵信眾填寫生日、地址等資料，以便進行更精準的個人化服務。',
      priority: 'low',
      impact: '提升數據分析準確度',
    });

    return recommendations;
  };

  // 生成年齡洞察
  const generateAgeInsights = (age) => {
    if (!age || age.length === 0) return [];

    const insights = [];

    // 找出各項統計
    const maxGroup = age.reduce((max, item) =>
      item.percentage > max.percentage ? item : max
    , age[0]);

    const minGroup = age.reduce((min, item) =>
      item.percentage < min.percentage ? item : min
    , age[0]);

    insights.push({
      icon: '👥',
      title: '主力客群',
      content: `${maxGroup.range} 佔比 ${maxGroup.percentage}%，是本廟最主要的信眾群體`,
    });

    insights.push({
      icon: '📈',
      title: '成長潛力',
      content: `${minGroup.range} 佔比僅 ${minGroup.percentage}%，可作為拓展目標`,
    });

    const youngRate = age
      .filter(d => d.range === '18-24歲' || d.range === '25-34歲')
      .reduce((sum, d) => sum + d.percentage, 0);

    if (youngRate > 30) {
      insights.push({
        icon: '🌟',
        title: '年輕化優勢',
        content: `年輕族群佔比 ${youngRate}%，高於一般宗教場所平均值`,
      });
    } else if (youngRate < 20) {
      insights.push({
        icon: '⚠️',
        title: '年輕化挑戰',
        content: `年輕族群僅佔 ${youngRate}%，建議加強年輕世代的吸引力`,
      });
    }

    return insights;
  };

  // 生成行動計畫
  const generateActionPlan = (analytics, age) => {
    return [
      {
        phase: '短期（1個月內）',
        actions: [
          '發送節日祝福推播給全體信眾',
          '整理並更新會員聯絡資料',
          '規劃下季度活動行事曆',
        ],
      },
      {
        phase: '中期（1-3個月）',
        actions: [
          '啟動休眠會員喚醒推播',
          '舉辦會員專屬感恩活動',
          '優化線上服務流程',
        ],
      },
      {
        phase: '長期（3-6個月）',
        actions: [
          '建立完整的會員分級制度',
          '發展異業合作與觀光連結',
          '持續追蹤成效並調整策略',
        ],
      },
    ];
  };

  // 獲取分數等級
  const getScoreLevel = (score) => {
    if (score >= 80) return { label: '優秀', color: '#10b981' };
    if (score >= 60) return { label: '良好', color: '#3b82f6' };
    if (score >= 40) return { label: '待改善', color: '#f59e0b' };
    return { label: '需關注', color: '#ef4444' };
  };

  // 獲取優先級樣式
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return { bg: '#fee2e2', color: '#991b1b', label: '高' };
      case 'medium':
        return { bg: '#fef3c7', color: '#92400e', label: '中' };
      case 'low':
        return { bg: '#d1fae5', color: '#065f46', label: '低' };
      default:
        return { bg: '#f3f4f6', color: '#374151', label: '-' };
    }
  };

  return (
    <div className="ai-diagnosis-section">
      <div className="ai-header">
        <div className="ai-title">
          <span className="ai-icon">🤖</span>
          <h3>AI 智慧診斷</h3>
        </div>
        <button
          className={`ai-analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
          onClick={runAIDiagnosis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <span className="spinner"></span>
              分析中...
            </>
          ) : diagnosis ? (
            '重新分析'
          ) : (
            '開始 AI 診斷'
          )}
        </button>
      </div>

      {!diagnosis && !isAnalyzing && (
        <div className="ai-placeholder">
          <div className="placeholder-icon">🔮</div>
          <p>點擊「開始 AI 診斷」，讓 AI 分析您的數據並提供經營建議</p>
          <ul className="placeholder-features">
            <li>📊 SWOT 分析（優勢、劣勢、機會、威脅）</li>
            <li>👥 年齡結構洞察</li>
            <li>💡 個人化經營建議</li>
            <li>📋 分階段行動計畫</li>
          </ul>
        </div>
      )}

      {diagnosis && (
        <div className="ai-result">
          {/* 健康分數 */}
          <div className="health-score-card">
            <div className="score-circle" style={{ borderColor: getScoreLevel(diagnosis.score).color }}>
              <span className="score-number">{diagnosis.score}</span>
              <span className="score-label">分</span>
            </div>
            <div className="score-info">
              <div
                className="score-level"
                style={{ color: getScoreLevel(diagnosis.score).color }}
              >
                {getScoreLevel(diagnosis.score).label}
              </div>
              <div className="score-desc">經營健康度評分</div>
            </div>
          </div>

          {/* 分頁標籤 */}
          <div className="ai-tabs">
            <button
              className={`ai-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              SWOT 分析
            </button>
            <button
              className={`ai-tab ${activeTab === 'age' ? 'active' : ''}`}
              onClick={() => setActiveTab('age')}
            >
              年齡洞察
            </button>
            <button
              className={`ai-tab ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommendations')}
            >
              經營建議
            </button>
            <button
              className={`ai-tab ${activeTab === 'action' ? 'active' : ''}`}
              onClick={() => setActiveTab('action')}
            >
              行動計畫
            </button>
          </div>

          {/* SWOT 分析 */}
          {activeTab === 'overview' && (
            <div className="swot-grid">
              <div className="swot-card strengths">
                <h4>💪 優勢 (Strengths)</h4>
                <ul>
                  {diagnosis.summary.strengths.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="swot-card weaknesses">
                <h4>⚠️ 劣勢 (Weaknesses)</h4>
                <ul>
                  {diagnosis.summary.weaknesses.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="swot-card opportunities">
                <h4>🎯 機會 (Opportunities)</h4>
                <ul>
                  {diagnosis.summary.opportunities.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="swot-card threats">
                <h4>🚨 威脅 (Threats)</h4>
                <ul>
                  {diagnosis.summary.threats.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 年齡洞察 */}
          {activeTab === 'age' && (
            <div className="age-insights">
              {diagnosis.ageInsights.map((insight, i) => (
                <div key={i} className="insight-card">
                  <span className="insight-icon">{insight.icon}</span>
                  <div className="insight-content">
                    <h4>{insight.title}</h4>
                    <p>{insight.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 經營建議 */}
          {activeTab === 'recommendations' && (
            <div className="recommendations-list">
              {diagnosis.recommendations.map((rec, i) => (
                <div key={i} className="recommendation-card">
                  <div className="rec-header">
                    <span className="rec-category">{rec.category}</span>
                    <span
                      className="rec-priority"
                      style={{
                        backgroundColor: getPriorityStyle(rec.priority).bg,
                        color: getPriorityStyle(rec.priority).color,
                      }}
                    >
                      優先級：{getPriorityStyle(rec.priority).label}
                    </span>
                  </div>
                  <h4 className="rec-title">{rec.title}</h4>
                  <p className="rec-desc">{rec.description}</p>
                  <div className="rec-impact">
                    <span className="impact-label">預期效果：</span>
                    <span className="impact-value">{rec.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 行動計畫 */}
          {activeTab === 'action' && (
            <div className="action-plan">
              {diagnosis.actionPlan.map((phase, i) => (
                <div key={i} className="phase-card">
                  <h4 className="phase-title">{phase.phase}</h4>
                  <ul className="phase-actions">
                    {phase.actions.map((action, j) => (
                      <li key={j}>
                        <span className="action-checkbox">☐</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="ai-footer">
            <span className="ai-timestamp">
              分析時間：{new Date(diagnosis.timestamp).toLocaleString('zh-TW')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDiagnosis;
