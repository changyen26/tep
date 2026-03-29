/**
 * 關於本宮頁面
 */
import { useOutletContext } from 'react-router-dom';
import {
  HistoryOutlined,
  BankOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons';
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
                  <HistoryOutlined />
                  <span className="stat-number">280+</span>
                  <span className="stat-label">年歷史</span>
                </div>
                <div className="about-stat-item">
                  <TeamOutlined />
                  <span className="stat-number">100萬+</span>
                  <span className="stat-label">年參拜人次</span>
                </div>
                <div className="about-stat-item">
                  <BankOutlined />
                  <span className="stat-number">300+</span>
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
              {temple.history.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="history-timeline">
              <div className="timeline-item">
                <div className="timeline-year">1745</div>
                <div className="timeline-event">
                  <h4>創建</h4>
                  <p>清乾隆十年創建，供奉北極玄天上帝</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-year">1850</div>
                <div className="timeline-event">
                  <h4>首次擴建</h4>
                  <p>增建前殿與東西護室</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-year">1960</div>
                <div className="timeline-event">
                  <h4>大規模重建</h4>
                  <p>改建為現今規模之宏偉廟宇</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-year">2020</div>
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
            <p>北極玄天上帝</p>
          </div>
          <div className="about-deity-content">
            <div className="deity-image">
              <img
                src="https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=500&h=600&fit=crop"
                alt="玄天上帝"
              />
            </div>
            <div className="deity-info">
              <h3>玄天上帝</h3>
              <p className="deity-title">北方真武大帝</p>
              <p className="deity-desc">
                玄天上帝，又稱北極真武大帝、北方黑帝，為道教護法神祇，掌管北方，主水德。
                傳說中玄天上帝修道成仙，能降妖除魔，護佑蒼生。
              </p>
              <p className="deity-desc">
                本宮供奉之玄天上帝神像，靈驗非凡，香火鼎盛。每年農曆三月初三玄天上帝聖誕，
                各地信眾絡繹不絕前來朝拜，祈求平安順遂。
              </p>
              <div className="deity-blessings">
                <h4>庇佑範圍</h4>
                <div className="blessing-tags">
                  <span className="blessing-tag">消災解厄</span>
                  <span className="blessing-tag">鎮宅保平安</span>
                  <span className="blessing-tag">驅邪避煞</span>
                  <span className="blessing-tag">事業順利</span>
                  <span className="blessing-tag">身體健康</span>
                  <span className="blessing-tag">學業進步</span>
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
              <TrophyOutlined />
              <h4>績優宗教團體</h4>
              <p>內政部頒發</p>
            </div>
            <div className="award-card">
              <TrophyOutlined />
              <h4>環境整潔優良</h4>
              <p>南投縣政府</p>
            </div>
            <div className="award-card">
              <TrophyOutlined />
              <h4>古蹟保存貢獻</h4>
              <p>文化部認證</p>
            </div>
            <div className="award-card">
              <TrophyOutlined />
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
