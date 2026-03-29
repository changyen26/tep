/**
 * 廟宇網站 Header 組件
 * 深色背景、Logo、多層選單、固定置頂
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  MenuOutlined,
  CloseOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined
} from '@ant-design/icons';
import './Header.css';

const Header = ({ temple, navigation, basePath }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  return (
    <header className="temple-header">
      {/* 頂部資訊列 */}
      <div className="header-top">
        <div className="header-top-content">
          <div className="header-contact">
            <div className="header-contact-item">
              <PhoneOutlined />
              <span>{temple.phone}</span>
            </div>
            <div className="header-contact-item">
              <MailOutlined />
              <span>{temple.email}</span>
            </div>
            <div className="header-contact-item">
              <EnvironmentOutlined />
              <span>{temple.address}</span>
            </div>
          </div>
          <div className="header-social">
            {temple.socialMedia?.facebook && (
              <a
                href={temple.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FacebookOutlined />
              </a>
            )}
            {temple.socialMedia?.instagram && (
              <a
                href={temple.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <InstagramOutlined />
              </a>
            )}
            {temple.socialMedia?.youtube && (
              <a
                href={temple.socialMedia.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <YoutubeOutlined />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 主導覽列 */}
      <div className="header-main">
        <div className="header-main-content">
          <Link to={basePath} className="header-logo">
            {temple.logo ? (
              <img src={temple.logo} alt={temple.name} className="logo-image" />
            ) : (
              <div className="logo-placeholder">
                {temple.name?.charAt(0) || '宮'}
              </div>
            )}
            <div className="logo-text">
              <span className="logo-title">{temple.name}</span>
              <span className="logo-subtitle">{temple.subtitle}</span>
            </div>
          </Link>

          {/* 桌面版導覽 */}
          <nav className="header-nav">
            {navigation.map((item) => (
              <Link
                key={item.key}
                to={`${basePath}/${item.path}`}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 手機版選單按鈕 */}
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>

      {/* 手機版選單 */}
      <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        {navigation.map((item) => (
          <Link
            key={item.key}
            to={`${basePath}/${item.path}`}
            className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
