/**
 * 服務項目網格組件
 * 4欄圖示+標題+說明
 */
import { Link } from 'react-router-dom';
import './ServiceGrid.css';

// Emoji 圖示映射
const iconMap = {
  bulb: '💡',
  star: '⭐',
  book: '📚',
  safety: '🛡️',
  fire: '🔥',
  heart: '❤️',
  question: '❓',
  shield: '🛡️'
};

const ServiceGrid = ({ services, basePath, showCount = 8 }) => {
  const displayServices = services?.slice(0, showCount) || [];

  if (displayServices.length === 0) {
    return null;
  }

  return (
    <section className="service-grid-section">
      <div className="service-grid-inner">
        {/* 區塊標題 */}
        <div className="service-grid-header">
          <h2>服務項目</h2>
          <p>虔誠祈願，諸事圓滿</p>
        </div>

        {/* 服務網格 */}
        <div className="service-grid">
          {displayServices.map((service) => (
            <Link
              key={service.id}
              to={`${basePath}/services#${service.id}`}
              className="service-card"
            >
              <div className="service-card-icon">
                {iconMap[service.icon] || '⭐'}
              </div>
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-desc">{service.description}</p>
              <span className="service-card-price">{service.price}</span>
            </Link>
          ))}
        </div>

        {/* 查看更多按鈕 */}
        <div className="service-grid-footer">
          <Link to={`${basePath}/services`} className="service-more-btn">
            查看全部服務 →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServiceGrid;
