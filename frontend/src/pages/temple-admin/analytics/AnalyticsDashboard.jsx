/**
 * AnalyticsDashboard - 廟方數據分析儀表板
 *
 * 提供會員結構、活動趨勢、消費行為等數據分析
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './AnalyticsDashboard.css';

// 子元件
import MemberOverviewCards from './components/MemberOverviewCards';
import ActivityTrendChart from './components/ActivityTrendChart';
import EngagementAnalysis from './components/EngagementAnalysis';
import SpendDistribution from './components/SpendDistribution';
import RetentionMetrics from './components/RetentionMetrics';
import MemberTenureChart from './components/MemberTenureChart';
import AgeDistributionChart from './components/AgeDistributionChart';

// API 與 Mock 資料
import { analytics } from '../../../services/templeAdminApi';
import { mockAnalyticsData } from '../../../mocks/templeAdminMockData';

// 開發模式：使用 Mock 資料
const USE_MOCK = true;

const AnalyticsDashboard = () => {
  const { templeId } = useParams();
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // 取得分析資料
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // 使用 Mock 資料
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(mockAnalyticsData(period));
      } else {
        // 從 API 取得資料
        const response = await analytics.getMemberAnalytics(templeId, { period });
        if (response.data?.success) {
          setData(response.data.data);
        } else {
          throw new Error(response.data?.message || '取得分析資料失敗');
        }
      }
    } catch (err) {
      console.error('取得分析資料失敗:', err);
      setError(err.message || '無法載入分析資料');
    } finally {
      setLoading(false);
    }
  }, [templeId, period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // 處理時間範圍變更
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  // 重新整理
  const handleRefresh = () => {
    fetchAnalytics();
  };

  // 載入中狀態
  if (loading && !data) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>載入分析資料中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error && !data) {
    return (
      <div className="analytics-dashboard">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={handleRefresh}>重試</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <h1>數據分析</h1>
        <div className="analytics-controls">
          <select
            className="period-select"
            value={period}
            onChange={handlePeriodChange}
          >
            <option value="7d">最近 7 天</option>
            <option value="30d">最近 30 天</option>
            <option value="90d">最近 90 天</option>
            <option value="365d">最近一年</option>
          </select>
          <button
            className={`refresh-btn ${loading ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? '載入中...' : '重新整理'}
          </button>
        </div>
      </div>

      {/* 區塊 1: 會員總覽卡片 */}
      <section className="analytics-section">
        <h2 className="section-title">會員總覽</h2>
        <MemberOverviewCards data={data?.overview} />
      </section>

      {/* 區塊 2: 活動趨勢圖表 */}
      <section className="analytics-section">
        <h2 className="section-title">活動趨勢</h2>
        <ActivityTrendChart
          trendData={data?.activity_trend}
          interactionData={data?.interaction_types}
        />
      </section>

      {/* 區塊 3: 互動分析 */}
      <section className="analytics-section">
        <h2 className="section-title">互動分析</h2>
        <EngagementAnalysis
          checkinFrequency={data?.checkin_frequency}
          topDevotees={data?.top_devotees}
        />
      </section>

      {/* 區塊 4: 消費洞察 */}
      <section className="analytics-section">
        <h2 className="section-title">消費洞察</h2>
        <SpendDistribution
          spendData={data?.spend_distribution}
          funnelData={data?.funnel}
        />
      </section>

      {/* 區塊 5: 留存指標與會員資歷 */}
      <section className="analytics-section">
        <h2 className="section-title">留存與會員資歷</h2>
        <div className="analysis-grid">
          <RetentionMetrics data={data?.retention} />
          <MemberTenureChart data={data?.member_tenure} />
        </div>
      </section>

      {/* 區塊 6: 香客年齡結構 */}
      <section className="analytics-section">
        <h2 className="section-title">香客年齡結構</h2>
        <AgeDistributionChart data={data?.age_distribution} />
      </section>
    </div>
  );
};

export default AnalyticsDashboard;
