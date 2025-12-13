/**
 * 主應用佈局組件
 */
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import './AppLayout.css';

const AppLayout = () => {
  return (
    <div className="app-layout">
      {/* 主內容區域 */}
      <div className="app-content">
        <Outlet />
      </div>

      {/* 底部導航 */}
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
