/**
 * 服務項目頁面
 */
import { useOutletContext, Link } from 'react-router-dom';
import {
  BulbOutlined,
  StarOutlined,
  BookOutlined,
  SafetyOutlined,
  FireOutlined,
  HeartOutlined,
  QuestionCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import './ServicesPage.css';

// 圖示映射
const iconMap = {
  bulb: <BulbOutlined />,
  star: <StarOutlined />,
  book: <BookOutlined />,
  safety: <SafetyOutlined />,
  fire: <FireOutlined />,
  heart: <HeartOutlined />,
  question: <QuestionCircleOutlined />,
  shield: <SafetyOutlined />
};

const ServicesPage = () => {
  const { basePath, mockData } = useOutletContext();
  const { services } = mockData;

  return (
    <div className="temple-services-page">
      {/* 頁面標題區 */}
      <div className="temple-page-header">
        <h1>服務項目</h1>
        <p>虔誠祈願，諸事圓滿</p>
      </div>

      {/* 內容區 */}
      <div className="services-page-content">
        <div className="services-container">
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} id={service.id} className="service-detail-card">
                <div className="service-detail-image">
                  <img src={service.image} alt={service.title} />
                  <div className="service-detail-icon">
                    {iconMap[service.icon] || <StarOutlined />}
                  </div>
                </div>
                <div className="service-detail-content">
                  <h3 className="service-detail-title">{service.title}</h3>
                  <p className="service-detail-desc">{service.description}</p>
                  <div className="service-detail-price">
                    <span className="price-label">費用：</span>
                    <span className="price-value">{service.price}</span>
                  </div>
                  <Link to={`${basePath}/lighting`} className="service-detail-btn">
                    立即祈福 <ArrowRightOutlined />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 服務說明 */}
      <section className="services-notice-section">
        <div className="services-container">
          <h2 className="notice-title">服務須知</h2>
          <div className="notice-grid">
            <div className="notice-card">
              <h4>服務時間</h4>
              <p>每日上午 6:00 至晚上 9:00</p>
              <p>法會期間另行公告</p>
            </div>
            <div className="notice-card">
              <h4>繳費方式</h4>
              <p>現場繳費（現金、信用卡）</p>
              <p>銀行轉帳匯款</p>
              <p>線上信用卡付款</p>
            </div>
            <div className="notice-card">
              <h4>注意事項</h4>
              <p>請攜帶身分證件</p>
              <p>填寫正確資料以利祈福</p>
              <p>如有疑問請洽服務台</p>
            </div>
            <div className="notice-card">
              <h4>聯絡我們</h4>
              <p>電話：049-258-1008</p>
              <p>傳真：049-258-1009</p>
              <p>信箱：service@songbailing.org.tw</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
