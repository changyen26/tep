/**
 * 最新消息區塊組件
 * 卡片式列表、日期標籤
 */
import { Link } from 'react-router-dom';
import './NewsSection.css';

const NewsSection = ({ news, basePath, showCount = 3 }) => {
  const displayNews = news?.slice(0, showCount) || [];

  if (displayNews.length === 0) {
    return null;
  }

  return (
    <section className="news-section">
      <div className="news-section-inner">
        {/* 區塊標題 */}
        <div className="news-section-header">
          <h2>最新消息</h2>
          <p>掌握本宮最新動態與活動資訊</p>
        </div>

        {/* 新聞列表 */}
        <div className="news-grid">
          {displayNews.map((item) => (
            <Link
              key={item.id}
              to={`${basePath}/news/${item.id}`}
              className="news-card"
            >
              <div className="news-card-image">
                <img src={item.image} alt={item.title} />
                <span className="news-card-category">{item.category}</span>
              </div>
              <div className="news-card-content">
                <div className="news-card-date">
                  <span className="date-icon">📅</span>
                  {item.date}
                </div>
                <h3 className="news-card-title">{item.title}</h3>
                <p className="news-card-summary">{item.summary}</p>
                <span className="news-card-more">
                  閱讀更多 →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* 查看更多按鈕 */}
        <div className="news-section-footer">
          <Link to={`${basePath}/news`} className="news-more-btn">
            查看全部消息 →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
