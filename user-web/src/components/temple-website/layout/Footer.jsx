/**
 * 廟宇網站 Footer 組件
 * Logo、聯絡資訊、社群連結
 */
import { Link } from 'react-router-dom';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined
} from '@ant-design/icons';
import './Footer.css';

const Footer = ({ temple, footerLinks, basePath }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="temple-footer">
      <div className="footer-main">
        {/* 廟宇資訊區 */}
        <div className="footer-temple-info">
          <Link to={basePath} className="footer-logo">
            {temple.logo ? (
              <img src={temple.logo} alt={temple.name} className="footer-logo-image" />
            ) : (
              <div className="footer-logo-placeholder">
                {temple.name?.charAt(0) || '宮'}
              </div>
            )}
            <div className="footer-logo-text">
              <span className="footer-temple-name">{temple.name}</span>
              <span className="footer-temple-subtitle">{temple.subtitle}</span>
            </div>
          </Link>

          <p className="footer-description">
            {temple.description}
          </p>

          <div className="footer-contact-list">
            <div className="footer-contact-item">
              <EnvironmentOutlined />
              <span>{temple.address}</span>
            </div>
            <div className="footer-contact-item">
              <PhoneOutlined />
              <span>{temple.phone}</span>
            </div>
            <div className="footer-contact-item">
              <MailOutlined />
              <span>{temple.email}</span>
            </div>
            <div className="footer-contact-item">
              <ClockCircleOutlined />
              <span>{temple.openingHours}</span>
            </div>
          </div>

          <div className="footer-social">
            {temple.socialMedia?.facebook && (
              <a
                href={temple.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                <FacebookOutlined />
              </a>
            )}
            {temple.socialMedia?.instagram && (
              <a
                href={temple.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                <InstagramOutlined />
              </a>
            )}
            {temple.socialMedia?.youtube && (
              <a
                href={temple.socialMedia.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                <YoutubeOutlined />
              </a>
            )}
          </div>
        </div>

        {/* 連結區塊 */}
        {footerLinks.map((section, index) => (
          <div key={index} className="footer-links-section">
            <h4 className="footer-links-title">{section.title}</h4>
            <div className="footer-links-list">
              {section.links.map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  to={`${basePath}/${link.path}`}
                  className="footer-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 底部版權區 */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-copyright">
            &copy; {currentYear} {temple.name}. All Rights Reserved.
            {' | '}
            Powered by <a href="#">廟宇數位服務平台</a>
          </div>
          <div className="footer-legal">
            <a href="#" className="footer-legal-link">隱私權政策</a>
            <a href="#" className="footer-legal-link">使用條款</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
