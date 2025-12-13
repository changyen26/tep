/**
 * 福報累積歷史頁面
 * 參考：平安符打卡系統 PDF 第7頁第4張
 */
import { InfoCircleOutlined } from '@ant-design/icons';
import './AmuletHistoryPage.css';

const AmuletHistoryPage = () => {
  // 模擬數據 - 每日福報累積
  const historyData = [
    { date: '12/2', points: 35 },
    { date: '12/2', points: 28 },
    { date: '12/2', points: 15 },
    { date: '12/2', points: 10 },
    { date: '12/2', points: 0 },
  ];

  const totalPoints = 86;
  const maxPoints = Math.max(...historyData.map(d => d.points));

  return (
    <div className="amulet-history-page">
      {/* 頂部背景裝飾 */}
      <div className="history-header-bg"></div>

      {/* 右上角資訊圖標 */}
      <div className="history-info-icon">
        <InfoCircleOutlined />
      </div>

      {/* 頂部福報值顯示 */}
      <div className="history-header">
        <div className="header-icon-container">
          <div className="header-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#BDA138" strokeWidth="2" />
              <path d="M20 8L23 16L31 17L25.5 22.5L27 31L20 26.5L13 31L14.5 22.5L9 17L17 16L20 8Z" fill="#BDA138" />
            </svg>
          </div>
          <div className="header-label">已累積福報值</div>
        </div>
        <div className="header-value">
          {totalPoints} <span className="header-unit">點</span>
        </div>
      </div>

      {/* 柱狀圖區域 */}
      <div className="chart-section">
        <div className="chart-container">
          {historyData.map((item, index) => {
            const height = maxPoints > 0 ? (item.points / maxPoints) * 100 : 0;
            return (
              <div key={index} className="chart-bar-wrapper">
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{ height: `${height}%` }}
                  >
                    <div className="chart-value">{item.points}</div>
                  </div>
                </div>
                <div className="chart-label">{item.date}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 累積福報時間軸說明 */}
      <div className="timeline-section">
        <h2 className="timeline-title">累積福報時間軸</h2>
        <div className="timeline-description">
          文字資訊文字資訊文字資訊文字資訊文字資訊文字資訊文字資訊文字資訊
          文字資訊文字資訊文字資訊文字資訊文字資訊文字資訊文字資訊文字資訊
          文字資訊文字資訊文字資訊文字資訊文字資訊文字資訊文字資訊文字資訊
          文字資訊文字資訊文字資訊文字資訊文字資訊文字資訊文字資訊文字資訊
        </div>
      </div>
    </div>
  );
};

export default AmuletHistoryPage;
