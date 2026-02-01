/**
 * Temple Website Routes - 廟宇官網路由配置
 *
 * 公開路由：/temple/:templeId/*
 * 不需要登入即可訪問
 */

import { Route } from 'react-router-dom';

// 廟宇網站佈局
import TempleWebsiteLayout from '../components/temple-website/layout/TempleWebsiteLayout';

// 廟宇網站頁面
import HomePage from '../pages/temple-website/HomePage';
import AboutPage from '../pages/temple-website/AboutPage';
import NewsPage from '../pages/temple-website/NewsPage';
import EventsPage from '../pages/temple-website/EventsPage';
import ServicesPage from '../pages/temple-website/ServicesPage';
import LightingPage from '../pages/temple-website/LightingPage';
import GalleryPage from '../pages/temple-website/GalleryPage';
import ContactPage from '../pages/temple-website/ContactPage';

/**
 * 廟宇官網路由元件
 * 公開路由，不需要登入
 */
export const templeWebsiteRoutes = (
  <Route path="/temple/:templeId" element={<TempleWebsiteLayout />}>
    <Route index element={<HomePage />} />
    <Route path="about" element={<AboutPage />} />
    <Route path="news" element={<NewsPage />} />
    <Route path="news/:newsId" element={<NewsPage />} />
    <Route path="events" element={<EventsPage />} />
    <Route path="services" element={<ServicesPage />} />
    <Route path="lighting" element={<LightingPage />} />
    <Route path="gallery" element={<GalleryPage />} />
    <Route path="contact" element={<ContactPage />} />
  </Route>
);

export default templeWebsiteRoutes;
