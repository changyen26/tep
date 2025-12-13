/**
 * 路由配置
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// 認證頁面
import LoginPage from '../pages/auth/LoginPage';

// 儀表板
import DashboardPage from '../pages/dashboard/DashboardPage';

// 使用者管理
import UserListPage from '../pages/users/UserListPage';
import UserDetailPage from '../pages/users/UserDetailPage';

// 廟宇管理
import TempleListPage from '../pages/temples/TempleListPage';
import TempleDetailPage from '../pages/temples/TempleDetailPage';
import TempleApplicationListPage from '../pages/temples/TempleApplicationListPage';
import TempleApplicationDetailPage from '../pages/temples/TempleApplicationDetailPage';

// 商品管理
import ProductListPage from '../pages/products/ProductListPage';
import ProductDetailPage from '../pages/products/ProductDetailPage';

// 兌換管理
import RedemptionListPage from '../pages/redemptions/RedemptionListPage';
import RedemptionDetailPage from '../pages/redemptions/RedemptionDetailPage';

// 平安符管理
import { AmuletListPage } from '../pages/amulets';

// 打卡記錄管理
import { CheckinListPage } from '../pages/checkins';

// 數據分析
import AnalyticsPage from '../pages/analytics/AnalyticsPage';

// 系統設定
import SettingsPage from '../pages/settings/SettingsPage';

// 檢舉管理
import ReportListPage from '../pages/reports/ReportListPage';
import ReportDetailPage from '../pages/reports/ReportDetailPage';

// 系統日誌
import LogListPage from '../pages/logs/LogListPage';

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'users',
        children: [
          {
            index: true,
            element: <UserListPage />,
          },
          {
            path: ':id',
            element: <UserDetailPage />,
          },
        ],
      },
      {
        path: 'temples',
        children: [
          {
            index: true,
            element: <TempleListPage />,
          },
          {
            path: ':id',
            element: <TempleDetailPage />,
          },
          {
            path: 'applications',
            children: [
              {
                index: true,
                element: <TempleApplicationListPage />,
              },
              {
                path: ':id',
                element: <TempleApplicationDetailPage />,
              },
            ],
          },
        ],
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <ProductListPage />,
          },
          {
            path: ':id',
            element: <ProductDetailPage />,
          },
        ],
      },
      {
        path: 'redemptions',
        children: [
          {
            index: true,
            element: <RedemptionListPage />,
          },
          {
            path: ':id',
            element: <RedemptionDetailPage />,
          },
        ],
      },
      {
        path: 'amulets',
        element: <AmuletListPage />,
      },
      {
        path: 'checkins',
        element: <CheckinListPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'reports',
        children: [
          {
            index: true,
            element: <ReportListPage />,
          },
          {
            path: ':id',
            element: <ReportDetailPage />,
          },
        ],
      },
      {
        path: 'logs',
        element: <LogListPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
