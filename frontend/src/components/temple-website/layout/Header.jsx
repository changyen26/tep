/**
 * 廟宇網站 Header 組件
 * 參考受天宮設計 - 深色背景、多層選單、固定置頂
 */
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ temple, navigation, basePath }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  // 監聽滾動
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    const currentPath = location.pathname.replace(basePath, '').replace(/^\//, '');
    if (path === '' && currentPath === '') return true;
    if (path !== '' && currentPath.startsWith(path)) return true;
    return false;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // 導覽選單分組（含下拉選單）
  const navGroups = [
    { key: 'home', label: '首頁', path: '' },
    {
      key: 'about',
      label: '認識本殿',
      path: 'about',
      children: [
        { key: 'about-intro', label: '本殿介紹', path: 'about' },
        { key: 'about-history', label: '歷史沿革', path: 'about#history' },
        { key: 'about-deity', label: '主祀神尊', path: 'about#deity' },
      ]
    },
    {
      key: 'services',
      label: '信眾服務',
      path: 'services',
      children: [
        { key: 'lighting', label: '點燈祈福', path: 'lighting' },
        { key: 'services-list', label: '服務項目', path: 'services' },
      ]
    },
    { key: 'events', label: '活動一覽', path: 'events' },
    { key: 'news', label: '最新消息', path: 'news' },
    { key: 'gallery', label: '相簿', path: 'gallery' },
    { key: 'contact', label: '聯絡我們', path: 'contact' },
  ];

  return (
    <header className={`temple-header ${scrolled ? 'scrolled' : ''}`}>
      {/* 頂部裝飾線 */}
      <div className="header-decoration"></div>

      {/* 頂部資訊列 */}
      <div className="header-top">
        <div className="header-top-content">
          <div className="header-contact">
            <div className="header-contact-item">
              <span className="contact-icon">📞</span>
              <span>{temple.phone}</span>
            </div>
            <div className="header-contact-item">
              <span className="contact-icon">📍</span>
              <span>{temple.address}</span>
            </div>
          </div>
          <div className="header-social">
            {temple.socialMedia?.facebook && (
              <a href={temple.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link" title="Facebook">
                <span>f</span>
              </a>
            )}
            {temple.socialMedia?.line && (
              <a href={temple.socialMedia.line} target="_blank" rel="noopener noreferrer" className="social-link" title="LINE">
                <span>L</span>
              </a>
            )}
            {temple.socialMedia?.youtube && (
              <a href={temple.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="social-link" title="YouTube">
                <span>▶</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 主導覽列 */}
      <div className="header-main">
        <div className="header-main-content">
          {/* Logo 區域 */}
          <Link to={basePath} className="header-logo">
            <div className="logo-icon-wrapper">
              {temple.logo ? (
                <img src={temple.logo} alt={temple.name} className="logo-image" />
              ) : (
                <div className="logo-placeholder">
                  <span className="logo-char">{temple.name?.charAt(0) || '宮'}</span>
                </div>
              )}
            </div>
            <div className="logo-text">
              <span className="logo-title">{temple.name}</span>
              <span className="logo-subtitle">{temple.subtitle}</span>
            </div>
          </Link>

          {/* 桌面版導覽 */}
          <nav className="header-nav">
            {navGroups.map((item) => (
              <div
                key={item.key}
                className="nav-item"
                onMouseEnter={() => item.children && setActiveDropdown(item.key)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={`${basePath}/${item.path}`}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.label}
                  {item.children && <span className="nav-arrow">▾</span>}
                </Link>

                {/* 下拉選單 */}
                {item.children && (
                  <div className={`nav-dropdown ${activeDropdown === item.key ? 'show' : ''}`}>
                    {item.children.map((child) => (
                      <Link
                        key={child.key}
                        to={`${basePath}/${child.path}`}
                        className="dropdown-link"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* 右側功能區 */}
          <div className="header-actions">
            <Link to={`${basePath}/lighting`} className="header-cta">
              點燈祈福
            </Link>
          </div>

          {/* 手機版選單按鈕 */}
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* 手機版選單 */}
      <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        {navGroups.map((item) => (
          <div key={item.key} className="mobile-nav-group">
            <Link
              to={`${basePath}/${item.path}`}
              className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {item.label}
            </Link>
            {item.children && (
              <div className="mobile-nav-children">
                {item.children.map((child) => (
                  <Link
                    key={child.key}
                    to={`${basePath}/${child.path}`}
                    className="mobile-nav-child"
                    onClick={closeMobileMenu}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="mobile-nav-cta">
          <Link to={`${basePath}/lighting`} className="mobile-cta-btn" onClick={closeMobileMenu}>
            點燈祈福
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
