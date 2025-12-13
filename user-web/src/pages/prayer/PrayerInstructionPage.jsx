/**
 * 祈福說明頁面
 * 參考：平安符打卡系統 PDF 第7頁第1張
 */
import { useNavigate } from 'react-router-dom';
import { InfoCircleOutlined } from '@ant-design/icons';
import './PrayerInstructionPage.css';

const PrayerInstructionPage = () => {
  const navigate = useNavigate();

  // 祈福步驟說明
  const instructions = [
    '1. 請先確認廟宇位置並「打卡簽到」位置。',
    '2. 自身攜帶香由現場購買香爐虔安香。',
    '3. 雙手持持平安符，祈祝者應禮讚並誦讚。',
    '4. 誠摯恭祝香爐爐上方繞過，完成這讓加持。',
    '5. 面向神明宣告姓名、生辰與祈求內容。',
    '6. 在心中默禱並立願，以冀行願應您佑。',
  ];

  return (
    <div className="prayer-instruction-page">
      {/* 背景裝飾 */}
      <div className="prayer-bg-pattern"></div>

      {/* 右上角資訊圖標 */}
      <div className="prayer-info-icon">
        <InfoCircleOutlined />
      </div>

      {/* 主要內容 */}
      <div className="prayer-content">
        {/* 標題 */}
        <h1 className="prayer-title">祈福打卡步驟說明</h1>

        {/* 步驟列表 */}
        <div className="instruction-list">
          {instructions.map((instruction, index) => (
            <div key={index} className="instruction-item">
              {instruction}
            </div>
          ))}
        </div>

        {/* 香爐按鈕 */}
        <div className="incense-burner-section">
          <div className="burner-glow"></div>
          <div
            className="burner-button"
            onClick={() => navigate('/prayer/process')}
          >
            <div className="burner-icon">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                {/* 香爐圖示 - 簡化版 */}
                <circle cx="60" cy="60" r="50" fill="url(#burnerGradient)" opacity="0.3"/>
                <ellipse cx="60" cy="45" rx="35" ry="8" fill="#BDA138"/>
                <path d="M25 45 L25 65 Q25 75 35 75 L85 75 Q95 75 95 65 L95 45 Z" fill="url(#burnerBodyGradient)"/>
                <rect x="30" y="73" width="60" height="4" rx="2" fill="#8B7328"/>
                <rect x="35" y="76" width="50" height="3" rx="1.5" fill="#8B7328"/>
                <defs>
                  <linearGradient id="burnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4B756"/>
                    <stop offset="100%" stopColor="#BDA138"/>
                  </linearGradient>
                  <linearGradient id="burnerBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#D4B756"/>
                    <stop offset="50%" stopColor="#BDA138"/>
                    <stop offset="100%" stopColor="#8B7328"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="burner-text">進行祈福</div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="prayer-note">
          準備就緒後，請點選下方按鈕以進行祈福。
        </div>
      </div>
    </div>
  );
};

export default PrayerInstructionPage;
