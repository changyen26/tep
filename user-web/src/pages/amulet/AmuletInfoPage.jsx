/**
 * 平安符資訊頁面
 * 參考：平安符打卡系統 PDF 第7頁第3張
 */
import { useNavigate } from 'react-router-dom';
import { Button, Progress } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import './AmuletInfoPage.css';

const AmuletInfoPage = () => {
  const navigate = useNavigate();

  // 模擬數據
  const amuletData = {
    level: 1,
    currentPoints: 86,
    nextLevelPoints: 100,
    totalPoints: 86,
    description: '【祈求順利】松柏嶺受天宮符令已一】',
  };

  // 計算進度百分比
  const progressPercent = (amuletData.currentPoints / amuletData.nextLevelPoints) * 100;

  return (
    <div className="amulet-info-page">
      {/* 頂部背景裝飾 */}
      <div className="amulet-header-bg"></div>

      {/* 右上角資訊圖標 */}
      <div className="amulet-info-icon">
        <InfoCircleOutlined />
      </div>

      {/* 平安符展示區域 */}
      <div className="amulet-display-section">
        {/* 平安符3D模型/圖片 */}
        <div className="amulet-model-container">
          <div className="amulet-model">
            <div className="amulet-card">
              <div className="amulet-text">平安符示意</div>
            </div>
          </div>
          <div className="amulet-glow"></div>
        </div>

        {/* 等級顯示 */}
        <div className="amulet-level">Lv.{amuletData.level}</div>
      </div>

      {/* 福報值資訊區域 */}
      <div className="amulet-info-section">
        {/* 進度條 */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label-left">Lv.{amuletData.level}</span>
            <span className="progress-label-right">Lv.{amuletData.level + 1}</span>
          </div>
          <Progress
            percent={progressPercent}
            strokeColor={{
              '0%': '#BDA138',
              '100%': '#D4B756',
            }}
            trailColor="rgba(255, 255, 255, 0.2)"
            showInfo={false}
            strokeWidth={12}
            className="amulet-progress"
          />
        </div>

        {/* 已累積福報值卡片 */}
        <div className="points-card">
          <div className="points-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#BDA138" strokeWidth="2" />
              <path d="M16 8L18.5 13.5L24 14.5L20 18.5L21 24L16 21L11 24L12 18.5L8 14.5L13.5 13.5L16 8Z" fill="#BDA138" />
            </svg>
          </div>
          <div className="points-content">
            <div className="points-label">已累積福報值</div>
            <div className="points-value">{amuletData.totalPoints} <span className="points-unit">點</span></div>
          </div>
        </div>

        {/* 說明文字 */}
        <div className="amulet-description">
          {amuletData.description}
        </div>

        {/* 查看歷史按鈕 */}
        <Button
          className="history-button"
          size="large"
          block
          onClick={() => navigate('/amulet/history')}
        >
          查看福報累積時間軸
        </Button>
      </div>
    </div>
  );
};

export default AmuletInfoPage;
