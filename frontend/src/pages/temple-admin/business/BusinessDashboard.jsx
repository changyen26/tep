/**
 * BusinessDashboard - 經營診斷儀表板
 *
 * 以企業經營角度呈現宮廟營運數據，
 * 包含健康度評分、警示系統、行動建議等
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './BusinessDashboard.css';
import '../analytics/AnalyticsDashboard.css'; // For AI Diagnosis styles

// 子元件
import HealthScoreCard from './components/HealthScoreCard';
import AlertsPanel from './components/AlertsPanel';
import RecommendationsPanel from './components/RecommendationsPanel';
import ConversionFunnel from './components/ConversionFunnel';
import RetentionCohort from './components/RetentionCohort';
import EventROITable from './components/EventROITable';
import AIDiagnosis from '../analytics/components/AIDiagnosis';

// Mock 資料
import { mockBusinessDashboardData, mockAnalyticsData } from '../../../mocks/templeAdminMockData';

// 開發模式：使用 Mock 資料
const USE_MOCK = true;

const BusinessDashboard = () => {
  const { templeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [reportMonth, setReportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // 取得資料
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setData(mockBusinessDashboardData(reportMonth));
        // 同時取得分析資料（包含年齡結構）供 AI 診斷使用
        setAnalyticsData(mockAnalyticsData('30d'));
      } else {
        // TODO: 實作 API 呼叫
        // const response = await businessApi.getDashboard(templeId, { month: reportMonth });
        // setData(response.data.data);
      }
    } catch (err) {
      console.error('取得經營數據失敗:', err);
    } finally {
      setLoading(false);
    }
  }, [templeId, reportMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 匯出報告
  const handleExport = () => {
    window.print();
  };

  // 載入中
  if (loading && !data) {
    return (
      <div className="business-dashboard">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>正在生成經營診斷報告...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-dashboard">
      {/* Header */}
      <div className="business-header">
        <h1>
          經營診斷報告
          <span className="period-badge">{reportMonth}</span>
        </h1>
        <div className="header-actions">
          <select
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="btn-export"
          >
            {generateMonthOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="btn-export" onClick={handleExport}>
            📄 匯出報告
          </button>
        </div>
      </div>

      {/* 健康度總覽 */}
      <HealthScoreCard data={data?.health_score} />

      {/* 警示面板 */}
      <AlertsPanel alerts={data?.alerts} />

      {/* 建議行動 */}
      <RecommendationsPanel recommendations={data?.recommendations} />

      {/* 雙欄佈局：漏斗 + 留存 */}
      <div className="two-column-layout">
        <ConversionFunnel data={data?.funnel} />
        <RetentionCohort data={data?.cohort} />
      </div>

      {/* 活動 ROI 分析 */}
      <EventROITable events={data?.event_roi} />

      {/* AI 智慧診斷 */}
      <section className="dashboard-section" style={{ marginTop: 24 }}>
        <AIDiagnosis
          analyticsData={analyticsData}
          ageData={analyticsData?.age_distribution}
        />
      </section>

      {/* 會議討論要點 */}
      <MeetingAgenda data={data?.meeting_points} />
    </div>
  );
};

/**
 * MeetingAgenda - 會議討論要點
 */
const MeetingAgenda = ({ data }) => {
  if (!data) return null;

  return (
    <div className="dashboard-card" style={{ marginTop: 24 }}>
      <h3>📋 本月會議討論要點</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* 要慶祝的事 */}
        <div style={{ padding: 16, background: '#d4edda', borderRadius: 10 }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#155724' }}>🎉 本月亮點</h4>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#155724' }}>
            {data.wins?.map((item, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{item}</li>
            ))}
          </ul>
        </div>

        {/* 要關注的事 */}
        <div style={{ padding: 16, background: '#fff3cd', borderRadius: 10 }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#856404' }}>⚠️ 待關注</h4>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#856404' }}>
            {data.concerns?.map((item, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{item}</li>
            ))}
          </ul>
        </div>

        {/* 下月目標 */}
        <div style={{ padding: 16, background: '#cce5ff', borderRadius: 10 }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#004085' }}>🎯 下月重點</h4>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#004085' }}>
            {data.next_month_goals?.map((item, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * 生成月份選項
 */
const generateMonthOptions = () => {
  const options = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    options.push({ value, label });
  }

  return options;
};

export default BusinessDashboard;
