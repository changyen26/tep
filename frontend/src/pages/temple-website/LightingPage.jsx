/**
 * 點燈祈福頁面
 */
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './LightingPage.css';

const LightingPage = () => {
  const { mockData } = useOutletContext();
  const { lightingServices } = mockData;

  const [selectedLight, setSelectedLight] = useState(null);

  return (
    <div className="temple-lighting-page">
      {/* 頁面標題區 */}
      <div className="temple-page-header">
        <h1>點燈祈福</h1>
        <p>點燃光明，照耀前程，祈求平安順遂</p>
      </div>

      {/* 燈種選擇 */}
      <section className="lighting-selection-section">
        <div className="lighting-container">
          <div className="lighting-intro">
            <span className="intro-icon">💡</span>
            <h2>選擇您的祈福燈種</h2>
            <p>每盞明燈皆經本宮法師誦經加持，功德迴向，祈願靈驗</p>
          </div>

          <div className="lighting-grid">
            {lightingServices.map((light) => (
              <div
                key={light.id}
                className={`lighting-card ${selectedLight?.id === light.id ? 'selected' : ''} ${light.popular ? 'popular' : ''}`}
                onClick={() => setSelectedLight(light)}
              >
                {light.popular && (
                  <div className="popular-badge">
                    ⭐ 熱門
                  </div>
                )}
                <div className="lighting-card-header">
                  <h3 className="lighting-name">{light.name}</h3>
                  <div className="lighting-price">
                    <span className="price-currency">NT$</span>
                    <span className="price-amount">{light.price}</span>
                    <span className="price-duration">/{light.duration}</span>
                  </div>
                </div>
                <p className="lighting-desc">{light.description}</p>
                <div className="lighting-benefits">
                  {light.benefits?.map((benefit, index) => (
                    <div key={index} className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
                <button className="lighting-select-btn">
                  {selectedLight?.id === light.id ? '已選擇' : '選擇此燈'}
                </button>
              </div>
            ))}
          </div>

          {lightingServices.length === 0 && (
            <div className="lighting-empty">
              <p>請至後台設定點燈項目</p>
            </div>
          )}
        </div>
      </section>

      {/* 點燈流程 */}
      <section className="lighting-process-section">
        <div className="lighting-container">
          <h2 className="process-title">點燈流程</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h4>選擇燈種</h4>
              <p>依照您的祈願選擇適合的燈種</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h4>填寫資料</h4>
              <p>填寫點燈者姓名、生辰等資料</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h4>繳納油資</h4>
              <p>線上付款或至本宮現場繳費</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h4>法師誦經</h4>
              <p>由本宮法師誦經加持祈福</p>
            </div>
            <div className="process-step">
              <div className="step-number">5</div>
              <h4>功德迴向</h4>
              <p>功德迴向，庇佑信眾</p>
            </div>
          </div>
        </div>
      </section>

      {/* 注意事項 */}
      <section className="lighting-notice-section">
        <div className="lighting-container">
          <h2 className="notice-title">點燈須知</h2>
          <div className="notice-list">
            <div className="notice-item">
              <span className="notice-number">01</span>
              <p>點燈以農曆年度計算，自正月初一起至除夕止。</p>
            </div>
            <div className="notice-item">
              <span className="notice-number">02</span>
              <p>請提供正確的姓名、生辰資料，以利本宮為您祈福。</p>
            </div>
            <div className="notice-item">
              <span className="notice-number">03</span>
              <p>點燈完成後，本宮將發送確認通知。</p>
            </div>
            <div className="notice-item">
              <span className="notice-number">04</span>
              <p>如有任何問題，請洽本宮服務台。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      {selectedLight && (
        <div className="lighting-cta-bar">
          <div className="cta-content">
            <div className="cta-info">
              <span className="cta-label">已選擇：</span>
              <span className="cta-name">{selectedLight.name}</span>
              <span className="cta-price">NT$ {selectedLight.price}</span>
            </div>
            <button className="cta-btn">
              前往填寫資料
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightingPage;
