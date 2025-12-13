/**
 * 認證頁面佈局
 */
import { Outlet, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import './AuthLayout.css';

const { Content } = Layout;

export const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  // 如果已登入，導向儀表板
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout className="auth-layout">
      <Content className="auth-content">
        <div className="auth-container">
          <div className="auth-header">
            <h1>廟方打卡系統</h1>
            <h2>系統管理後台</h2>
          </div>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};
