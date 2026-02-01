/**
 * 最新消息頁面
 */
import { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import './NewsPage.css';

const NewsPage = () => {
  const { basePath, mockData } = useOutletContext();
  const { news } = mockData;

  const [selectedCategory, setSelectedCategory] = useState('all');

  // 取得所有分類
  const categories = ['all', ...new Set(news.map(item => item.category))];

  // 過濾新聞
  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter(item => item.category === selectedCategory);

  return (
    <div className="temple-news-page">
      {/* 頁面標題區 */}
      <div className="temple-page-header">
        <h1>最新消息</h1>
        <p>掌握本宮最新動態與活動資訊</p>
      </div>

      {/* 內容區 */}
      <div className="news-page-content">
        <div className="news-container">
          {/* 分類篩選 */}
          <div className="news-filter">
            <span className="filter-icon">🔍</span>
            <div className="filter-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? '全部' : category}
                </button>
              ))}
            </div>
          </div>

          {/* 新聞列表 */}
          <div className="news-list">
            {filteredNews.map((item) => (
              <Link
                key={item.id}
                to={`${basePath}/news/${item.id}`}
                className="news-list-item"
              >
                <div className="news-item-image">
                  <img src={item.image} alt={item.title} />
                  <span className="news-item-category">{item.category}</span>
                </div>
                <div className="news-item-content">
                  <div className="news-item-date">
                    <span className="date-icon">📅</span>
                    {item.date}
                  </div>
                  <h3 className="news-item-title">{item.title}</h3>
                  <p className="news-item-summary">{item.summary}</p>
                  <span className="news-item-more">
                    閱讀更多 →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* 無資料提示 */}
          {filteredNews.length === 0 && (
            <div className="news-empty">
              <p>目前沒有相關消息</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
