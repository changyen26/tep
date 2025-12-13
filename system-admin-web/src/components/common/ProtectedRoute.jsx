/**
 * 受保護路由元件
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};
