/**
 * 輪播圖組件
 * 全寬大圖、自動播放、標題覆蓋、深色漸層遮罩
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './HeroCarousel.css';

const HeroCarousel = ({ slides, basePath, autoPlayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 600);
  }, [slides.length, isAnimating]);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 600);
  }, [slides.length, isAnimating]);

  // 自動播放
  useEffect(() => {
    if (!autoPlayInterval || slides.length <= 1) return;

    const timer = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlayInterval, goToNext, slides.length]);

  if (!slides || slides.length === 0) {
    return (
      <div className="hero-carousel hero-empty">
        <div className="hero-empty-content">
          <span className="hero-empty-icon">🏛️</span>
          <h2>歡迎蒞臨</h2>
          <p>請至後台設定輪播圖片</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-carousel">
      {/* 輪播圖片 */}
      <div className="carousel-slides">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
          >
            <div className="carousel-image-wrapper">
              <img
                src={slide.image}
                alt={slide.title}
                className="carousel-image"
              />
            </div>
            <div className="carousel-overlay" />
          </div>
        ))}
      </div>

      {/* 內容區 */}
      <div className="carousel-content">
        <div className="carousel-content-inner">
          <div className="carousel-badge">三官大帝祖殿</div>
          <h1 className="carousel-title">{slides[currentIndex]?.title}</h1>
          <p className="carousel-subtitle">{slides[currentIndex]?.subtitle}</p>
          {slides[currentIndex]?.link && (
            <Link
              to={`${basePath}${slides[currentIndex].link}`}
              className="carousel-btn"
            >
              <span>了解更多</span>
              <span className="btn-arrow">→</span>
            </Link>
          )}
        </div>
      </div>

      {/* 裝飾元素 */}
      <div className="carousel-decoration">
        <div className="decoration-line left"></div>
        <div className="decoration-line right"></div>
      </div>

      {/* 左右箭頭 */}
      {slides.length > 1 && (
        <>
          <button className="carousel-arrow prev" onClick={goToPrev} aria-label="上一張">
            <span>❮</span>
          </button>
          <button className="carousel-arrow next" onClick={goToNext} aria-label="下一張">
            <span>❯</span>
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
              aria-label={`第 ${index + 1} 張`}
            />
          ))}
        </div>
      )}

      {/* 滾動提示 */}
      <div className="carousel-scroll-hint">
        <span className="scroll-icon">↓</span>
        <span className="scroll-text">向下探索</span>
      </div>
    </div>
  );
};

export default HeroCarousel;
