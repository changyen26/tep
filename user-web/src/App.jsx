/**
 * 主應用程式元件
 */
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import { router } from './routes';
import { THEME_CONFIG } from './constants/theme';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhTW} theme={THEME_CONFIG}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
