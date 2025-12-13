/**
 * 個人帳號頁面
 * 參考：平安符打卡系統 PDF 第8頁第1張
 */
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
  TeamOutlined,
  CreditCardOutlined,
  RightOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();

  // 模擬用戶資料
  const userData = {
    name: '王曉明',
    nickname: '信友',
    avatar: null, // 可替換為實際頭像 URL
  };

  // 個人帳號選項
  const profileOptions = [
    {
      id: 'personal-info',
      icon: <UserOutlined />,
      title: '個人資訊',
      description: '編輯姓名、生日等基本資料',
      onClick: () => {
        message.info('個人資訊功能開發中');
      },
    },
    {
      id: 'account',
      icon: <LockOutlined />,
      title: '帳號與密碼',
      description: '修改帳號、密碼等安全設定',
      onClick: () => {
        message.info('帳號與密碼功能開發中');
      },
    },
    {
      id: 'privacy',
      icon: <SafetyOutlined />,
      title: '資料與隱私',
      description: '管理隱私設定與資料使用',
      onClick: () => {
        message.info('資料與隱私功能開發中');
      },
    },
    {
      id: 'family',
      icon: <TeamOutlined />,
      title: '家人好友系統?',
      description: '管理家人好友關係',
      onClick: () => {
        message.info('家人好友系統功能開發中');
      },
    },
    {
      id: 'payment',
      icon: <CreditCardOutlined />,
      title: '付款與訂閱?',
      description: '管理付款方式與訂閱服務',
      onClick: () => {
        message.info('付款與訂閱功能開發中');
      },
    },
  ];

  return (
    <div className="profile-page">
      {/* 右上角資訊圖標 */}
      <div className="profile-info-icon">
        <InfoCircleOutlined />
      </div>

      {/* 頂部用戶資訊區域 */}
      <div className="profile-header">
        {/* 用戶頭像 */}
        <div className="user-avatar">
          {userData.avatar ? (
            <img src={userData.avatar} alt={userData.name} />
          ) : (
            <div className="avatar-placeholder">
              <UserOutlined />
            </div>
          )}
        </div>

        {/* 用戶名稱 */}
        <div className="user-info">
          <div className="user-name">{userData.name}</div>
          <div className="user-nickname">{userData.nickname}</div>
        </div>

        {/* 問候語 */}
        <div className="greeting-text">
          【祝您有個美好的一天不】<br />
          祝您身體健康 福運滿滿
        </div>
      </div>

      {/* 個人帳號選項列表 */}
      <div className="profile-options">
        {profileOptions.map((option) => (
          <div
            key={option.id}
            className="profile-option-item"
            onClick={option.onClick}
          >
            <div className="option-icon">{option.icon}</div>
            <div className="option-content">
              <div className="option-title">{option.title}</div>
              <div className="option-description">{option.description}</div>
            </div>
            <div className="option-arrow">
              <RightOutlined />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
