/**
 * 主要頁面佈局
 */
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  BankOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  SettingOutlined,
  WarningOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { token } = theme.useToken();

  // 選單項目
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '儀表板',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '使用者管理',
    },
    {
      key: '/temples',
      icon: <BankOutlined />,
      label: '廟宇管理',
      children: [
        {
          key: '/temples',
          label: '廟宇列表',
        },
        {
          key: '/temples/applications',
          label: '申請審核',
        },
      ],
    },
    {
      key: '/amulets',
      icon: <SafetyOutlined />,
      label: '平安符管理',
    },
    {
      key: '/checkins',
      icon: <CalendarOutlined />,
      label: '打卡記錄',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: '商品管理',
    },
    {
      key: '/redemptions',
      icon: <ShoppingCartOutlined />,
      label: '兌換管理',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: '數據分析',
    },
    {
      key: '/reports',
      icon: <WarningOutlined />,
      label: '檢舉管理',
    },
    {
      key: '/logs',
      icon: <FileTextOutlined />,
      label: '系統日誌',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系統設定',
    },
  ];

  // 使用者下拉選單
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: async () => {
        await logout();
        navigate('/auth/login');
      },
    },
  ];

  // 處理選單點擊
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // 取得當前路徑
  const getCurrentPath = () => {
    const path = location.pathname;
    // 處理子路由
    if (path.startsWith('/temples/applications')) {
      return '/temples/applications';
    }
    if (path.startsWith('/temples/')) {
      return '/temples';
    }
    if (path.startsWith('/users/')) {
      return '/users';
    }
    if (path.startsWith('/products/')) {
      return '/products';
    }
    if (path.startsWith('/redemptions/')) {
      return '/redemptions';
    }
    if (path.startsWith('/reports/')) {
      return '/reports';
    }
    if (path.startsWith('/amulets/')) {
      return '/amulets';
    }
    if (path.startsWith('/checkins/')) {
      return '/checkins';
    }
    return path;
  };

  return (
    <Layout className="main-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className="main-sider"
        style={{
          background: token.colorBgContainer,
        }}
      >
        <div className="logo">
          {collapsed ? '廟' : '廟方打卡系統'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getCurrentPath()]}
          defaultOpenKeys={['/temples']}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          className="main-header"
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div className="header-left">
            {collapsed ? (
              <MenuUnfoldOutlined
                className="trigger"
                onClick={() => setCollapsed(!collapsed)}
              />
            ) : (
              <MenuFoldOutlined
                className="trigger"
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
          </div>
          <div className="header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-info">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="user-name">{user?.username || '管理員'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="main-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
