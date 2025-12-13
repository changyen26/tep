/**
 * 設定頁面
 * 參考：平安符打卡系統 PDF 第8頁第4張
 */
import { useNavigate } from 'react-router-dom';
import {
  TagOutlined,
  BellOutlined,
  HistoryOutlined,
  SettingOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();

  // 設定選項
  const settingsOptions = [
    {
      id: 'bind-amulet',
      icon: <TagOutlined />,
      title: '綁定平安符',
      description: '綁定實體平安符以獲取福報',
      onClick: () => {
        message.info('綁定平安符功能開發中');
      },
    },
    {
      id: 'notification',
      icon: <BellOutlined />,
      title: '通知',
      description: '管理推播通知設定',
      onClick: () => {
        message.info('通知設定功能開發中');
      },
    },
    {
      id: 'history',
      icon: <HistoryOutlined />,
      title: '過往紀錄',
      description: '查看祈福與打卡紀錄',
      onClick: () => {
        message.info('過往紀錄功能開發中');
      },
    },
    {
      id: 'other',
      icon: <SettingOutlined />,
      title: '其他??',
      description: '更多設定選項',
      onClick: () => {
        message.info('其他設定功能開發中');
      },
    },
  ];

  return (
    <div className="settings-page">
      {/* 背景裝飾 */}
      <div className="settings-bg-pattern">
        {/* 蛇圖案裝飾 */}
        <svg className="snake-decoration" width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path
            d="M20 60 Q30 40 40 60 T60 60 Q70 80 80 60 T100 60"
            stroke="#BDA138"
            strokeWidth="4"
            fill="none"
            opacity="0.3"
            strokeLinecap="round"
          />
          <circle cx="20" cy="60" r="6" fill="#BDA138" opacity="0.3" />
          <circle cx="100" cy="60" r="6" fill="#BDA138" opacity="0.3" />
        </svg>

        {/* 齒輪圖案裝飾 */}
        <svg className="gear-decoration" width="100" height="100" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="20" stroke="#BDA138" strokeWidth="3" opacity="0.2" />
          <circle cx="50" cy="50" r="30" stroke="#BDA138" strokeWidth="2" opacity="0.15" />
          <circle cx="50" cy="50" r="40" stroke="#BDA138" strokeWidth="1" opacity="0.1" />
        </svg>
      </div>

      {/* 主要內容 */}
      <div className="settings-content">
        {/* 標題 */}
        <h1 className="settings-title">設定</h1>

        {/* 設定選項列表 */}
        <div className="settings-list">
          {settingsOptions.map((option) => (
            <div
              key={option.id}
              className="setting-item"
              onClick={option.onClick}
            >
              <div className="setting-icon">{option.icon}</div>
              <div className="setting-content">
                <div className="setting-title">{option.title}</div>
                <div className="setting-description">{option.description}</div>
              </div>
              <div className="setting-arrow">
                <RightOutlined />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
