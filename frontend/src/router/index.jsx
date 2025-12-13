import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { queryClient } from '../queryClient';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import UserDashboard from '../pages/UserDashboard';
import Shop from '../pages/Shop';
import Temples from '../pages/Temples';
import Rewards from '../pages/Rewards';
import TempleDetail from '../pages/TempleDetail';
import AdminLayout from '../layouts/AdminLayout';
import TempleAdminLayout from '../layouts/TempleAdminLayout';
import RoleGuard from '../components/RoleGuard';


// 廟方管理後台頁面
import TempleAdminDashboard from '../pages/temple-admin/TempleAdminDashboard';
import TempleEdit from '../pages/temple-admin/TempleEdit';
import CheckinRecords from '../pages/temple-admin/CheckinRecords';
import ProductManagement from '../pages/temple-admin/ProductManagement';
import OrderManagement from '../pages/temple-admin/OrderManagement';
import RevenueReport from '../pages/temple-admin/RevenueReport';
import RewardManagement from '../pages/temple-admin/RewardManagement';
import Settings from '../pages/temple-admin/Settings';

// 登入保護
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading">載入中...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 智能儀表板路由（根據角色顯示不同儀表板）
const SmartDashboard = () => {
  const { role, loading } = useAuth();

  if (loading) return <div className="loading">載入中...</div>;

  // 管理員顯示管理員儀表板
  if (role === 'admin') {
    return (
      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    );
  }

  // 一般用戶顯示用戶儀表板
  return (
    <AdminLayout>
      <UserDashboard />
    </AdminLayout>
  );
};


const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<Login />} />
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

    {/* 廟方管理員專用路由（舊版，保留相容性）*/}
    <Route
      path="/temple-admin/rewards"
      element={
        <PrivateRoute>
          <RoleGuard allowRoles={['temple_admin']}>
            <AdminLayout>
              <RewardManagement />
            </AdminLayout>
          </RoleGuard>
        </PrivateRoute>
      }
    />

    {/* 廟方管理後台（新版，使用子路由）*/}
    <Route
      path="/temple-admin/:templeId"
      element={
        <PrivateRoute>
          <RoleGuard allowRoles={['temple_admin']}>
            <TempleAdminLayout />
          </RoleGuard>
        </PrivateRoute>
      }
    >
      <Route path="dashboard" element={<TempleAdminDashboard />} />
      <Route path="temple/edit" element={<TempleEdit />} />
      <Route path="checkins" element={<CheckinRecords />} />
      <Route path="products" element={<ProductManagement />} />
      <Route path="orders" element={<OrderManagement />} />
      <Route path="revenue" element={<RevenueReport />} />
      <Route path="rewards" element={<RewardManagement />} />
      <Route path="settings" element={<Settings />} />
      {/* 預設導向儀表板 */}
      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>

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
