import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockDashboardStats } from '../../mocks/templeAdminMockData';
import './TempleAdminDashboard.css';

const USE_MOCK = true; // 設為 false 使用真實 API

const TempleAdminDashboard = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  // 統計資料狀態
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  // 載入狀態
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 載入所有資料
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (USE_MOCK) {
          // 使用 Mock 資料
          await new Promise(resolve => setTimeout(resolve, 300)); // 模擬延遲
          setDashboardStats(mockDashboardStats);
          setRecentOrders(mockDashboardStats.recentOrders);
          setTopProducts(mockDashboardStats.topProducts);
          setLowStockAlerts(mockDashboardStats.lowStockAlerts);
        } else {
          // 使用真實 API
          const templeAdminApi = await import('../../services/templeAdminApi').then(m => m.default);
          const statsRes = await templeAdminApi.temples.getStats(templeId);
          if (statsRes.data) {
            const data = statsRes.data.data || statsRes.data;
            setDashboardStats(data);
          }
        }
      } catch (err) {
        console.error('載入儀表板資料失敗:', err);
        setError('載入資料失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    if (templeId) {
      fetchAllData();
    }
  }, [templeId, role]);

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

  // 訂單狀態顯示
  const getStatusText = (status) => {
    const statusMap = {
      pending: '待處理',
      processing: '處理中',
      shipped: '已出貨',
      completed: '已完成',
      cancelled: '已取消',
    };
    return statusMap[status] || status;
  };

  // 訂單狀態樣式
  const getStatusClass = (status) => {
    const classMap = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    };
    return classMap[status] || '';
  };

  // 載入中
  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>載入中...</p>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="temple-admin-dashboard">
      <h1 className="dashboard-title">廟方儀表板</h1>

      {/* 統計卡片區 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats?.today?.checkins || 0}</div>
            <div className="stat-label">今日打卡數</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats?.today?.orders || 0}</div>
            <div className="stat-label">今日訂單數</div>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats?.today?.revenue || 0}</div>
            <div className="stat-label">今日收入（功德點）</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats?.today?.newUsers || 0}</div>
            <div className="stat-label">今日新信眾</div>
          </div>
        </div>
      </div>

      {/* 月統計摘要 */}
      <div className="summary-section">
        <h2 className="section-title">本月統計</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">打卡次數</span>
            <span className="summary-value">{dashboardStats?.month?.checkins || 0}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">訂單數量</span>
            <span className="summary-value">{dashboardStats?.month?.orders || 0}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">收入總計</span>
            <span className="summary-value">{dashboardStats?.month?.revenue || 0}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">新增信眾</span>
            <span className="summary-value">{dashboardStats?.month?.newUsers || 0}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* 最近訂單 */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">最近訂單</h2>
            <button
              className="btn-link"
              onClick={() => navigate(`/temple-admin/${templeId}/orders`)}
            >
              查看全部
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="empty-message">目前沒有訂單</p>
          ) : (
            <div className="table-container">
              <table className="data-table compact">
                <thead>
                  <tr>
                    <th>訂單編號</th>
                    <th>信眾</th>
                    <th>商品</th>
                    <th>功德點</th>
                    <th>狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.user_name}</td>
                      <td>{order.product_name}</td>
                      <td>{order.merit_points_used}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 熱銷商品 */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">熱銷商品 Top 5</h2>
            <button
              className="btn-link"
              onClick={() => navigate(`/temple-admin/${templeId}/products`)}
            >
              管理商品
            </button>
          </div>
          {topProducts.length === 0 ? (
            <p className="empty-message">目前沒有銷售資料</p>
          ) : (
            <div className="top-products-list">
              {topProducts.map((product, index) => (
                <div key={product.id} className="product-item">
                  <span className="product-rank">#{index + 1}</span>
                  <span className="product-name">{product.name}</span>
                  <span className="product-sold">{product.sold_count} 件</span>
                  <span className="product-revenue">{product.revenue} 點</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 庫存警告 */}
      {lowStockAlerts.length > 0 && (
        <div className="alert-section">
          <h2 className="section-title alert-title">庫存警告</h2>
          <div className="alert-list">
            {lowStockAlerts.map((item) => (
              <div key={item.id} className="alert-item">
                <span className="alert-icon">⚠️</span>
                <span className="alert-message">
                  「{item.name}」庫存不足：目前 {item.stock_quantity} 件，低於警告值 {item.low_stock_threshold} 件
                </span>
                <button
                  className="btn-sm"
                  onClick={() => navigate(`/temple-admin/${templeId}/products`)}
                >
                  補貨
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快速操作 */}
      <div className="quick-actions">
        <h2 className="section-title">快速操作</h2>
        <div className="actions-grid">
          <button
            className="action-card"
            onClick={() => navigate(`/temple-admin/${templeId}/products`)}
          >
            <span className="action-icon">🛍️</span>
            <span className="action-label">商品管理</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate(`/temple-admin/${templeId}/orders`)}
          >
            <span className="action-icon">📦</span>
            <span className="action-label">訂單管理</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate(`/temple-admin/${templeId}/events`)}
          >
            <span className="action-icon">📅</span>
            <span className="action-label">活動報名</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate(`/temple-admin/${templeId}/lamps`)}
          >
            <span className="action-icon">🏮</span>
            <span className="action-label">點燈管理</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate(`/temple-admin/${templeId}/checkins`)}
          >
            <span className="action-icon">📍</span>
            <span className="action-label">打卡紀錄</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate(`/temple-admin/${templeId}/devotees`)}
          >
            <span className="action-icon">👥</span>
            <span className="action-label">信眾管理</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate(`/temple-admin/${templeId}/revenue`)}
          >
            <span className="action-icon">📊</span>
            <span className="action-label">收入報表</span>
          </button>
          <button
            className="action-card"
            onClick={() => navigate(`/temple-admin/${templeId}/settings`)}
          >
            <span className="action-icon">⚙️</span>
            <span className="action-label">系統設定</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TempleAdminDashboard;
