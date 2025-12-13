import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { templeStatsAPI } from '../../api/templeStats';
import './TempleAdminDashboard.css';

const TempleAdminDashboard = () => {
  const { templeId } = useParams();

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

        // 並行呼叫所有 API
        const [statsRes, ordersRes, productsRes, alertsRes] = await Promise.all([
          templeStatsAPI.dashboard(templeId),
          templeStatsAPI.recentOrders(templeId, 5),
          templeStatsAPI.topProducts(templeId, 3, 'today'),
          templeStatsAPI.lowStockAlerts(templeId),
        ]);

        // 設定資料
        if (statsRes.success) {
          setDashboardStats(statsRes.data);
        }

        if (ordersRes.success) {
          setRecentOrders(ordersRes.data.orders || []);
        }

        if (productsRes.success) {
          setTopProducts(productsRes.data.top_products || []);
        }

        if (alertsRes.success) {
          setLowStockAlerts(alertsRes.data.alerts || []);
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
  }, [templeId]);

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
          <div className="stat-label">今日打卡數</div>
          <div className="stat-value">
            {dashboardStats?.today?.checkins || 0}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">今日訂單數</div>
          <div className="stat-value">
            {dashboardStats?.today?.orders || 0}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">今日收入</div>
          <div className="stat-value">
            {dashboardStats?.today?.revenue || 0}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">熱銷商品數量</div>
          <div className="stat-value">
            {topProducts.length}
          </div>
        </div>
      </div>

      {/* 最新訂單區塊 */}
      <div className="dashboard-section">
        <h2 className="section-title">最新訂單</h2>
        <div className="table-container">
          {recentOrders.length === 0 ? (
            <p className="empty-message">目前沒有訂單</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>商品名稱</th>
                  <th>使用者姓名</th>
                  <th>功德點數</th>
                  <th>訂單狀態</th>
                  <th>建立時間</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.product_name || '-'}</td>
                    <td>{order.user_name || order.recipient_name || '-'}</td>
                    <td>{order.merit_points_used || 0}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>{formatDateTime(order.redeemed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 底部兩欄佈局 */}
      <div className="dashboard-bottom-grid">
        {/* 熱銷商品 Top 3 */}
        <div className="dashboard-section">
          <h2 className="section-title">熱銷商品 Top 3</h2>
          {topProducts.length === 0 ? (
            <p className="empty-message">目前沒有資料</p>
          ) : (
            <div className="product-list">
              {topProducts.map((product, index) => (
                <div key={product.product_id} className="product-item">
                  <div className="product-rank">#{index + 1}</div>
                  <div className="product-info">
                    <div className="product-name">{product.product_name}</div>
                    <div className="product-stats">
                      銷售數量：{product.total_sold} 件
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 庫存警告 */}
        <div className="dashboard-section">
          <h2 className="section-title">庫存警告商品</h2>
          {lowStockAlerts.length === 0 ? (
            <p className="empty-message">目前沒有資料</p>
          ) : (
            <div className="alert-list">
              {lowStockAlerts.map((alert) => (
                <div key={alert.product_id} className="alert-item">
                  <div className="alert-info">
                    <div className="alert-product-name">{alert.product_name}</div>
                    <div className="alert-stock">
                      庫存數量：{alert.stock_quantity} / 警告閾值：
                      {alert.low_stock_threshold}
                    </div>
                  </div>
                  <div className={`alert-badge ${alert.status}`}>
                    {alert.status === 'out_of_stock' ? '已售罄' : '庫存不足'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TempleAdminDashboard;
