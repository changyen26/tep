/**
 * 聯絡我們頁面
 */
import { useOutletContext } from 'react-router-dom';
import './ContactPage.css';

const ContactPage = () => {
  const { temple } = useOutletContext();

  return (
    <div className="temple-contact-page">
      {/* 頁面標題區 */}
      <div className="temple-page-header">
        <h1>聯絡我們</h1>
        <p>歡迎蒞臨本宮參拜或來電洽詢</p>
      </div>

      {/* 聯絡資訊區 */}
      <section className="contact-info-section">
        <div className="contact-container">
          <div className="contact-grid">
            {/* 聯絡方式 */}
            <div className="contact-card main-card">
              <h3>聯絡方式</h3>
              <div className="contact-items">
                <div className="contact-item">
                  <div className="contact-icon">📍</div>
                  <div className="contact-text">
                    <span className="label">地址</span>
                    <span className="value">{temple.address}</span>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div className="contact-text">
                    <span className="label">電話</span>
                    <span className="value">{temple.phone}</span>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">✉️</div>
                  <div className="contact-text">
                    <span className="label">信箱</span>
                    <span className="value">{temple.email}</span>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">🕐</div>
                  <div className="contact-text">
                    <span className="label">開放時間</span>
                    <span className="value">{temple.openingHours}</span>
                  </div>
                </div>
              </div>

              {/* 社群連結 */}
              <div className="social-section">
                <h4>關注我們</h4>
                <div className="social-links">
                  {temple.socialMedia?.facebook && (
                    <a
                      href={temple.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      📘
                    </a>
                  )}
                  {temple.socialMedia?.instagram && (
                    <a
                      href={temple.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      📷
                    </a>
                  )}
                  {temple.socialMedia?.youtube && (
                    <a
                      href={temple.socialMedia.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      📺
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 地圖 */}
            <div className="contact-card map-card">
              <h3>交通位置</h3>
              <div className="map-placeholder">
                <span className="map-icon">📍</span>
                <p>Google 地圖</p>
                <span>臺南市白河區外角里4鄰外角41號</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 交通指南 */}
      <section className="traffic-section" id="traffic">
        <div className="contact-container">
          <h2 className="section-title">交通指南</h2>
          <div className="traffic-grid">
            <div className="traffic-card">
              <div className="traffic-icon">🚗</div>
              <h4>自行開車</h4>
              <ul>
                <li>國道3號 → 白河交流道下 → 往白河市區 → 依指標往外角里</li>
                <li>國道1號 → 新營交流道下 → 台1線往白河 → 依指標前往</li>
              </ul>
            </div>
            <div className="traffic-card">
              <div className="traffic-icon">🚌</div>
              <h4>大眾運輸</h4>
              <ul>
                <li>高鐵：至嘉義站轉乘客運至白河</li>
                <li>台鐵：至新營站轉乘公車</li>
                <li>客運：搭乘往白河班車</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 進香團預約 */}
      <section className="pilgrimage-booking-section">
        <div className="contact-container">
          <div className="booking-card">
            <div className="booking-content">
              <h3>進香團預約</h3>
              <p>歡迎各地宮廟、神壇團體來電預約進香，本宮將安排接待事宜。</p>
              <div className="booking-info">
                <div className="booking-item">
                  <span className="label">預約專線：</span>
                  <span className="value">06-685-1234</span>
                </div>
                <div className="booking-item">
                  <span className="label">傳真報名：</span>
                  <span className="value">06-685-1235</span>
                </div>
                <div className="booking-item">
                  <span className="label">服務時間：</span>
                  <span className="value">每日 08:00 - 17:00</span>
                </div>
              </div>
            </div>
            <div className="booking-action">
              <button className="booking-btn">
                📞 立即預約
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 意見回饋 */}
      <section className="feedback-section">
        <div className="contact-container">
          <h2 className="section-title">意見回饋</h2>
          <div className="feedback-form-wrapper">
            <form className="feedback-form">
              <div className="form-row">
                <div className="form-group">
                  <label>姓名 *</label>
                  <input type="text" placeholder="請輸入姓名" />
                </div>
                <div className="form-group">
                  <label>聯絡電話 *</label>
                  <input type="tel" placeholder="請輸入電話" />
                </div>
              </div>
              <div className="form-group">
                <label>電子信箱</label>
                <input type="email" placeholder="請輸入信箱" />
              </div>
              <div className="form-group">
                <label>意見內容 *</label>
                <textarea rows={5} placeholder="請輸入您的意見或建議..." />
              </div>
              <button type="submit" className="submit-btn">
                送出意見
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
