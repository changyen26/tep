/**
 * 官網設定管理頁面
 * 左側設定面板 + 右側即時預覽
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './WebsiteSettings.css';

const USE_MOCK = true;

// 取得儲存的網站資料 key
const getStorageKey = (templeId) => `temple_website_${templeId}`;

// 主題色預設選項
const themeColors = [
  { id: 'gold', name: '經典金', primary: '#ab8c1f', secondary: '#d4b756', dark: '#232428' },
  { id: 'red', name: '喜慶紅', primary: '#c41e3a', secondary: '#e74c3c', dark: '#2c1810' },
  { id: 'green', name: '祥和綠', primary: '#2e7d32', secondary: '#4caf50', dark: '#1a2e1a' },
  { id: 'blue', name: '寧靜藍', primary: '#1565c0', secondary: '#42a5f5', dark: '#1a1a2e' },
  { id: 'purple', name: '尊貴紫', primary: '#6a1b9a', secondary: '#ab47bc', dark: '#2a1a2e' },
  { id: 'brown', name: '古樸褐', primary: '#795548', secondary: '#a1887f', dark: '#2e2420' },
];

// 預設 Mock 資料 - 白河三官寶殿
const getDefaultWebsiteData = () => ({
  basic: {
    name: '三官寶殿',
    subtitle: '天官、地官、水官三官大帝聖殿',
    description: '白河三官寶殿主祀三官大帝，為台南白河地區重要信仰中心。三官大帝掌管天、地、水三界，賜福赦罪解厄，護佑信眾平安順遂。',
    address: '臺南市白河區外角里4鄰外角41號',
    phone: '06-685-1234',
    email: 'service@sanguantemple.org.tw',
    openingHours: '每日 05:00 - 21:00',
    facebook: 'https://www.facebook.com/sanguantemple',
    instagram: '',
    youtube: '',
    line: '',
    websiteEnabled: true,
  },
  theme: {
    colorId: 'gold',
    primary: '#ab8c1f',
    secondary: '#d4b756',
    dark: '#232428',
  },
  carousel: [
    { id: 1, title: '白河三官寶殿', subtitle: '天官賜福・地官赦罪・水官解厄', image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1600&h=600&fit=crop', link: '/about', order: 1 },
    { id: 2, title: '三官大帝聖誕祈福法會', subtitle: '正月十五上元節・七月十五中元節・十月十五下元節', image: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=1600&h=600&fit=crop', link: '/events', order: 2 },
  ],
  news: [
    { id: 1, title: '114年上元天官賜福法會', date: '2025-02-01', category: '活動公告', summary: '農曆正月十五上元節，本殿將舉辦天官賜福祈安法會', image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=400&h=300&fit=crop', published: true },
    { id: 2, title: '光明燈及平安燈開放登記', date: '2025-01-20', category: '服務公告', summary: '114年度光明燈、平安燈、文昌燈即日起開放登記', image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=400&h=300&fit=crop', published: true },
  ],
  services: [
    { id: 1, title: '光明燈', icon: 'bulb', description: '點燃光明，三官護佑，照耀前程順遂。', price: '500元/年', enabled: true },
    { id: 2, title: '平安燈', icon: 'star', description: '祈求闔家平安，身體健康，萬事如意。', price: '500元/年', enabled: true },
    { id: 3, title: '文昌燈', icon: 'book', description: '祈求考運亨通、學業進步、金榜題名。', price: '500元/年', enabled: true },
    { id: 4, title: '安太歲', icon: 'safety', description: '化解太歲沖煞，流年平安順遂。', price: '300元/年', enabled: true },
  ],
  lightingServices: [
    { id: 1, name: '光明燈', description: '三官護佑，點燃光明照前程。', price: 500, duration: '全年', benefits: ['事業順利', '學業進步', '身體健康', '闔家平安'], popular: true },
    { id: 2, name: '平安燈', description: '祈求平安，萬事如意。', price: 500, duration: '全年', benefits: ['出入平安', '身心安康', '諸事順遂', '貴人相助'], popular: true },
  ],
  pilgrimage: {
    lunarDate: '正月十五',
    solarDate: '2025-02-12',
    todayGroups: [
      { name: '嘉義市三官宮進香團', members: 35, time: '09:00' },
      { name: '台南市善化區三元宮', members: 80, time: '10:30' },
    ],
    upcomingEvents: [
      { date: '正月十五', event: '上元天官賜福法會' },
      { date: '七月十五', event: '中元地官赦罪法會' },
    ]
  },
  gallery: [
    { id: 1, category: '廟宇建築', title: '三官寶殿正殿', image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=400&fit=crop', description: '本殿正殿供奉三官大帝，莊嚴肅穆。' },
  ],
  events: [
    { id: 1, title: '上元天官賜福法會', startDate: '2025-02-12', endDate: '2025-02-12', location: '三官寶殿', description: '農曆正月十五上元節', image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=400&h=300&fit=crop', status: 'upcoming' },
  ],
});

// 從 localStorage 讀取資料
const loadWebsiteData = (templeId) => {
  try {
    const saved = localStorage.getItem(getStorageKey(templeId));
    if (saved) {
      const data = JSON.parse(saved);
      // 確保有 theme 屬性
      if (!data.theme) {
        data.theme = {
          colorId: 'gold',
          primary: '#ab8c1f',
          secondary: '#d4b756',
          dark: '#232428',
        };
      }
      return data;
    }
  } catch (e) {
    console.error('讀取網站資料失敗:', e);
  }
  return getDefaultWebsiteData();
};

// 儲存資料到 localStorage
const saveWebsiteData = (templeId, data) => {
  try {
    localStorage.setItem(getStorageKey(templeId), JSON.stringify(data));
    window.dispatchEvent(new StorageEvent('storage', {
      key: getStorageKey(templeId),
      newValue: JSON.stringify(data)
    }));
  } catch (e) {
    console.error('儲存網站資料失敗:', e);
  }
};

const WebsiteSettings = () => {
  const { templeId } = useParams();
  const [activeSection, setActiveSection] = useState('theme');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.65);

  // 載入資料
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (USE_MOCK) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const savedData = loadWebsiteData(templeId);
          setData(savedData);
        }
      } catch (err) {
        console.error('載入失敗:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [templeId]);

  // 當資料變化時自動儲存
  useEffect(() => {
    if (data && !loading) {
      saveWebsiteData(templeId, data);
    }
  }, [data, templeId, loading]);

  // 更新基本設定
  const handleBasicChange = (field, value) => {
    setData(prev => ({
      ...prev,
      basic: { ...prev.basic, [field]: value }
    }));
  };

  // 更新主題色
  const handleThemeChange = (colorId) => {
    const selectedTheme = themeColors.find(c => c.id === colorId);
    if (selectedTheme) {
      setData(prev => ({
        ...prev,
        theme: {
          colorId: selectedTheme.id,
          primary: selectedTheme.primary,
          secondary: selectedTheme.secondary,
          dark: selectedTheme.dark,
        }
      }));
    }
  };

  // 儲存設定
  const handleSave = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      saveWebsiteData(templeId, data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('儲存失敗:', err);
    } finally {
      setSaving(false);
    }
  };

  // 預覽網站
  const handlePreview = () => {
    window.open(`/temple/${templeId}`, '_blank');
  };

  // 發布網站
  const handlePublish = async () => {
    await handleSave();
    alert('網站已發布！');
  };

  // 重置為預設資料
  const handleReset = () => {
    if (window.confirm('確定要重置為預設資料嗎？目前的設定將會被覆蓋。')) {
      const defaultData = getDefaultWebsiteData();
      setData(defaultData);
      saveWebsiteData(templeId, defaultData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (loading) {
    return <div className="website-editor"><div className="editor-loading">載入中...</div></div>;
  }

  const currentTheme = data?.theme || { colorId: 'gold', primary: '#ab8c1f', secondary: '#d4b756', dark: '#232428' };

  return (
    <div className="website-editor">
      {/* 頂部工具列 */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <h1 className="toolbar-title">官網編輯器</h1>
          <span className="toolbar-status">
            {data?.basic?.websiteEnabled ? '🟢 已啟用' : '🔴 未啟用'}
          </span>
        </div>
        <div className="toolbar-right">
          <div className="preview-scale">
            <span>預覽縮放</span>
            <input
              type="range"
              min="0.4"
              max="1"
              step="0.05"
              value={previewScale}
              onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
            />
            <span>{Math.round(previewScale * 100)}%</span>
          </div>
          <button className="toolbar-btn" onClick={handleReset}>
            🔄 重置
          </button>
          <button className="toolbar-btn" onClick={handlePreview}>
            👁️ 預覽
          </button>
          <button className="toolbar-btn primary" onClick={handleSave} disabled={saving}>
            {saving ? '儲存中...' : '💾 儲存'}
          </button>
          <button className="toolbar-btn success" onClick={handlePublish}>
            🚀 發布
          </button>
        </div>
      </div>

      {success && <div className="editor-success">✓ 設定已儲存</div>}

      <div className="editor-container">
        {/* 左側設定面板 */}
        <div className="editor-sidebar">
          {/* 區塊選單 */}
          <div className="sidebar-nav">
            <button
              className={`sidebar-nav-item ${activeSection === 'theme' ? 'active' : ''}`}
              onClick={() => setActiveSection('theme')}
            >
              🎨 主題色
            </button>
            <button
              className={`sidebar-nav-item ${activeSection === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveSection('basic')}
            >
              ⚙️ 基本設定
            </button>
            <button
              className={`sidebar-nav-item ${activeSection === 'carousel' ? 'active' : ''}`}
              onClick={() => setActiveSection('carousel')}
            >
              🖼️ 輪播圖
            </button>
            <button
              className={`sidebar-nav-item ${activeSection === 'services' ? 'active' : ''}`}
              onClick={() => setActiveSection('services')}
            >
              🙏 服務項目
            </button>
            <button
              className={`sidebar-nav-item ${activeSection === 'news' ? 'active' : ''}`}
              onClick={() => setActiveSection('news')}
            >
              📰 最新消息
            </button>
          </div>

          {/* 設定內容 */}
          <div className="sidebar-content">
            {/* 主題色設定 */}
            {activeSection === 'theme' && (
              <div className="setting-section">
                <h3 className="setting-title">主題色</h3>
                <p className="setting-desc">選擇網站的主要配色風格</p>
                <div className="theme-grid">
                  {themeColors.map((theme) => (
                    <button
                      key={theme.id}
                      className={`theme-option ${currentTheme.colorId === theme.id ? 'active' : ''}`}
                      onClick={() => handleThemeChange(theme.id)}
                    >
                      <div className="theme-colors">
                        <span style={{ background: theme.dark }}></span>
                        <span style={{ background: theme.primary }}></span>
                        <span style={{ background: theme.secondary }}></span>
                      </div>
                      <span className="theme-name">{theme.name}</span>
                    </button>
                  ))}
                </div>

                <div className="color-preview">
                  <h4>目前配色</h4>
                  <div className="color-swatches">
                    <div className="color-swatch">
                      <div style={{ background: currentTheme.dark }}></div>
                      <span>深色背景</span>
                    </div>
                    <div className="color-swatch">
                      <div style={{ background: currentTheme.primary }}></div>
                      <span>主色</span>
                    </div>
                    <div className="color-swatch">
                      <div style={{ background: currentTheme.secondary }}></div>
                      <span>亮色</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 基本設定 */}
            {activeSection === 'basic' && (
              <div className="setting-section">
                <h3 className="setting-title">基本資訊</h3>

                <div className="setting-group">
                  <label>網站啟用</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={data?.basic?.websiteEnabled || false}
                      onChange={(e) => handleBasicChange('websiteEnabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-group">
                  <label>廟宇名稱</label>
                  <input
                    type="text"
                    value={data?.basic?.name || ''}
                    onChange={(e) => handleBasicChange('name', e.target.value)}
                  />
                </div>

                <div className="setting-group">
                  <label>副標題</label>
                  <input
                    type="text"
                    value={data?.basic?.subtitle || ''}
                    onChange={(e) => handleBasicChange('subtitle', e.target.value)}
                  />
                </div>

                <div className="setting-group">
                  <label>廟宇簡介</label>
                  <textarea
                    rows={4}
                    value={data?.basic?.description || ''}
                    onChange={(e) => handleBasicChange('description', e.target.value)}
                  />
                </div>

                <h4 className="setting-subtitle">聯絡資訊</h4>

                <div className="setting-group">
                  <label>地址</label>
                  <input
                    type="text"
                    value={data?.basic?.address || ''}
                    onChange={(e) => handleBasicChange('address', e.target.value)}
                  />
                </div>

                <div className="setting-row">
                  <div className="setting-group">
                    <label>電話</label>
                    <input
                      type="tel"
                      value={data?.basic?.phone || ''}
                      onChange={(e) => handleBasicChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="setting-group">
                    <label>開放時間</label>
                    <input
                      type="text"
                      value={data?.basic?.openingHours || ''}
                      onChange={(e) => handleBasicChange('openingHours', e.target.value)}
                    />
                  </div>
                </div>

                <div className="setting-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={data?.basic?.email || ''}
                    onChange={(e) => handleBasicChange('email', e.target.value)}
                  />
                </div>

                <h4 className="setting-subtitle">社群媒體</h4>

                <div className="setting-group">
                  <label>Facebook</label>
                  <input
                    type="url"
                    value={data?.basic?.facebook || ''}
                    onChange={(e) => handleBasicChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div className="setting-group">
                  <label>LINE</label>
                  <input
                    type="url"
                    value={data?.basic?.line || ''}
                    onChange={(e) => handleBasicChange('line', e.target.value)}
                    placeholder="https://line.me/..."
                  />
                </div>
              </div>
            )}

            {/* 輪播圖設定 */}
            {activeSection === 'carousel' && (
              <div className="setting-section">
                <h3 className="setting-title">輪播圖管理</h3>
                <p className="setting-desc">建議尺寸 1600x600 像素</p>

                <div className="item-list">
                  {data?.carousel?.map((item, index) => (
                    <div key={item.id} className="item-card">
                      <div className="item-preview">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="item-info">
                        <span className="item-order">#{index + 1}</span>
                        <strong>{item.title}</strong>
                        <small>{item.subtitle}</small>
                      </div>
                      <div className="item-actions">
                        <button className="btn-icon">✏️</button>
                        <button className="btn-icon danger">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn-add">+ 新增輪播圖</button>
              </div>
            )}

            {/* 服務項目設定 */}
            {activeSection === 'services' && (
              <div className="setting-section">
                <h3 className="setting-title">服務項目管理</h3>

                <div className="item-list compact">
                  {data?.services?.map((item) => (
                    <div key={item.id} className="item-row">
                      <span className="item-icon">{getServiceIcon(item.icon)}</span>
                      <div className="item-content">
                        <strong>{item.title}</strong>
                        <small>{item.price}</small>
                      </div>
                      <label className="toggle-switch small">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) => {
                            setData(prev => ({
                              ...prev,
                              services: prev.services.map(s =>
                                s.id === item.id ? { ...s, enabled: e.target.checked } : s
                              )
                            }));
                          }}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <button className="btn-icon small">✏️</button>
                    </div>
                  ))}
                </div>

                <button className="btn-add">+ 新增服務</button>
              </div>
            )}

            {/* 最新消息設定 */}
            {activeSection === 'news' && (
              <div className="setting-section">
                <h3 className="setting-title">最新消息管理</h3>

                <div className="item-list compact">
                  {data?.news?.map((item) => (
                    <div key={item.id} className="item-row">
                      <div className="item-content">
                        <strong>{item.title}</strong>
                        <small>{item.date} · {item.category}</small>
                      </div>
                      <span className={`status-badge ${item.published ? 'published' : 'draft'}`}>
                        {item.published ? '已發布' : '草稿'}
                      </span>
                      <button className="btn-icon small">✏️</button>
                    </div>
                  ))}
                </div>

                <button className="btn-add">+ 新增消息</button>
              </div>
            )}
          </div>
        </div>

        {/* 右側預覽區 */}
        <div className="editor-preview">
          <div className="preview-header">
            <span>📱 網站預覽</span>
            <div className="preview-device">
              <button className="device-btn active">🖥️</button>
              <button className="device-btn">📱</button>
            </div>
          </div>
          <div className="preview-container">
            <div
              className="preview-frame"
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'top center',
              }}
            >
              {/* 模擬網站預覽 */}
              <div className="preview-website" style={{ '--primary': currentTheme.primary, '--secondary': currentTheme.secondary, '--dark': currentTheme.dark }}>
                {/* Header */}
                <div className="pw-header">
                  <div className="pw-header-top"></div>
                  <div className="pw-header-main">
                    <div className="pw-logo">
                      <div className="pw-logo-icon">{data?.basic?.name?.charAt(0) || '宮'}</div>
                      <div className="pw-logo-text">
                        <span className="pw-temple-name">{data?.basic?.name}</span>
                        <span className="pw-temple-subtitle">{data?.basic?.subtitle}</span>
                      </div>
                    </div>
                    <div className="pw-nav">
                      <span>首頁</span>
                      <span>關於本殿</span>
                      <span>服務項目</span>
                      <span>最新消息</span>
                      <span>聯絡我們</span>
                    </div>
                  </div>
                </div>

                {/* Hero */}
                <div className="pw-hero">
                  {data?.carousel?.[0] && (
                    <>
                      <img src={data.carousel[0].image} alt="" />
                      <div className="pw-hero-overlay"></div>
                      <div className="pw-hero-content">
                        <div className="pw-hero-badge">三官大帝祖殿</div>
                        <h1>{data.carousel[0].title}</h1>
                        <p>{data.carousel[0].subtitle}</p>
                        <button>了解更多 →</button>
                      </div>
                    </>
                  )}
                </div>

                {/* Services */}
                <div className="pw-section pw-services">
                  <h2>服務項目</h2>
                  <div className="pw-services-grid">
                    {data?.services?.filter(s => s.enabled).slice(0, 4).map((s) => (
                      <div key={s.id} className="pw-service-card">
                        <div className="pw-service-icon">{getServiceIcon(s.icon)}</div>
                        <h4>{s.title}</h4>
                        <p>{s.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* News */}
                <div className="pw-section pw-news">
                  <h2>最新消息</h2>
                  <div className="pw-news-grid">
                    {data?.news?.slice(0, 2).map((n) => (
                      <div key={n.id} className="pw-news-card">
                        <img src={n.image} alt="" />
                        <div className="pw-news-content">
                          <span className="pw-news-date">{n.date}</span>
                          <h4>{n.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="pw-footer">
                  <div className="pw-footer-content">
                    <div className="pw-footer-info">
                      <strong>{data?.basic?.name}</strong>
                      <span>{data?.basic?.address}</span>
                      <span>{data?.basic?.phone}</span>
                    </div>
                    <div className="pw-footer-copyright">
                      © 2025 {data?.basic?.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 輔助函數
const getServiceIcon = (icon) => {
  const iconMap = { bulb: '💡', star: '⭐', book: '📚', safety: '🛡️', fire: '🔥', heart: '❤️', question: '❓', shield: '🛡️' };
  return iconMap[icon] || '⭐';
};

export default WebsiteSettings;
