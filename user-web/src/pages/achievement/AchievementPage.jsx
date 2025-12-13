/**
 * 成就系統頁面
 * 參考：平安符打卡系統 PDF 第8頁第2張
 */
import { useState } from 'react';
import { TagOutlined, TrophyOutlined } from '@ant-design/icons';
import './AchievementPage.css';

const AchievementPage = () => {
  // 模擬數據 - 成就列表
  const achievements = [
    {
      id: 1,
      title: '如持第一個爐',
      description: '完成第一次祈福',
      icon: '🔥',
      unlocked: true,
      type: 'temple',
      unlockedAt: '2025-12-01',
    },
    {
      id: 2,
      title: '第一次祈福順利',
      description: '成功完成第一次祈福儀式',
      icon: '🙏',
      unlocked: true,
      type: 'prayer',
      unlockedAt: '2025-12-01',
    },
    {
      id: 3,
      title: '連續三天打卡',
      description: '連續三天到廟宇打卡',
      icon: '📅',
      unlocked: false,
      type: 'checkin',
    },
    {
      id: 4,
      title: '福報達人',
      description: '累積福報值達到100點',
      icon: '⭐',
      unlocked: false,
      type: 'points',
    },
    {
      id: 5,
      title: '平安符升級',
      description: '平安符等級達到Lv.5',
      icon: '🎖️',
      unlocked: false,
      type: 'amulet',
    },
    {
      id: 6,
      title: '虔誠信徒',
      description: '累計祈福次數達到10次',
      icon: '🏆',
      unlocked: false,
      type: 'prayer',
    },
  ];

  // 選中的成就（用於大圖展示）
  const [selectedAchievement, setSelectedAchievement] = useState(
    achievements.find(a => a.unlocked) || achievements[0]
  );

  // 統計數據
  const stats = {
    unlockedTypes: new Set(achievements.filter(a => a.unlocked).map(a => a.type)).size,
    totalUnlocked: achievements.filter(a => a.unlocked).length,
  };

  return (
    <div className="achievement-page">
      {/* 頂部背景裝飾 */}
      <div className="achievement-header-bg">
        <div className="bg-pattern"></div>
      </div>

      {/* 主要內容 */}
      <div className="achievement-content">
        {/* 已達成標籤 */}
        {selectedAchievement.unlocked && (
          <div className="unlocked-badge">
            <TrophyOutlined /> 已達成
          </div>
        )}

        {/* NFT 展示區域 */}
        <div className="nft-display-section">
          <div className="nft-card">
            <div className="nft-card-inner">
              <div className="nft-icon">{selectedAchievement.icon}</div>
              <div className="nft-title">{selectedAchievement.title}</div>
              <div className="nft-description">{selectedAchievement.description}</div>
              {selectedAchievement.unlocked && (
                <div className="nft-date">
                  解鎖於 {selectedAchievement.unlockedAt}
                </div>
              )}
              {!selectedAchievement.unlocked && (
                <div className="nft-locked">
                  <span className="lock-icon">🔒</span>
                  <span>尚未解鎖</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NFT 收藏展示標題 */}
        <div className="collection-title">NFT收藏展示</div>

        {/* 統計數據 */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">
              <TagOutlined />
            </div>
            <div className="stat-content">
              <div className="stat-label">已達成</div>
              <div className="stat-value">
                {stats.unlockedTypes} <span className="stat-unit">種類</span>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <TrophyOutlined />
            </div>
            <div className="stat-content">
              <div className="stat-label">已達成</div>
              <div className="stat-value">
                {stats.totalUnlocked} <span className="stat-unit">次</span>
              </div>
            </div>
          </div>
        </div>

        {/* 成就網格 */}
        <div className="achievement-grid">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-card ${
                achievement.unlocked ? 'unlocked' : 'locked'
              } ${selectedAchievement.id === achievement.id ? 'selected' : ''}`}
              onClick={() => setSelectedAchievement(achievement)}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-title">{achievement.title}</div>
              {!achievement.unlocked && (
                <div className="achievement-lock">
                  <span>🔒</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementPage;
