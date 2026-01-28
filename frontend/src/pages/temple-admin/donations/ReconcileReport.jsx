/**
 * ReconcileReport - 對帳報表
 *
 * 產生金流對帳報表，比對系統記錄與金流商資料
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Donations.css';

// Mock 對帳報表資料
const mockReconcileData = {
  period: {
    startDate: '2025-01-01',
    endDate: '2025-01-29',
  },
  summary: {
    systemTotal: 356000,
    systemCount: 45,
    gatewayTotal: 355000,
    gatewayCount: 44,
    matchedTotal: 340000,
    matchedCount: 42,
    unmatchedTotal: 16000,
    unmatchedCount: 3,
    pendingTotal: 35000,
    pendingCount: 3,
    feeTotal: 5340,
    netTotal: 349660,
  },
  // 依日期彙總
  dailySummary: [
    { date: '2025-01-29', count: 2, amount: 15000, matched: 2, unmatched: 0 },
    { date: '2025-01-28', count: 3, amount: 23000, matched: 2, unmatched: 1 },
    { date: '2025-01-27', count: 4, amount: 18000, matched: 4, unmatched: 0 },
    { date: '2025-01-26', count: 5, amount: 55000, matched: 4, unmatched: 1 },
    { date: '2025-01-25', count: 3, amount: 12000, matched: 3, unmatched: 0 },
    { date: '2025-01-24', count: 6, amount: 45000, matched: 6, unmatched: 0 },
    { date: '2025-01-23', count: 4, amount: 28000, matched: 4, unmatched: 0 },
  ],
  // 異常項目
  unmatchedItems: [
    {
      id: 5,
      merchantOrderNo: 'DON20250127001',
      systemAmount: 1000,
      gatewayAmount: null,
      donorName: '張美華',
      reason: '金流商無此筆交易記錄',
      createdAt: '2025-01-27T10:55:00',
    },
    {
      id: 4,
      merchantOrderNo: 'DON20250128002',
      systemAmount: 20000,
      gatewayAmount: null,
      donorName: '王志明',
      reason: '待付款，尚未收到金流通知',
      createdAt: '2025-01-28T14:30:00',
    },
    {
      id: 8,
      merchantOrderNo: 'DON20250126003',
      systemAmount: 5000,
      gatewayAmount: 4500,
      donorName: '黃小芳',
      reason: '金額不符：系統 $5,000 / 金流 $4,500',
      createdAt: '2025-01-26T11:20:00',
    },
  ],
  // 依付款方式統計
  paymentMethodStats: [
    { method: '信用卡', count: 32, amount: 280000, fee: 4200 },
    { method: 'ATM 轉帳', count: 8, amount: 56000, fee: 840 },
    { method: '銀行匯款', count: 5, amount: 20000, fee: 300 },
  ],
  // 依用途統計
  purposeStats: [
    { purpose: '一般捐款', count: 20, amount: 120000 },
    { purpose: '建廟基金', count: 12, amount: 180000 },
    { purpose: '慈善救濟', count: 8, amount: 36000 },
    { purpose: '點燈功德', count: 5, amount: 20000 },
  ],
};

const ReconcileReport = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 日期範圍
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // 載入資料
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setData(mockReconcileData);
      } catch (err) {
        console.error('載入失敗:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [templeId, dateRange]);

  // 格式化金額
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('zh-TW').format(amount);
  };

  // 產生報表
  const handleGenerateReport = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('報表已產生');
    }, 1000);
  };

  // 匯出 Excel
  const handleExportExcel = () => {
    alert('匯出 Excel 功能開發中...');
  };

  // 匯出 PDF
  const handleExportPdf = () => {
    alert('匯出 PDF 功能開發中...');
  };

  // 返回
  const handleBack = () => navigate(`/temple-admin/${templeId}/donations`);

  // 查看異常詳情
  const handleViewUnmatched = (id) => {
    navigate(`/temple-admin/${templeId}/donations/${id}`);
  };

  if (loading) {
    return (
      <div className="donations-container">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>正在產生對帳報表...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="donations-container">
      {/* 頁面標題 */}
      <div className="donations-header">
        <div className="header-left">
          <button className="btn-back" onClick={handleBack}>
            ← 返回
          </button>
          <h2>對帳報表</h2>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleExportExcel}>
            📊 匯出 Excel
          </button>
          <button className="btn-secondary" onClick={handleExportPdf}>
            📄 匯出 PDF
          </button>
        </div>
      </div>

      {/* 日期選擇 */}
      <div className="reconcile-date-picker">
        <div className="date-inputs">
          <div className="date-input-group">
            <label>開始日期</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <span className="date-separator">至</span>
          <div className="date-input-group">
            <label>結束日期</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <button className="btn-primary" onClick={handleGenerateReport}>
            產生報表
          </button>
        </div>
        <div className="quick-dates">
          <button onClick={() => {
            const today = new Date();
            setDateRange({
              startDate: today.toISOString().split('T')[0],
              endDate: today.toISOString().split('T')[0],
            });
          }}>今日</button>
          <button onClick={() => {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            setDateRange({
              startDate: weekAgo.toISOString().split('T')[0],
              endDate: today.toISOString().split('T')[0],
            });
          }}>近 7 天</button>
          <button onClick={() => {
            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            setDateRange({
              startDate: monthStart.toISOString().split('T')[0],
              endDate: today.toISOString().split('T')[0],
            });
          }}>本月</button>
          <button onClick={() => {
            const today = new Date();
            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            setDateRange({
              startDate: lastMonthStart.toISOString().split('T')[0],
              endDate: lastMonthEnd.toISOString().split('T')[0],
            });
          }}>上月</button>
        </div>
      </div>

      {data && (
        <>
          {/* 對帳摘要 */}
          <div className="reconcile-summary">
            <h3>對帳摘要</h3>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-label">系統記錄</div>
                <div className="summary-value">{data.summary.systemCount} 筆</div>
                <div className="summary-amount">${formatAmount(data.summary.systemTotal)}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">金流商記錄</div>
                <div className="summary-value">{data.summary.gatewayCount} 筆</div>
                <div className="summary-amount">${formatAmount(data.summary.gatewayTotal)}</div>
              </div>
              <div className="summary-card success">
                <div className="summary-label">已核對</div>
                <div className="summary-value">{data.summary.matchedCount} 筆</div>
                <div className="summary-amount">${formatAmount(data.summary.matchedTotal)}</div>
              </div>
              <div className="summary-card warning">
                <div className="summary-label">待處理</div>
                <div className="summary-value">{data.summary.pendingCount} 筆</div>
                <div className="summary-amount">${formatAmount(data.summary.pendingTotal)}</div>
              </div>
              <div className="summary-card danger">
                <div className="summary-label">異常</div>
                <div className="summary-value">{data.summary.unmatchedCount} 筆</div>
                <div className="summary-amount">${formatAmount(data.summary.unmatchedTotal)}</div>
              </div>
              <div className="summary-card info">
                <div className="summary-label">手續費</div>
                <div className="summary-value">-</div>
                <div className="summary-amount">-${formatAmount(data.summary.feeTotal)}</div>
              </div>
            </div>

            <div className="net-total">
              <span>實收淨額：</span>
              <span className="net-amount">${formatAmount(data.summary.netTotal)}</span>
            </div>
          </div>

          {/* 異常項目 */}
          {data.unmatchedItems.length > 0 && (
            <div className="reconcile-section">
              <h3>⚠️ 異常項目 ({data.unmatchedItems.length})</h3>
              <div className="unmatched-table-wrapper">
                <table className="unmatched-table">
                  <thead>
                    <tr>
                      <th>訂單編號</th>
                      <th>捐款人</th>
                      <th>系統金額</th>
                      <th>金流金額</th>
                      <th>異常原因</th>
                      <th>建立時間</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.unmatchedItems.map(item => (
                      <tr key={item.id}>
                        <td className="mono">{item.merchantOrderNo}</td>
                        <td>{item.donorName}</td>
                        <td>${formatAmount(item.systemAmount)}</td>
                        <td>
                          {item.gatewayAmount !== null
                            ? `$${formatAmount(item.gatewayAmount)}`
                            : <span className="text-muted">-</span>
                          }
                        </td>
                        <td className="reason">{item.reason}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString('zh-TW')}</td>
                        <td>
                          <button
                            className="btn-link"
                            onClick={() => handleViewUnmatched(item.id)}
                          >
                            處理
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 每日彙總 */}
          <div className="reconcile-section">
            <h3>每日彙總</h3>
            <div className="daily-table-wrapper">
              <table className="daily-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>筆數</th>
                    <th>金額</th>
                    <th>已核對</th>
                    <th>異常</th>
                    <th>核對率</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailySummary.map(day => (
                    <tr key={day.date}>
                      <td>{day.date}</td>
                      <td>{day.count} 筆</td>
                      <td>${formatAmount(day.amount)}</td>
                      <td className="text-success">{day.matched} 筆</td>
                      <td className={day.unmatched > 0 ? 'text-danger' : ''}>
                        {day.unmatched} 筆
                      </td>
                      <td>
                        <div className="progress-bar-mini">
                          <div
                            className="progress-fill"
                            style={{ width: `${(day.matched / day.count) * 100}%` }}
                          />
                        </div>
                        <span>{Math.round((day.matched / day.count) * 100)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 統計分析 */}
          <div className="reconcile-stats-grid">
            {/* 付款方式統計 */}
            <div className="reconcile-section">
              <h3>付款方式統計</h3>
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>付款方式</th>
                    <th>筆數</th>
                    <th>金額</th>
                    <th>手續費</th>
                  </tr>
                </thead>
                <tbody>
                  {data.paymentMethodStats.map(stat => (
                    <tr key={stat.method}>
                      <td>{stat.method}</td>
                      <td>{stat.count} 筆</td>
                      <td>${formatAmount(stat.amount)}</td>
                      <td className="text-muted">-${formatAmount(stat.fee)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 捐款用途統計 */}
            <div className="reconcile-section">
              <h3>捐款用途統計</h3>
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>用途</th>
                    <th>筆數</th>
                    <th>金額</th>
                    <th>佔比</th>
                  </tr>
                </thead>
                <tbody>
                  {data.purposeStats.map(stat => (
                    <tr key={stat.purpose}>
                      <td>{stat.purpose}</td>
                      <td>{stat.count} 筆</td>
                      <td>${formatAmount(stat.amount)}</td>
                      <td>
                        {Math.round((stat.amount / data.summary.systemTotal) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReconcileReport;
