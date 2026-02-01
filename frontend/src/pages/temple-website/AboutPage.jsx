/**
 * 關於本宮頁面
 */
import { useOutletContext } from 'react-router-dom';
import './AboutPage.css';

const AboutPage = () => {
  const { temple } = useOutletContext();

  return (
    <div className="temple-about-page">
      {/* 頁面標題區 */}
      <div className="temple-page-header">
        <h1>關於本宮</h1>
        <p>{temple.subtitle} · 神威顯赫 · 香火鼎盛</p>
      </div>

      {/* 簡介區 */}
      <section className="about-intro-section">
        <div className="about-container">
          <div className="about-intro-content">
            <div className="about-intro-image">
              <img
                src="https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=400&fit=crop"
                alt={temple.name}
              />
            </div>
            <div className="about-intro-text">
              <h2>{temple.name}</h2>
              <p className="about-intro-subtitle">{temple.subtitle}</p>
              <p className="about-intro-desc">{temple.description}</p>
              <div className="about-stats">
                <div className="about-stat-item">
                  <span className="stat-icon">🏛️</span>
                  <span className="stat-number">200+</span>
                  <span className="stat-label">年歷史</span>
                </div>
                <div className="about-stat-item">
                  <span className="stat-icon">👥</span>
                  <span className="stat-number">50萬+</span>
                  <span className="stat-label">年參拜人次</span>
                </div>
                <div className="about-stat-item">
                  <span className="stat-icon">🏯</span>
                  <span className="stat-number">100+</span>
                  <span className="stat-label">分靈宮廟</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 歷史沿革 */}
      <section className="about-history-section" id="history">
        <div className="about-container">
          <div className="about-section-header">
            <h2>歷史沿革</h2>
            <p>兩百餘年香火傳承</p>
          </div>
          <div className="about-history-content">
            <div className="history-text">
              {(temple.history || '').split('\n\n').map((paragraph, index) => (
                paragraph ? <p key={index}>{paragraph}</p> : null
              ))}
              {!temple.history && <p>請至後台設定廟宇歷史沿革。</p>}
            </div>
            <div className="history-timeline">
              <div className="timeline-item">
                <div className="timeline-year">1820</div>
                <div className="timeline-event">
                  <h4>創建</h4>
                  <p>清嘉慶年間創建，供奉三官大帝</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-year">1895</div>
                <div className="timeline-event">
                  <h4>首次擴建</h4>
                  <p>增建正殿與東西廂房</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-year">1978</div>
                <div className="timeline-event">
                  <h4>大規模重建</h4>
                  <p>改建為現今規模之三官寶殿</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-year">2024</div>
                <div className="timeline-event">
                  <h4>數位轉型</h4>
                  <p>推動線上服務，擴展數位弘法</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 主祀神尊 */}
      <section className="about-deity-section" id="deity">
        <div className="about-container">
          <div className="about-section-header light">
            <h2>主祀神尊</h2>
            <p>三官大帝</p>
          </div>
          <div className="about-deity-content">
            <div className="deity-image">
              <img
                src="https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=500&h=600&fit=crop"
                alt="三官大帝"
              />
            </div>
            <div className="deity-info">
              <h3>三官大帝</h3>
              <p className="deity-title">天官、地官、水官三界公</p>
              <p className="deity-desc">
                三官大帝，又稱三界公、三元大帝，分別為天官紫微大帝、地官清虛大帝、水官洞陰大帝。
                天官賜福、地官赦罪、水官解厄，掌管天地水三界，為道教重要神祇。
              </p>
              <p className="deity-desc">
                本殿供奉之三官大帝神像，靈驗非凡，香火鼎盛。每年農曆正月十五上元節（天官聖誕）、
                七月十五中元節（地官聖誕）、十月十五下元節（水官聖誕），各地信眾絡繹不絕前來朝拜。
              </p>
              <div className="deity-blessings">
                <h4>庇佑範圍</h4>
                <div className="blessing-tags">
                  <span className="blessing-tag">天官賜福</span>
                  <span className="blessing-tag">地官赦罪</span>
                  <span className="blessing-tag">水官解厄</span>
                  <span className="blessing-tag">消災祈福</span>
                  <span className="blessing-tag">闔家平安</span>
                  <span className="blessing-tag">事業順利</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 榮譽與認證 */}
      <section className="about-awards-section">
        <div className="about-container">
          <div className="about-section-header">
            <h2>榮譽與認證</h2>
            <p>各界肯定與支持</p>
          </div>
          <div className="awards-grid">
            <div className="award-card">
              <span className="award-icon">🏆</span>
              <h4>績優宗教團體</h4>
              <p>內政部頒發</p>
            </div>
            <div className="award-card">
              <span className="award-icon">🏆</span>
              <h4>環境整潔優良</h4>
              <p>台南市政府</p>
            </div>
            <div className="award-card">
              <span className="award-icon">🏆</span>
              <h4>傳統廟宇保存</h4>
              <p>文化部認證</p>
            </div>
            <div className="award-card">
              <span className="award-icon">🏆</span>
              <h4>社會公益楷模</h4>
              <p>台灣宗教聯合會</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
