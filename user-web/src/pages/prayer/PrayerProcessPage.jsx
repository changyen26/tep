/**
 * 祈福加持頁面
 * 參考：平安符打卡系統 PDF 第7頁第2張
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoCircleOutlined } from '@ant-design/icons';
import { message } from 'antd';
import './PrayerProcessPage.css';

const PrayerProcessPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 模擬祈福進度
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // 祈福完成，顯示成功訊息並跳轉
          setTimeout(() => {
            message.success('祈福加持完成！福報值已增加');
            navigate('/amulet');
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="prayer-process-page">
      {/* 背景裝飾 */}
      <div className="process-bg-pattern"></div>

      {/* 右上角資訊圖標 */}
      <div className="process-info-icon">
        <InfoCircleOutlined />
      </div>

      {/* 主要內容 */}
      <div className="process-content">
        {/* 標題 */}
        <h1 className="process-title">加持中...</h1>

        {/* 香爐動畫區域 */}
        <div className="burner-animation-section">
          {/* 彩色光環 */}
          <div className="rainbow-ring" style={{ '--progress': progress }}>
            <svg className="ring-svg" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B9D" />
                  <stop offset="25%" stopColor="#C371F5" />
                  <stop offset="50%" stopColor="#4E9AF1" />
                  <stop offset="75%" stopColor="#7BC8F5" />
                  <stop offset="100%" stopColor="#FF6B9D" />
                </linearGradient>
              </defs>
              <circle
                className="ring-progress"
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#rainbowGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="534"
                strokeDashoffset={534 - (534 * progress) / 100}
              />
            </svg>
          </div>

          {/* 香爐 */}
          <div className="burner-container">
            <div className="burner-glow-animation"></div>
            <div className="burner-model">
              <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
                {/* 香煙效果 */}
                <g className="incense-smoke">
                  <path d="M80 35 Q75 25 80 15" stroke="#BDA138" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
                  <path d="M75 35 Q70 25 75 15" stroke="#BDA138" strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
                  <path d="M85 35 Q90 25 85 15" stroke="#BDA138" strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
                </g>

                {/* 香爐圖示 */}
                <circle cx="80" cy="80" r="60" fill="url(#burnerGlow)" opacity="0.3"/>
                <ellipse cx="80" cy="60" rx="45" ry="10" fill="#D4B756"/>
                <path d="M35 60 L35 85 Q35 100 50 100 L110 100 Q125 100 125 85 L125 60 Z" fill="url(#burnerBody)"/>

                {/* 龜蛇裝飾 */}
                <g className="turtle-snake-decoration" opacity="0.6">
                  <path d="M40 75 L45 70 L50 75" stroke="#242428" strokeWidth="2" fill="none"/>
                  <path d="M110 75 L115 70 L120 75" stroke="#242428" strokeWidth="2" fill="none"/>
                </g>

                {/* 底座 */}
                <rect x="40" y="98" width="80" height="5" rx="2.5" fill="#8B7328"/>
                <rect x="45" y="102" width="70" height="4" rx="2" fill="#6B5620"/>

                <defs>
                  <radialGradient id="burnerGlow">
                    <stop offset="0%" stopColor="#D4B756"/>
                    <stop offset="100%" stopColor="#BDA138"/>
                  </radialGradient>
                  <linearGradient id="burnerBody" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#D4B756"/>
                    <stop offset="50%" stopColor="#BDA138"/>
                    <stop offset="100%" stopColor="#8B7328"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* 提示文字 */}
        <div className="process-messages">
          <div className="message-main">祈請上天賜予平安與福報</div>
          <div className="message-sub">將會自香爐上方繞過</div>
          <div className="message-note">禱告持符虔應爐</div>
        </div>

        {/* 進度百分比 */}
        <div className="progress-percentage">{Math.round(progress)}%</div>
      </div>
    </div>
  );
};

export default PrayerProcessPage;
