/**
 * Temple Admin Guard - 廟方管理員權限守衛
 *
 * 功能：
 * 1. 檢查是否登入
 * 2. 檢查角色是否為 temple_admin 或 admin
 * 3. temple_admin 只能訪問自己的 templeId
 * 4. admin 可以訪問任意 templeId
 */

import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 權限守衛組件
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子組件
 */
const TempleAdminGuard = ({ children }) => {
  const { templeId } = useParams();
  const { isAuthenticated, role, user, loading } = useAuth();

  // 載入中
  if (loading) {
    return (
      <div className="guard-loading">
        <div className="loading-spinner"></div>
        <p>載入中...</p>
      </div>
    );
  }

  // 未登入 → 導回登入頁
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  // 角色檢查：只允許 temple_admin 或 admin
  if (role !== 'temple_admin' && role !== 'admin') {
    return (
      <div className="guard-error">
        <div className="error-container">
          <h2>權限不足</h2>
          <p>您沒有權限訪問廟方管理後台</p>
          <p>目前角色：{role || '未知'}</p>
          <button onClick={() => (window.location.href = '/dashboard')}>返回首頁</button>
        </div>
      </div>
    );
  }

  // temple_admin：強制檢查 templeId 一致性
  if (role === 'temple_admin') {
    const userTempleId = user?.temple_id?.toString();
    const routeTempleId = templeId?.toString();

    // 若 user 沒有 temple_id，顯示錯誤
    if (!userTempleId) {
      return (
        <div className="guard-error">
          <div className="error-container">
            <h2>帳號設定錯誤</h2>
            <p>您的帳號尚未綁定廟宇，請聯繫系統管理員</p>
            <button onClick={() => (window.location.href = '/dashboard')}>返回首頁</button>
          </div>
        </div>
      );
    }

    // 若嘗試訪問其他廟宇，導回正確的 templeId
    if (userTempleId !== routeTempleId) {
      const correctPath = window.location.pathname.replace(
        `/temple-admin/${routeTempleId}`,
        `/temple-admin/${userTempleId}`
      );
      return <Navigate to={correctPath} replace />;
    }
  }

  // admin：可以訪問任意 templeId，無需檢查

  // 通過所有檢查，渲染子組件
  return <>{children}</>;
};

export default TempleAdminGuard;
