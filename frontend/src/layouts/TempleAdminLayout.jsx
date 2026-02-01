import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './TempleAdminLayout.css';
import { useAuth } from '../context/AuthContext';

// 開發模式：使用 Mock 資料
const USE_MOCK = true;

// Mock 廟宇資料
const mockTempleInfo = {
  id: 1,
  name: '三官寶殿',
  address: '台南市白河區昇安里三間厝31號',
};

const TempleAdminLayout = () => {
  const { templeId } = useParams();
  const { user, logout } = useAuth();

  // 廟宇資料狀態
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 載入廟宇資料（帶快取）
  useEffect(() => {
    const fetchTemple = async () => {
      try {
        setLoading(true);
        setError(null);

        if (USE_MOCK) {
          // 使用 Mock 資料
          await new Promise(resolve => setTimeout(resolve, 200));
          setTemple(mockTempleInfo);
          setLoading(false);
          return;
        }

        // 嘗試從快取讀取
        const cacheKey = `temple_${templeId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const cachedData = JSON.parse(cached);
            const cacheTime = cachedData.timestamp || 0;
            const now = Date.now();
            // 快取有效期 5 分鐘
            if (now - cacheTime < 5 * 60 * 1000) {
              setTemple(cachedData.data);
              setLoading(false);
              return;
            }
          } catch (e) {
            // 快取解析失敗，繼續從 API 取得
            console.warn('快取解析失敗:', e);
          }
        }

        // 從 API 取得資料
        const templeAdminApi = await import('../services/templeAdminApi').then(m => m.default);
        const response = await templeAdminApi.temples.getTemple(templeId);

        if (response.data) {
          const templeData = response.data.data || response.data;
          setTemple(templeData);

          // 儲存到快取
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: templeData,
              timestamp: Date.now(),
            })
          );
        } else {
          setError('無法取得廟宇資訊');
        }
      } catch (err) {
        console.error('取得廟宇資料失敗:', err);
        setError(err.message || '無法取得廟宇資訊');
      } finally {
        setLoading(false);
      }
    };

    if (templeId) {
      fetchTemple();
    }
  }, [templeId]);

  // 側邊選單項目 - 廟方管理專用（與 templeAdminRoutes 對齊）
  const navItems = [
    { path: 'dashboard', label: '儀表板', icon: '📊' },
    { path: 'business', label: '經營診斷', icon: '🏢' },
    { path: 'analytics', label: '數據分析', icon: '📈' },
    { path: 'website', label: '官網設定', icon: '🌐' },
    { path: 'events', label: '活動報名管理', icon: '📅' },
    { path: 'pilgrimage-visits', label: '進香登記管理', icon: '🚌' },
    { path: 'lamps', label: '點燈管理', icon: '🏮' },
    { path: 'products', label: '商品管理', icon: '🛍️' },
    { path: 'orders', label: '訂單管理', icon: '📦' },
    { path: 'checkins', label: '打卡紀錄', icon: '📍' },
    { path: 'revenue', label: '收入報表', icon: '💰' },
    { path: 'donations', label: '捐款管理', icon: '💝' },
    { path: 'devotees', label: '信眾管理', icon: '👥' },
    { path: 'notifications', label: '推播通知', icon: '📢' },
    { path: 'certificates', label: '感謝狀管理', icon: '📜' },
    { path: 'staff', label: '帳號管理', icon: '👤' },
    { path: 'temple-settings', label: '廟宇設定', icon: '⚙️' },
  ];

  // 決定 Header 顯示的標題
  const getHeaderTitle = () => {
    if (loading) return '載入中...';
    if (error) return '無法取得廟宇資訊';
    if (temple && temple.name) return temple.name;
    return '廟宇管理';
  };

  return (
    <div className="temple-admin-layout">
      <aside className="temple-admin-sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🏛️</span>
          <span className="brand-text">廟方管理後台</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={`/temple-admin/${templeId}/${item.path}`}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="temple-admin-main">
        <header className="temple-admin-header">
          <div className="header-info">
            <div className="header-title">{getHeaderTitle()}</div>
            <div className="header-meta">
              <span className="temple-id">廟宇 ID: {templeId}</span>
              <span className="user-role">
                角色: {user?.role === 'admin' ? '系統管理員' : '廟方管理員'}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <span className="user-name">{user?.name || '管理員'}</span>
            <NavLink
              to={`/temple-admin/${templeId}/change-password`}
              className="btn-ghost"
            >
              修改密碼
            </NavLink>
            <button type="button" className="btn-ghost" onClick={logout}>
              登出
            </button>
          </div>
        </header>
        <main className="temple-admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TempleAdminLayout;
