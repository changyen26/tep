/**
 * 輪播圖組件
 * 全寬、自動播放、標題覆蓋
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LeftOutlined, RightOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './HeroCarousel.css';

const HeroCarousel = ({ slides, basePath, autoPlayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // 自動播放
  useEffect(() => {
    if (!autoPlayInterval || slides.length <= 1) return;

    const timer = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlayInterval, goToNext, slides.length]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="hero-carousel">
      {/* 輪播圖片 */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="carousel-image"
          />
          <div className="carousel-overlay" />
        </div>
      ))}

      {/* 內容區 */}
      <div className="carousel-content">
        <h2 className="carousel-title">{slides[currentIndex]?.title}</h2>
        <p className="carousel-subtitle">{slides[currentIndex]?.subtitle}</p>
        {slides[currentIndex]?.link && (
          <Link
            to={`${basePath}${slides[currentIndex].link}`}
            className="carousel-btn"
          >
            了解更多 <ArrowRightOutlined />
          </Link>
        )}
      </div>

      {/* 左右箭頭 */}
      {slides.length > 1 && (
        <>
          <button className="carousel-arrow prev" onClick={goToPrev}>
            <LeftOutlined />
          </button>
          <button className="carousel-arrow next" onClick={goToNext}>
            <RightOutlined />
          </button>
        </>
      )}

      {/* 指示點 */}
      {slides.length > 1 && (
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
