/**
 * React Query 客戶端配置
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 分鐘
    },
    mutations: {
      retry: 0,
    },
  },
});
