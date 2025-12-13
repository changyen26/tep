/**
 * 底部導航列組件
 */
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  TagOutlined,
  SettingOutlined,
  UserOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { COLORS } from '../../constants/theme';
import './BottomNavigation.css';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      key: 'home',
      path: '/',
      icon: <HomeOutlined />,
      label: '首頁',
    },
    {
      key: 'achievement',
      path: '/achievement',
      icon: <StarOutlined />,
      label: '成就',
    },
    {
      key: 'map',
      path: '/map',
      icon: <EnvironmentOutlined />,
      label: '地圖',
    },
    {
      key: 'amulet',
      path: '/amulet',
      icon: <TagOutlined />,
      label: '平安符',
    },
    {
      key: 'settings',
      path: '/settings',
      icon: <SettingOutlined />,
      label: '設定',
    },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bottom-navigation">
      {navItems.map((item) => (
        <div
          key={item.key}
          className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <div className="nav-icon">{item.icon}</div>
          <div className="nav-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default BottomNavigation;
