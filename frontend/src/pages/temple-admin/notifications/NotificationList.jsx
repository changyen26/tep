/**
 * 推播通知管理 - 列表頁面
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Notifications.css';

// Mock 資料
const mockNotifications = [
  {
    id: 1,
    title: '上元天官賜福法會通知',
    content: '信眾您好，本殿將於農曆正月十五舉辦上元天官賜福法會，誠邀您蒞臨參與...',
    channels: ['line', 'app'],
    targetAudience: '全部信眾',
    targetCount: 1250,
    sentCount: 1180,
    openRate: 68,
    status: 'sent',
    scheduledAt: null,
    sentAt: '2026-01-10T09:00:00',
    createdAt: '2026-01-08T14:30:00',
  },
  {
    id: 2,
    title: '光明燈續點提醒',
    content: '親愛的信眾，您的光明燈將於下月到期，如需續點請至本殿服務處辦理...',
    channels: ['line'],
    targetAudience: '光明燈即將到期',
    targetCount: 85,
    sentCount: 85,
    openRate: 82,
    status: 'sent',
    scheduledAt: null,
    sentAt: '2026-01-20T10:00:00',
    createdAt: '2026-01-19T16:00:00',
  },
  {
    id: 3,
    title: '春節期間開放時間公告',
    content: '各位信眾新年好！春節期間（除夕至初五）本殿開放時間調整如下...',
    channels: ['line', 'app'],
    targetAudience: '全部信眾',
    targetCount: 1250,
    sentCount: 0,
    openRate: 0,
    status: 'scheduled',
    scheduledAt: '2026-01-28T08:00:00',
    sentAt: null,
    createdAt: '2026-01-25T11:00:00',
  },
  {
    id: 4,
    title: '元宵節活動邀請',
    content: '元宵佳節將至，本殿特舉辦猜燈謎活動，歡迎闔家蒞臨同樂...',
    channels: ['app'],
    targetAudience: '活躍信眾',
    targetCount: 420,
    sentCount: 0,
    openRate: 0,
    status: 'draft',
    scheduledAt: null,
    sentAt: null,
    createdAt: '2026-01-26T09:30:00',
  },
];

const statusLabels = {
  draft: '草稿',
  scheduled: '排程中',
  sent: '已發送',
  failed: '發送失敗',
};

const statusColors = {
  draft: 'gray',
  scheduled: 'blue',
  sent: 'green',
  failed: 'red',
};

const NotificationList = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 300);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    const matchStatus = statusFilter === 'all' || n.status === statusFilter;
    const matchKeyword = !keyword ||
      n.title.includes(keyword) ||
      n.content.includes(keyword);
    return matchStatus && matchKeyword;
  });

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChannelIcons = (channels) => {
    return channels.map((ch) => (
      <span key={ch} className={`channel-badge ${ch}`}>
        {ch === 'line' ? 'LINE' : 'APP'}
      </span>
    ));
  };

  const handleCreate = () => {
    navigate(`/temple-admin/${templeId}/notifications/new`);
  };

  const handleView = (id) => {
    navigate(`/temple-admin/${templeId}/notifications/${id}`);
  };

  const handleTemplates = () => {
    navigate(`/temple-admin/${templeId}/notifications/templates`);
  };

  // 統計
  const stats = {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === 'sent').length,
    scheduled: notifications.filter((n) => n.status === 'scheduled').length,
    totalSent: notifications.reduce((sum, n) => sum + n.sentCount, 0),
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>推播通知管理</h2>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleTemplates}>
            範本管理
          </button>
          <button className="btn-primary" onClick={handleCreate}>
            建立推播
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="notif-stats-cards">
        <div className="notif-stat-card">
          <div className="notif-stat-value">{stats.total}</div>
          <div className="notif-stat-label">總推播數</div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-value">{stats.sent}</div>
          <div className="notif-stat-label">已發送</div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-value">{stats.scheduled}</div>
          <div className="notif-stat-label">排程中</div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-value">{stats.totalSent.toLocaleString()}</div>
          <div className="notif-stat-label">總發送人次</div>
        </div>
      </div>

      {/* 篩選 */}
      <div className="notifications-filters">
        <div className="filter-group">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            全部
          </button>
          <button
            className={`filter-btn ${statusFilter === 'sent' ? 'active' : ''}`}
            onClick={() => setStatusFilter('sent')}
          >
            已發送
          </button>
          <button
            className={`filter-btn ${statusFilter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('scheduled')}
          >
            排程中
          </button>
          <button
            className={`filter-btn ${statusFilter === 'draft' ? 'active' : ''}`}
            onClick={() => setStatusFilter('draft')}
          >
            草稿
          </button>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="搜尋標題或內容..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="loading-state">載入中...</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="empty-state">
          {keyword || statusFilter !== 'all' ? '沒有符合條件的推播' : '尚無推播記錄'}
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className="notification-card"
              onClick={() => handleView(notif.id)}
            >
              <div className="notif-card-header">
                <div className="notif-title">{notif.title}</div>
                <span className={`status-badge ${statusColors[notif.status]}`}>
                  {statusLabels[notif.status]}
                </span>
              </div>
              <div className="notif-content-preview">{notif.content}</div>
              <div className="notif-card-footer">
                <div className="notif-meta">
                  <div className="notif-channels">{getChannelIcons(notif.channels)}</div>
                  <span className="notif-audience">{notif.targetAudience}</span>
                  <span className="notif-count">
                    {notif.status === 'sent'
                      ? `已發送 ${notif.sentCount} 人`
                      : `目標 ${notif.targetCount} 人`}
                  </span>
                </div>
                <div className="notif-time">
                  {notif.status === 'sent' && `發送時間：${formatDateTime(notif.sentAt)}`}
                  {notif.status === 'scheduled' && `排程時間：${formatDateTime(notif.scheduledAt)}`}
                  {notif.status === 'draft' && `建立時間：${formatDateTime(notif.createdAt)}`}
                </div>
              </div>
              {notif.status === 'sent' && (
                <div className="notif-stats-bar">
                  <div className="stat-item">
                    <span className="stat-label">開信率</span>
                    <span className="stat-value">{notif.openRate}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
