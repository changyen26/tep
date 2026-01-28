import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockCheckins } from '../../mocks/templeAdminMockData';
import './CheckinRecords.css';

const USE_MOCK = true; // 設為 false 使用真實 API

const CheckinRecords = () => {
  const { templeId } = useParams();

  // 篩選條件
  const [period, setPeriod] = useState('week'); // day, week, month
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 資料狀態
  const [checkinStats, setCheckinStats] = useState(null);
  const [checkinRecords, setCheckinRecords] = useState([]);
  const [summary, setSummary] = useState({ total_checkins: 0, total_visitors: 0 });

  // UI 狀態
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // 分頁
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // 載入打卡統計（時段圖表用）
  const fetchCheckinStats = async () => {
    try {
      if (USE_MOCK) {
        // 生成 Mock 統計資料
        await new Promise(resolve => setTimeout(resolve, 200));

        if (period === 'day') {
          // 今日每小時統計
          const hourlyStats = [];
          for (let h = 6; h <= 20; h++) {
            hourlyStats.push({
              hour: h,
              count: Math.floor(Math.random() * 10) + 1,
            });
          }
          setCheckinStats({ hourly_stats: hourlyStats, daily_stats: [] });
        } else {
          // 每日統計
          const dailyStats = [];
          const days = period === 'week' ? 7 : 30;
          for (let d = days - 1; d >= 0; d--) {
            const date = new Date();
            date.setDate(date.getDate() - d);
            dailyStats.push({
              date: date.toISOString().split('T')[0],
              count: Math.floor(Math.random() * 50) + 10,
            });
          }
          setCheckinStats({ daily_stats: dailyStats, hourly_stats: [] });
        }
      } else {
        setCheckinStats({ daily_stats: [], hourly_stats: [] });
      }
    } catch (err) {
      console.error('載入打卡統計失敗:', err);
    }
  };

  // 載入打卡記錄列表
  const fetchCheckinRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: pageSize,
        period: 'all',
      };

      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      if (USE_MOCK) {
        // 使用 Mock 資料
        await new Promise(resolve => setTimeout(resolve, 300));
        let filtered = [...mockCheckins];

        if (params.start_date) {
          filtered = filtered.filter(c => new Date(c.timestamp) >= new Date(params.start_date));
        }

        if (params.end_date) {
          filtered = filtered.filter(c => new Date(c.timestamp) <= new Date(params.end_date + 'T23:59:59'));
        }

        const totalCheckins = filtered.length;
        const uniqueUsers = new Set(filtered.map(c => c.user_id)).size;

        setSummary({
          total_checkins: totalCheckins,
          total_visitors: uniqueUsers,
        });

        const start = (params.page - 1) * params.per_page;
        const paginated = filtered.slice(start, start + params.per_page);

        setCheckinRecords(paginated);
        setTotalPages(Math.ceil(totalCheckins / pageSize));
      } else {
        const templeAdminApi = await import('../../services/templeAdminApi').then(m => m.default);
        const response = await templeAdminApi.checkins.list(templeId, params);

        if (response.success) {
          const data = response.data;
          setCheckinRecords(data.checkins || []);

          const totalCheckins = data.total || 0;
          const uniqueUsers = new Set(
            (data.checkins || []).map((c) => c.user_id)
          ).size;

          setSummary({
            total_checkins: totalCheckins,
            total_visitors: uniqueUsers,
          });

          const total = data.total || 0;
          setTotalPages(Math.ceil(total / pageSize));
        }
      }
    } catch (err) {
      console.error('載入打卡記錄失敗:', err);
      setError('載入打卡記錄失敗');
    } finally {
      setLoading(false);
    }
  };

  // 初始載入
  useEffect(() => {
    if (templeId) {
      fetchCheckinStats();
      fetchCheckinRecords();
    }
  }, [templeId, period, currentPage, startDate, endDate]);

  // 處理搜尋
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCheckinRecords();
  };

  // 重置篩選
  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // 匯出 CSV（TODO: 待後端實作）
  const handleExport = async () => {
    try {
      setExporting(true);
      // await templeAdminApi.checkins.export(templeId, { start_date: startDate, end_date: endDate });
      alert('匯出功能尚未開放，敬請期待');
    } catch (err) {
      console.error('匯出失敗:', err);
      alert('匯出失敗，請稍後再試');
    } finally {
      setExporting(false);
    }
  };

  // 格式化日期時間
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 計算圖表最大值（用於比例顯示）
  const getMaxValue = () => {
    if (!checkinStats) return 1;

    if (period === 'day' && checkinStats.hourly_stats) {
      return Math.max(...checkinStats.hourly_stats.map((s) => s.count), 1);
    }

    if (checkinStats.daily_stats) {
      return Math.max(...checkinStats.daily_stats.map((s) => s.count), 1);
    }

    return 1;
  };

  return (
    <div className="checkin-records">
      <div className="page-header">
        <h1 className="page-title">打卡紀錄管理</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? '匯出中...' : '匯出 CSV'}
        </button>
      </div>

      {/* 統計摘要卡片 */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">總打卡次數</div>
          <div className="summary-value">{summary.total_checkins}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">總訪客數</div>
          <div className="summary-value">{summary.total_visitors}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">平均每人打卡</div>
          <div className="summary-value">
            {summary.total_visitors > 0
              ? (summary.total_checkins / summary.total_visitors).toFixed(1)
              : 0}
          </div>
        </div>
      </div>

      {/* 時段選擇與圖表 */}
      <div className="chart-section">
        <div className="chart-header">
          <h2 className="section-title">打卡時段分析</h2>
          <div className="period-tabs">
            <button
              type="button"
              className={`period-tab ${period === 'day' ? 'active' : ''}`}
              onClick={() => setPeriod('day')}
            >
              今日
            </button>
            <button
              type="button"
              className={`period-tab ${period === 'week' ? 'active' : ''}`}
              onClick={() => setPeriod('week')}
            >
              本週
            </button>
            <button
              type="button"
              className={`period-tab ${period === 'month' ? 'active' : ''}`}
              onClick={() => setPeriod('month')}
            >
              本月
            </button>
          </div>
        </div>

        {/* 簡易長條圖 */}
        <div className="chart-container">
          {!checkinStats ? (
            <p className="chart-loading">載入中...</p>
          ) : period === 'day' && checkinStats.hourly_stats ? (
            <div className="bar-chart">
              {checkinStats.hourly_stats.map((stat) => (
                <div key={stat.hour} className="bar-item">
                  <div className="bar-label">{stat.hour}:00</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        width: `${(stat.count / getMaxValue()) * 100}%`,
                      }}
                    >
                      <span className="bar-value">{stat.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : checkinStats.daily_stats ? (
            <div className="bar-chart">
              {checkinStats.daily_stats.map((stat) => (
                <div key={stat.date} className="bar-item">
                  <div className="bar-label">{stat.date}</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        width: `${(stat.count / getMaxValue()) * 100}%`,
                      }}
                    >
                      <span className="bar-value">{stat.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="chart-empty">暫無資料</p>
          )}
        </div>
      </div>

      {/* 搜尋與篩選 */}
      <div className="filter-section">
        <h2 className="section-title">打卡記錄列表</h2>
        <div className="filter-form">
          <div className="filter-group">
            <label>開始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>結束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-actions">
            <button type="button" className="btn-secondary" onClick={handleSearch}>
              搜尋
            </button>
            <button type="button" className="btn-ghost" onClick={handleReset}>
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 打卡記錄表格 */}
      <div className="records-section">
        {loading ? (
          <p className="loading-message">載入中...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : checkinRecords.length === 0 ? (
          <p className="empty-message">目前沒有打卡記錄</p>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>打卡時間</th>
                    <th>使用者名稱</th>
                    <th>使用者電話</th>
                    <th>獲得福報</th>
                    <th>累積福報</th>
                  </tr>
                </thead>
                <tbody>
                  {checkinRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{formatDateTime(record.timestamp)}</td>
                      <td>{record.user?.name || '-'}</td>
                      <td>{record.user?.phone || '-'}</td>
                      <td>{record.merit_points_earned || 0}</td>
                      <td>{record.user?.merit_points || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  上一頁
                </button>
                <span className="pagination-info">
                  第 {currentPage} / {totalPages} 頁
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一頁
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CheckinRecords;
