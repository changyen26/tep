/**
 * 廟宇首頁
 * 參考：平安符打卡系統 PDF 第6頁第2張
 */
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button } from 'antd';
import {
  EnvironmentOutlined,
  InfoCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import './TempleHomePage.css';

const TempleHomePage = () => {
  const navigate = useNavigate();

  // 模擬數據
  const templeData = {
    name: '松柏嶺受天宮',
    description: '松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800', // 廟宇圖片（placeholder）
  };

  const airQualityData = {
    pm25: 31,
    status: '空氣品質',
    location: '細懸浮微粒 PM2.5',
    unit: 'μg/m³'
  };

  const lunarCalendar = {
    year: 2026,
    month: 1,
    day: 1,
    lunarMonth: '正月',
    lunarDay: '初一',
    weekday: '星期四',
    zodiac: '星期四',
    suitable: ['嫁娶', '祭祀', '祈福'],
    avoid: ['動土', '修造']
  };

  return (
    <div className="temple-home-page">
      {/* 廟宇照片背景區域 */}
      <div
        className="temple-header"
        style={{ backgroundImage: `url(${templeData.imageUrl})` }}
      >
        <div className="temple-header-overlay">
          <h1 className="temple-name">{templeData.name}</h1>
          <p className="temple-description">{templeData.description}</p>
        </div>

        {/* 右上角資訊圖標 */}
        <div className="temple-info-icon">
          <InfoCircleOutlined />
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="temple-content">
        {/* 空氣品質與農曆日期並排 */}
        <Row gutter={12} style={{ marginBottom: 16 }}>
          {/* 空氣品質卡片 */}
          <Col span={12}>
            <Card className="air-quality-card" bordered={false}>
              <div className="air-quality-header">
                <span className="air-quality-label">{airQualityData.status}</span>
              </div>
              <div className="air-quality-value">
                {airQualityData.pm25}
              </div>
              <div className="air-quality-footer">
                <div className="air-quality-location">{airQualityData.location}</div>
                <div className="air-quality-unit">{airQualityData.unit}</div>
              </div>
            </Card>
          </Col>

          {/* 農曆日期卡片 */}
          <Col span={12}>
            <Card className="lunar-calendar-card" bordered={false}>
              <div className="lunar-header">
                <div className="lunar-month">{lunarCalendar.lunarMonth}</div>
                <div className="lunar-year">{lunarCalendar.year}</div>
              </div>
              <div className="lunar-day">{lunarCalendar.day}</div>
              <div className="lunar-footer">
                <div className="lunar-zodiac">{lunarCalendar.zodiac}</div>
                <div className="lunar-weekday">{lunarCalendar.weekday}</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 前往祈福按鈕 */}
        <div className="prayer-section">
          <Button
            className="prayer-button"
            size="large"
            block
            onClick={() => navigate('/prayer/instruction')}
          >
            <div className="prayer-button-content">
              <div className="incense-burner-icon">
                <FireOutlined style={{ fontSize: 48 }} />
              </div>
              <div className="prayer-text">前往祈福</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TempleHomePage;
