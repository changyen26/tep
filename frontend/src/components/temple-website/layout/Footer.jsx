/**
 * 廟宇網站 Footer 組件
 * 參考受天宮設計 - 深色背景、金色裝飾、完整資訊
 */
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = ({ temple, footerLinks, basePath }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="temple-footer">
      {/* 金色頂部裝飾線 */}
      <div className="footer-decoration">
        <div className="decoration-pattern"></div>
      </div>

      <div className="footer-main">
        <div className="footer-container">
          {/* 廟宇資訊區 */}
          <div className="footer-temple-info">
            <Link to={basePath} className="footer-logo">
              {temple.logo ? (
                <img src={temple.logo} alt={temple.name} className="footer-logo-image" />
              ) : (
                <div className="footer-logo-placeholder">
                  <span>{temple.name?.charAt(0) || '宮'}</span>
                </div>
              )}
              <div className="footer-logo-text">
                <span className="footer-temple-name">{temple.name}</span>
                <span className="footer-temple-subtitle">{temple.subtitle}</span>
              </div>
            </Link>

            <p className="footer-description">
              {temple.description?.slice(0, 100)}...
            </p>

            <div className="footer-social">
              {temple.socialMedia?.facebook && (
                <a href={temple.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="footer-social-link" title="Facebook">
                  <span>f</span>
                </a>
              )}
              {temple.socialMedia?.line && (
                <a href={temple.socialMedia.line} target="_blank" rel="noopener noreferrer" className="footer-social-link" title="LINE">
                  <span>L</span>
                </a>
              )}
              {temple.socialMedia?.instagram && (
                <a href={temple.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="footer-social-link" title="Instagram">
                  <span>📷</span>
                </a>
              )}
              {temple.socialMedia?.youtube && (
                <a href={temple.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="footer-social-link" title="YouTube">
                  <span>▶</span>
                </a>
              )}
            </div>
          </div>

          {/* 快速連結 */}
          <div className="footer-links-section">
            <h4 className="footer-links-title">
              <span className="title-icon">🏛️</span>
              認識本殿
            </h4>
            <div className="footer-links-list">
              <Link to={`${basePath}/about`} className="footer-link">本殿介紹</Link>
              <Link to={`${basePath}/about#history`} className="footer-link">歷史沿革</Link>
              <Link to={`${basePath}/about#deity`} className="footer-link">主祀神尊</Link>
              <Link to={`${basePath}/gallery`} className="footer-link">相簿</Link>
            </div>
          </div>

          <div className="footer-links-section">
            <h4 className="footer-links-title">
              <span className="title-icon">🙏</span>
              信眾服務
            </h4>
            <div className="footer-links-list">
              <Link to={`${basePath}/lighting`} className="footer-link">點燈祈福</Link>
              <Link to={`${basePath}/services`} className="footer-link">服務項目</Link>
              <Link to={`${basePath}/events`} className="footer-link">活動一覽</Link>
              <Link to={`${basePath}/news`} className="footer-link">最新消息</Link>
            </div>
          </div>

          {/* 聯絡資訊 */}
          <div className="footer-contact-section">
            <h4 className="footer-links-title">
              <span className="title-icon">📍</span>
              聯絡資訊
            </h4>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <span className="contact-label">地址</span>
                <span className="contact-value">{temple.address}</span>
              </div>
              <div className="footer-contact-item">
                <span className="contact-label">電話</span>
                <span className="contact-value">{temple.phone}</span>
              </div>
              {temple.email && (
                <div className="footer-contact-item">
                  <span className="contact-label">信箱</span>
                  <span className="contact-value">{temple.email}</span>
                </div>
              )}
              <div className="footer-contact-item">
                <span className="contact-label">開放</span>
                <span className="contact-value">{temple.openingHours}</span>
              </div>
            </div>

            <Link to={`${basePath}/contact`} className="footer-contact-btn">
              聯絡我們 →
            </Link>
          </div>
        </div>
      </div>

      {/* 底部版權區 */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-copyright">
            © {currentYear} {temple.name}. All Rights Reserved.
          </div>
          <div className="footer-powered">
            Powered by <a href="#">廟宇數位服務平台</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
