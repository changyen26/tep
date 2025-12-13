import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './TempleAdminLayout.css';
import { useAuth } from '../context/AuthContext';
import { getTempleById } from '../api/temple';

const TempleAdminLayout = () => {
  const { templeId } = useParams();
  const { user, logout } = useAuth();

  // 廟宇資料狀態
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 載入廟宇資料
  useEffect(() => {
    const fetchTemple = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getTempleById(templeId);

        // 根據後端 API 回應結構取得廟宇資料
        if (response.success && response.data) {
          setTemple(response.data);
        } else {
          setError('無法取得廟宇資訊');
        }
      } catch (err) {
        console.error('取得廟宇資料失敗:', err);
        setError('無法取得廟宇資訊');
      } finally {
        setLoading(false);
      }
    };

    if (templeId) {
      fetchTemple();
    }
  }, [templeId]);

  // 側邊選單項目（純文字，無 icon）
  const navItems = [
    { path: 'dashboard', label: '儀表板' },
    { path: 'temple/edit', label: '廟宇資訊' },
    { path: 'checkins', label: '打卡紀錄' },
    { path: 'products', label: '商品管理' },
    { path: 'orders', label: '訂單管理' },
    { path: 'revenue', label: '收入報表' },
    { path: 'rewards', label: '獎勵規則' },
    { path: 'settings', label: '系統設定' },
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
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="temple-admin-main">
        <header className="temple-admin-header">
          <div className="header-title">{getHeaderTitle()}</div>
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
