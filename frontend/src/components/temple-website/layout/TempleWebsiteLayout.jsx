/**
 * 廟宇網站整體佈局組件
 * 直接從後台設定讀取資料（localStorage）
 */
import { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './TempleWebsiteLayout.css';

// 取得儲存的網站資料 key（與後台 WebsiteSettings 一致）
const getStorageKey = (templeId) => `temple_website_${templeId}`;

// 預設資料（當後台尚未設定時使用）
const getDefaultData = (templeId) => ({
  temple: {
    id: templeId,
    name: '廟宇名稱',
    subtitle: '歡迎蒞臨參拜',
    description: '請至後台「官網設定」編輯廟宇資訊。',
    address: '請設定地址',
    phone: '請設定電話',
    email: '',
    openingHours: '每日 06:00 - 21:00',
    socialMedia: {}
  },
  navigation: [
    { key: 'home', label: '首頁', path: '' },
    { key: 'about', label: '關於本宮', path: 'about' },
    { key: 'news', label: '最新消息', path: 'news' },
    { key: 'events', label: '活動一覽', path: 'events' },
    { key: 'services', label: '服務項目', path: 'services' },
    { key: 'lighting', label: '點燈祈福', path: 'lighting' },
    { key: 'gallery', label: '相簿', path: 'gallery' },
    { key: 'contact', label: '聯絡我們', path: 'contact' }
  ],
  carousel: [],
  news: [],
  services: [],
  lightingServices: [],
  pilgrimage: { lunarDate: '', solarDate: '', todayGroups: [], upcomingEvents: [] },
  gallery: [],
  events: [],
  footerLinks: [
    { title: '關於我們', links: [{ label: '本宮介紹', path: 'about' }] },
    { title: '信眾服務', links: [{ label: '點燈祈福', path: 'lighting' }] },
    { title: '最新資訊', links: [{ label: '最新消息', path: 'news' }] }
  ]
});

// 將後台資料格式轉換成前台格式
const transformData = (adminData, templeId) => {
  if (!adminData) return getDefaultData(templeId);

  const { basic, carousel, news, services, lightingServices, pilgrimage, gallery } = adminData;

  return {
    temple: {
      id: templeId,
      name: basic?.name || '廟宇名稱',
      subtitle: basic?.subtitle || '',
      logo: basic?.logo || null,
      description: basic?.description || '',
      history: basic?.history || '',
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
    navigation: [
      { key: 'home', label: '首頁', path: '' },
      { key: 'about', label: '關於本宮', path: 'about' },
      { key: 'news', label: '最新消息', path: 'news' },
      { key: 'events', label: '活動一覽', path: 'events' },
      { key: 'services', label: '服務項目', path: 'services' },
      { key: 'lighting', label: '點燈祈福', path: 'lighting' },
      { key: 'gallery', label: '相簿', path: 'gallery' },
      { key: 'contact', label: '聯絡我們', path: 'contact' }
    ],
    carousel: carousel?.map(item => ({
      id: item.id,
      image: item.image,
      title: item.title,
      subtitle: item.subtitle,
      link: item.link
    })) || [],
    news: news?.filter(n => n.published !== false).map(item => ({
      id: item.id,
      title: item.title,
      date: item.date,
      category: item.category,
      summary: item.summary,
      content: item.content || item.summary,
      image: item.image || 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&h=300&fit=crop'
    })) || [],
    events: adminData.events || [],
    services: services?.filter(s => s.enabled !== false).map(item => ({
      id: item.id,
      title: item.title,
      icon: item.icon,
      description: item.description,
      price: item.price,
      image: item.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop'
    })) || [],
    lightingServices: lightingServices || [],
    pilgrimage: pilgrimage || { lunarDate: '', solarDate: '', todayGroups: [], upcomingEvents: [] },
    gallery: gallery || [],
    footerLinks: [
      { title: '關於我們', links: [{ label: '本宮介紹', path: 'about' }, { label: '歷史沿革', path: 'about#history' }] },
      { title: '信眾服務', links: [{ label: '點燈祈福', path: 'lighting' }, { label: '服務項目', path: 'services' }] },
      { title: '最新資訊', links: [{ label: '最新消息', path: 'news' }, { label: '活動一覽', path: 'events' }] }
    ]
  };
};

const TempleWebsiteLayout = () => {
  const { templeId } = useParams();
  const basePath = `/temple/${templeId}`;

  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 載入網站資料（從 localStorage 讀取後台設定）
  useEffect(() => {
    const loadData = () => {
      try {
        const storageKey = getStorageKey(templeId);
        const saved = localStorage.getItem(storageKey);

        if (saved) {
          const adminData = JSON.parse(saved);
          setWebsiteData(transformData(adminData, templeId));
        } else {
          setWebsiteData(getDefaultData(templeId));
        }
      } catch (e) {
        console.error('讀取網站資料失敗:', e);
        setWebsiteData(getDefaultData(templeId));
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
