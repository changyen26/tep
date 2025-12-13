import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleGuard = ({ allowRoles, children }) => {
  const { role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowRoles && allowRoles.length > 0 && !allowRoles.includes(role)) {
    return <div className="loading">無權限</div>;
  }

  return children;
};

export default RoleGuard;
