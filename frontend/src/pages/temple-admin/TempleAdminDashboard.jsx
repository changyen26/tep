import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import templeAdminApi from '../../services/templeAdminApi';
import './TempleAdminDashboard.css';

const TempleAdminDashboard = () => {
  const { templeId } = useParams();
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

        // admin 不調用 API
        if (role === 'admin') {
          setLoading(false);
          return;
        }

        // temple_admin 正常調用 API
        const statsRes = await templeAdminApi.temples.getStats(templeId);

        if (statsRes.data) {
          const data = statsRes.data.data || statsRes.data;
          setDashboardStats(data);
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

  // admin 角色顯示提示
  if (role === 'admin') {
    return (
      <div className="temple-admin-dashboard">
        <h1 className="dashboard-title">廟方儀表板</h1>
        <div className="admin-notice">
          <div className="notice-icon">ℹ️</div>
          <div className="notice-content">
            <h3>系統管理員無法檢視廟方即時統計資料</h3>
            <p>若需查看統計報表，請使用廟方管理員帳號登入。</p>
          </div>
        </div>
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
          <div className="stat-label">本月打卡數</div>
          <div className="stat-value">
            {dashboardStats?.month?.checkins || 0}
          </div>
        </div>
      </div>

      {/* 無資料提示 */}
      {!dashboardStats && (
        <div className="dashboard-section">
          <p className="empty-message">目前沒有統計資料</p>
        </div>
      )}
    </div>
  );
};

export default TempleAdminDashboard;
