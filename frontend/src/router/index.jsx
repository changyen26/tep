import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { queryClient } from '../queryClient';
import Login from '../pages/Login';
import TempleAdminLogin from '../pages/TempleAdminLogin';
import Register from '../pages/Register';
import Shop from '../pages/Shop';
import Temples from '../pages/Temples';
import Rewards from '../pages/Rewards';
import TempleDetail from '../pages/TempleDetail';
import AdminLayout from '../layouts/AdminLayout';
import RoleGuard from '../components/RoleGuard';
import templeAdminRoutes from '../routes/templeAdminRoutes';

// 登入保護
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading">載入中...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 智能儀表板路由（根據角色導向不同頁面）
const SmartDashboard = () => {
  const { role, user, loading } = useAuth();

  if (loading) return <div className="loading">載入中...</div>;

  // admin → 導向 system-admin-web
  if (role === 'admin') {
    const systemAdminUrl = import.meta.env.VITE_SYSTEM_ADMIN_URL || 'http://localhost:5174';
    window.location.href = systemAdminUrl;
    return <div className="loading">導向系統管理後台...</div>;
  }

  // temple_admin → 導向廟方管理後台
  if (role === 'temple_admin' && user?.temple_id) {
    return <Navigate to={`/temple-admin/${user.temple_id}/dashboard`} replace />;
  }

  // 其他角色 → 顯示提示
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>歡迎</h2>
        <p>您的角色：{role || '未知'}</p>
        <p>請聯繫管理員設定您的權限</p>
      </div>
    </div>
  );
};


const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/temple-admin/login" element={<TempleAdminLogin />} />
    <Route path="/register" element={<Register />} />

    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <SmartDashboard />
        </PrivateRoute>
      }
    />
    <Route
      path="/temples"
      element={
        <PrivateRoute>
          <RoleGuard allowRoles={['admin', 'temple_admin']}>
            <AdminLayout>
              <Temples />
            </AdminLayout>
          </RoleGuard>
        </PrivateRoute>
      }
    />
    <Route
      path="/temples/:id"
      element={
        <PrivateRoute>
          <RoleGuard allowRoles={['admin', 'temple_admin']}>
            <AdminLayout>
              <TempleDetail />
            </AdminLayout>
          </RoleGuard>
        </PrivateRoute>
      }
    />
    <Route
      path="/rewards"
      element={
        <PrivateRoute>
          <RoleGuard allowRoles={['admin', 'temple_admin']}>
            <AdminLayout>
              <Rewards />
            </AdminLayout>
          </RoleGuard>
        </PrivateRoute>
      }
    />
    <Route
      path="/shop"
      element={
        <PrivateRoute>
          <Shop />
        </PrivateRoute>
      }
    />

    {/* 廟方管理後台 - 使用集中式路由配置 */}
    {templeAdminRoutes}

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const RouterRoot = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default RouterRoot;
