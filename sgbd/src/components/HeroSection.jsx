import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './HeroSection.css'

const slides = [
  {
    id: 1,
    title: '白河三官寶殿',
    subtitle: '天官賜福 · 地官赦罪 · 水官解厄',
    description: '主祀三官大帝，護佑信眾闔家平安、事業順遂',
    buttonText: '認識本宮',
    buttonLink: '/about',
  },
  {
    id: 2,
    title: '點燈祈福',
    subtitle: '光明燈 · 文昌燈 · 財神燈',
    description: '點亮心燈，照亮前程，祈求神明庇佑',
    buttonText: '了解服務',
    buttonLink: '/services',
  },
  {
    id: 3,
    title: '三元節慶典',
    subtitle: '上元 · 中元 · 下元',
    description: '歡迎信眾參與年度盛大祭典活動',
    buttonText: '活動資訊',
    buttonLink: '/events',
  },
]

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <section className="hero">
      <div className="hero-slides">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-subtitle">{slide.subtitle}</p>
              <p className="hero-description">{slide.description}</p>
              <Link to={slide.buttonLink} className="btn btn-primary hero-btn">
                {slide.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`切換至第 ${index + 1} 張`}
          />
        ))}
      </div>

      <div className="hero-decoration">
        <span className="decoration-left">☯</span>
        <span className="decoration-right">☯</span>
      </div>
    </section>
  )
}

export default HeroSection
