import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './TempleAdminLayout.css';
import { useAuth } from '../context/AuthContext';
import templeAdminApi from '../services/templeAdminApi';

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
    { path: 'dashboard', label: '儀表板' },
    { path: 'events', label: '活動報名管理' },
    { path: 'lamps', label: '點燈管理' },
    { path: 'products', label: '商品管理' },
    { path: 'orders', label: '訂單管理' },
    { path: 'checkins', label: '打卡紀錄' },
    { path: 'revenue', label: '收入報表' },
    { path: 'devotees', label: '信眾管理' },
    { path: 'temple/edit', label: '廟宇設定' },
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
        <div className="sidebar-brand">廟方管理後台</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={`/temple-admin/${templeId}/${item.path}`}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              onClick={() => console.log('Navigating to:', item.path)}
            >
              {item.label}
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
