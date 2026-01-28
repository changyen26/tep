import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generateRevenueReport } from '../../mocks/templeAdminMockData';
import './RevenueReport.css';

const USE_MOCK = true; // 設為 false 使用真實 API

const RevenueReport = () => {
  const { templeId } = useParams();

  // 日期範圍（預設最近 30 天）
  const getDefaultDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDates());
  const [groupBy, setGroupBy] = useState('day');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState(null);

  // 載入收入報表
  const loadRevenueReport = async () => {
    if (!templeId) return;

    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // 使用 Mock 資料
        await new Promise(resolve => setTimeout(resolve, 300));
        const report = generateRevenueReport(dateRange.start, dateRange.end, groupBy);
        setRevenueData(report);
      } else {
        const templeAdminApi = await import('../../services/templeAdminApi').then(m => m.default);
        const response = await templeAdminApi.revenue.getReport(templeId, {
          start_date: dateRange.start,
          end_date: dateRange.end,
          group_by: groupBy,
        });

        if (response.success) {
          setRevenueData(response.data);
        }
      }
    } catch (err) {
      console.error('載入收入報表失敗:', err);
      setError('載入資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 當日期範圍或分組方式改變時重新載入
  useEffect(() => {
    loadRevenueReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templeId, dateRange, groupBy]);

  // 匯出 CSV
  const exportToCSV = () => {
    if (!revenueData) return;

    const rows = [
      ['廟方收入報表'],
      ['時間範圍', `${revenueData.period.start_date} ~ ${revenueData.period.end_date}`],
      ['分組方式', groupBy === 'day' ? '日' : groupBy === 'week' ? '週' : '月'],
      [],
      ['總收入', revenueData.summary.total_revenue],
      ['總訂單數', revenueData.summary.total_orders],
      ['平均訂單金額', revenueData.summary.average_order_value],
      [],
      ['時段', '收入', '訂單數'],
      ...revenueData.trend.map((item) => [item.period, item.revenue, item.order_count]),
      [],
      ['商品名稱', '銷售數量', '單價', '總收入', '貢獻度 (%)'],
      ...revenueData.product_sales.map((item) => [
        item.product_name,
        item.total_quantity,
        item.unit_price,
        item.total_revenue,
        item.revenue_percentage,
      ]),
    ];

    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `收入報表_${dateRange.start}_${dateRange.end}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="revenue-report">
        <div className="loading-message">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="revenue-report">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="revenue-report">
      {/* 頁面標題 */}
      <div className="page-header">
        <h1 className="page-title">收入報表</h1>
      </div>

      {/* 篩選區塊 */}
      <div className="filter-section">
        <div className="filter-form">
          <div className="filter-group">
            <label>開始日期</label>
            <input
              type="date"
              className="filter-input"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>結束日期</label>
            <input
              type="date"
              className="filter-input"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>分組方式</label>
            <select
              className="filter-select"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="day">日</option>
              <option value="week">週</option>
              <option value="month">月</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn-primary" onClick={exportToCSV} disabled={!revenueData}>
              匯出 CSV
            </button>
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      {revenueData && (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-label">總收入</div>
              <div className="stat-value">{revenueData.summary.total_revenue}</div>
              <div className="stat-hint">功德點數</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">總訂單數</div>
              <div className="stat-value">{revenueData.summary.total_orders}</div>
              <div className="stat-hint">筆</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">平均訂單金額</div>
              <div className="stat-value">{revenueData.summary.average_order_value}</div>
              <div className="stat-hint">點數/筆</div>
            </div>
          </div>

          {/* 收入趨勢 */}
          <div className="section">
            <h2 className="section-title">收入趨勢</h2>
            <div className="table-container">
              {revenueData.trend.length === 0 ? (
                <p className="empty-message">此時段無資料</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>時段</th>
                      <th>收入</th>
                      <th>訂單數</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.trend.map((item, index) => (
                      <tr key={index}>
                        <td>{item.period}</td>
                        <td>{item.revenue}</td>
                        <td>{item.order_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 商品銷售排行 */}
          <div className="section">
            <h2 className="section-title">商品銷售排行 Top 10</h2>
            <div className="table-container">
              {revenueData.product_sales.length === 0 ? (
                <p className="empty-message">此時段無商品銷售資料</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>商品名稱</th>
                      <th>銷售數量</th>
                      <th>單價</th>
                      <th>總收入</th>
                      <th>貢獻度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.product_sales.map((item) => (
                      <tr key={item.product_id}>
                        <td>{item.product_name}</td>
                        <td>{item.total_quantity}</td>
                        <td>{item.unit_price}</td>
                        <td>{item.total_revenue}</td>
                        <td>{item.revenue_percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueReport;
