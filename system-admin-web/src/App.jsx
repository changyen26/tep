/**
 * 主應用程式元件
 */
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import { router } from './routes';
import { queryClient } from './utils/queryClient';
import './App.css';

function App() {
  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        token: {
          colorPrimary: '#667eea',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;
