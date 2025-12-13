import { NavLink } from 'react-router-dom';
import './AdminLayout.css';
import { useAuth } from '../context/AuthContext';

// 依角色顯示導覽項目
const navItems = [
  { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'temple_admin'] },
  { to: '/temples', label: '廟宇管理', roles: ['admin', 'temple_admin'] },
  { to: '/rewards', label: '獎勵規則', roles: ['admin', 'temple_admin'] },
  // 廟方管理員專用
  { to: '/temple-admin/rewards', label: '我的獎勵規則', roles: ['temple_admin'] },
  // Super Admin 專用
  { to: '/admin', label: '總管總覽', roles: ['admin'] },
  { to: '/admin/users', label: '使用者管理', roles: ['admin'] },
  { to: '/admin/temples', label: '廟宇管理 (全域)', roles: ['admin'] },
  { to: '/admin/temples/create', label: '新增廟宇帳號', roles: ['admin'] },
  { to: '/admin/amulets', label: '平安符管理', roles: ['admin'] },
  { to: '/admin/checkins', label: '簽到管理', roles: ['admin'] },
  { to: '/admin/products', label: '商品管理', roles: ['admin'] },
  { to: '/admin/stats', label: '系統統計', roles: ['admin'] },
];

const AdminLayout = ({ children }) => {
  const { user, role, logout } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">後台管理</div>
        <nav className="sidebar-nav">
          {navItems
            .filter((item) => !item.roles || item.roles.includes(role))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="header-title">廟方後台</div>
          <div className="header-actions">
            <span className="user-name">{user?.name || '管理員'}</span>
            <button type="button" className="btn-ghost" onClick={logout}>
              登出
            </button>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
