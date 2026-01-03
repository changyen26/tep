import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../api';
import { getErrorMessage } from '../utils/http';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 向後兼容
  const [accountType, setAccountType] = useState(null); // 新增：三表帳號類型
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedAccountType = localStorage.getItem('account_type');

    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(parsedUser);
      setRole(parsedUser?.role || null); // 向後兼容
      setAccountType(savedAccountType || parsedUser?.account_type || null);
    }

    setLoading(false);
  }, []);

  const persistAuth = (userData, userToken, accType = null) => {
    setUser(userData);
    setToken(userToken);
    setRole(userData?.role || null); // 向後兼容

    // 三表系統：優先使用傳入的 accType，否則使用 userData.account_type
    const finalAccountType = accType || userData?.account_type || null;
    setAccountType(finalAccountType);

    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    if (finalAccountType) {
      localStorage.setItem('account_type', finalAccountType);
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const payload = response.data?.data || response.data || {};
      const userData = payload.user;
      const userToken = payload.token;
      const accType = payload.account_type;

      if (userData && userToken) {
        persistAuth(userData, userToken, accType);
      }

      return { success: true, data: payload };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, '註冊失敗') };
    }
  };

  const login = async (data) => {
    try {
      const response = await authAPI.login(data);
      const payload = response.data?.data || response.data || {};
      const userData = payload.user;
      const userToken = payload.token;
      const accType = payload.account_type; // 三表帳號系統

      if (userData && userToken) {
        persistAuth(userData, userToken, accType);
      }

      return { success: true, data: payload };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, '登入失敗') };
    }
  };

  const fetchMe = async () => {
    if (!token) return null;
    try {
      const response = await authAPI.me();
      const payload = response.data?.data || response.data || {};
      const userData = payload.user || payload;
      const accType = payload.account_type;

      if (userData) {
        setUser(userData);
        setRole(userData?.role || null); // 向後兼容
        setAccountType(accType || userData?.account_type || null);
        localStorage.setItem('user', JSON.stringify(userData));
        if (accType) {
          localStorage.setItem('account_type', accType);
        }
      }
      return payload;
    } catch {
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setAccountType(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('account_type');
  };

  const value = {
    user,
    role, // 向後兼容
    accountType, // 新增：三表帳號類型
    token,
    loading,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    fetchMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
