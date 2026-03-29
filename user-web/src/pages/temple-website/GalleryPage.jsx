/**
 * 相簿頁面
 */
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FilterOutlined, ZoomInOutlined, CloseOutlined } from '@ant-design/icons';
import './GalleryPage.css';

const GalleryPage = () => {
  const { mockData } = useOutletContext();
  const { gallery } = mockData;

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxImage, setLightboxImage] = useState(null);

  // 取得所有分類
  const categories = ['all', ...new Set(gallery.map(item => item.category))];

  // 過濾照片
  const filteredGallery = selectedCategory === 'all'
    ? gallery
    : gallery.filter(item => item.category === selectedCategory);

  const openLightbox = (item) => {
    setLightboxImage(item);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <div className="temple-gallery-page">
      {/* 頁面標題區 */}
      <div className="temple-page-header">
        <h1>相簿</h1>
        <p>本宮風采與祭典活動精彩紀錄</p>
      </div>

      {/* 內容區 */}
      <div className="gallery-page-content">
        <div className="gallery-container">
          {/* 分類篩選 */}
          <div className="gallery-filter">
            <FilterOutlined />
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

          {/* 相簿網格 */}
          <div className="gallery-grid">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                className="gallery-item"
                onClick={() => openLightbox(item)}
              >
                <img src={item.image} alt={item.title} />
                <div className="gallery-item-overlay">
                  <ZoomInOutlined className="zoom-icon" />
                  <h4 className="gallery-item-title">{item.title}</h4>
                  <span className="gallery-item-category">{item.category}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 無照片提示 */}
          {filteredGallery.length === 0 && (
            <div className="gallery-empty">
              <p>目前沒有相關照片</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="gallery-lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <CloseOutlined />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage.image} alt={lightboxImage.title} />
            <div className="lightbox-info">
              <h3>{lightboxImage.title}</h3>
              <p>{lightboxImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
