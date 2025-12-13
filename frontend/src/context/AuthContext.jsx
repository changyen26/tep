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
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(parsedUser);
      setRole(parsedUser?.role || null);
    }

    setLoading(false);
  }, []);

  const persistAuth = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setRole(userData?.role || null);

    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const payload = response.data?.data || response.data || {};
      const userData = payload.user;
      const userToken = payload.token;

      if (userData && userToken) {
        persistAuth(userData, userToken);
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

      if (userData && userToken) {
        persistAuth(userData, userToken);
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

      if (payload) {
        setUser(payload);
        setRole(payload?.role || null);
        localStorage.setItem('user', JSON.stringify(payload));
      }
      return payload;
    } catch {
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    role,
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
