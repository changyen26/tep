/**
 * 廟宇網站整體佈局組件
 * 從 localStorage 讀取後台設定的資料
 */
import { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { templeWebsiteMockData as defaultMockData } from '../../../mock/templeWebsiteMockData';
import './TempleWebsiteLayout.css';

// 取得儲存的網站資料 key（與後台一致）
const getStorageKey = (templeId) => `temple_website_${templeId}`;

// 將後台資料轉換成前台格式
const transformAdminDataToFrontend = (adminData, templeId) => {
  if (!adminData) return null;

  const { basic, carousel, news, services, lightingServices, pilgrimage, gallery } = adminData;

  return {
    temple: {
      id: templeId,
      name: basic?.name || '廟宇名稱',
      subtitle: basic?.subtitle || '',
      logo: basic?.logo || null,
      description: basic?.description || '',
      history: defaultMockData.temple.history, // 使用預設歷史
      address: basic?.address || '',
      phone: basic?.phone || '',
      fax: basic?.fax || '',
      email: basic?.email || '',
      openingHours: basic?.openingHours || '',
      socialMedia: {
        facebook: basic?.facebook || '',
        instagram: basic?.instagram || '',
        youtube: basic?.youtube || '',
        line: basic?.line || ''
      }
    },
    navigation: defaultMockData.navigation,
    carousel: carousel?.map(item => ({
      id: item.id,
      image: item.image,
      title: item.title,
      subtitle: item.subtitle,
      link: item.link
    })) || defaultMockData.carousel,
    news: news?.filter(n => n.published !== false).map(item => ({
      id: item.id,
      title: item.title,
      date: item.date,
      category: item.category,
      summary: item.summary,
      content: item.content || item.summary,
      image: item.image || `https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&h=300&fit=crop`
    })) || defaultMockData.news,
    events: defaultMockData.events,
    services: services?.filter(s => s.enabled !== false).map(item => ({
      id: item.id,
      title: item.title,
      icon: item.icon,
      description: item.description,
      price: item.price,
      image: item.image || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop`
    })) || defaultMockData.services,
    lightingServices: lightingServices || defaultMockData.lightingServices,
    pilgrimage: pilgrimage || defaultMockData.pilgrimage,
    gallery: gallery || defaultMockData.gallery,
    footerLinks: defaultMockData.footerLinks
  };
};

const TempleWebsiteLayout = () => {
  const { templeId } = useParams();
  const basePath = `/temple/${templeId}`;

  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 載入網站資料
  useEffect(() => {
    const loadData = () => {
      try {
        const storageKey = getStorageKey(templeId);
        const saved = localStorage.getItem(storageKey);

        if (saved) {
          const adminData = JSON.parse(saved);
          const frontendData = transformAdminDataToFrontend(adminData, templeId);
          setWebsiteData(frontendData);
        } else {
          // 沒有後台設定時使用預設資料
          setWebsiteData({
            ...defaultMockData,
            temple: { ...defaultMockData.temple, id: templeId }
          });
        }
      } catch (e) {
        console.error('讀取網站資料失敗:', e);
        setWebsiteData({
          ...defaultMockData,
          temple: { ...defaultMockData.temple, id: templeId }
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // 監聽 localStorage 變化（當後台儲存時即時更新）
    const handleStorageChange = (e) => {
      if (e.key === getStorageKey(templeId)) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [templeId]);

  // 載入中
  if (loading || !websiteData) {
    return (
      <div className="temple-website-layout">
        <div className="temple-loading">
          <div className="temple-loading-spinner"></div>
        </div>
      </div>
    );
  }

  const { temple, navigation, footerLinks } = websiteData;

  return (
    <div className="temple-website-layout">
      <Header
        temple={temple}
        navigation={navigation}
        basePath={basePath}
      />

      <main className="temple-website-main">
        <Outlet context={{ temple, basePath, mockData: websiteData }} />
      </main>

      <Footer
        temple={temple}
        footerLinks={footerLinks}
        basePath={basePath}
      />
    </div>
  );
};

export default TempleWebsiteLayout;
