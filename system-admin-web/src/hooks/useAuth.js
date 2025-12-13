/**
 * 認證相關 Hook
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getToken, setToken as saveToken, removeToken, isAuthenticated } from '../utils/auth';
import { login as apiLogin, logout as apiLogout, getProfile } from '../api';

/**
 * 認證狀態管理
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: isAuthenticated(),

      // 設定使用者資訊
      setUser: (user) => set({ user, isAuthenticated: true }),

      // 清除使用者資訊
      clearUser: () => {
        removeToken();
        set({ user: null, isAuthenticated: false });
      },

      // 登入
      login: async (username, password) => {
        const response = await apiLogin(username, password);
        const { token, admin } = response.data;

        saveToken(token);
        set({ user: admin, isAuthenticated: true });

        return response;
      },

      // 登出
      logout: async () => {
        try {
          await apiLogout();
        } catch (error) {
          console.error('登出失敗:', error);
        } finally {
          removeToken();
          set({ user: null, isAuthenticated: false });
        }
      },

      // 取得使用者資料
      fetchUser: async () => {
        try {
          const response = await getProfile();
          set({ user: response.data, isAuthenticated: true });
          return response.data;
        } catch (error) {
          removeToken();
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

/**
 * 使用認證 Hook
 */
export const useAuth = () => {
  const { user, isAuthenticated, setUser, clearUser, login, logout, fetchUser } = useAuthStore();

  return {
    user,
    isAuthenticated,
    setUser,
    clearUser,
    login,
    logout,
    fetchUser,
  };
};
