/**
 * 路由配置
 */
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

// 認證頁面
import LoginPage from '../pages/auth/LoginPage';

// 廟宇相關頁面
import TempleHomePage from '../pages/temple/TempleHomePage';
import TempleInfoPage from '../pages/temple/TempleInfoPage';

// 祈福相關頁面
import PrayerInstructionPage from '../pages/prayer/PrayerInstructionPage';
import PrayerProcessPage from '../pages/prayer/PrayerProcessPage';

// 平安符相關頁面
import AmuletInfoPage from '../pages/amulet/AmuletInfoPage';
import AmuletHistoryPage from '../pages/amulet/AmuletHistoryPage';

// 個人中心頁面
import ProfilePage from '../pages/profile/ProfilePage';

// 成就系統頁面
import AchievementPage from '../pages/achievement/AchievementPage';

// 地圖搜尋頁面
import MapPage from '../pages/map/MapPage';

// 設定頁面
import SettingsPage from '../pages/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <TempleHomePage />,
      },
      {
        path: 'temple',
        children: [
          {
            index: true,
            element: <TempleHomePage />,
          },
          {
            path: 'info',
            element: <TempleInfoPage />,
          },
        ],
      },
      {
        path: 'prayer',
        children: [
          {
            path: 'instruction',
            element: <PrayerInstructionPage />,
          },
          {
            path: 'process',
            element: <PrayerProcessPage />,
          },
        ],
      },
      {
        path: 'amulet',
        children: [
          {
            index: true,
            element: <AmuletInfoPage />,
          },
          {
            path: 'history',
            element: <AmuletHistoryPage />,
          },
        ],
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'achievement',
        element: <AchievementPage />,
      },
      {
        path: 'map',
        element: <MapPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);
