/**
 * 推播通知管理 - 通知詳情
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Notifications.css';

// Mock 資料
const mockNotifications = {
  1: {
    id: 1,
    title: '上元天官賜福法會通知',
    content: '信眾您好，本殿將於農曆正月十五舉辦上元天官賜福法會，誠邀您蒞臨參與。\n\n活動時間：農曆正月十五 上午9:00\n活動地點：本殿正殿\n\n歡迎攜家帶眷同來參拜，三官大帝庇佑闔家平安！\n\n三官寶殿 敬上',
    channels: ['line', 'app'],
    targetAudience: '全部信眾',
    targetCount: 1250,
    sentCount: 1180,
    openRate: 68,
    clickRate: 23,
    status: 'sent',
    scheduledAt: null,
    sentAt: '2026-01-10T09:00:00',
    createdAt: '2026-01-08T14:30:00',
    stats: {
      line: { sent: 890, opened: 612, clicked: 198 },
      app: { sent: 290, opened: 189, clicked: 73 },
    },
  },
  2: {
    id: 2,
    title: '光明燈續點提醒',
    content: '親愛的信眾，您的光明燈將於下月到期，如需續點請至本殿服務處辦理，或透過線上系統申請。\n\n感謝您長期護持，三官大帝保佑您平安順遂！\n\n三官寶殿 敬上',
    channels: ['line'],
    targetAudience: '光明燈即將到期',
    targetCount: 85,
    sentCount: 85,
    openRate: 82,
    clickRate: 45,
    status: 'sent',
    scheduledAt: null,
    sentAt: '2026-01-20T10:00:00',
    createdAt: '2026-01-19T16:00:00',
    stats: {
      line: { sent: 85, opened: 70, clicked: 38 },
    },
  },
  3: {
    id: 3,
    title: '春節期間開放時間公告',
    content: '各位信眾新年好！春節期間（除夕至初五）本殿開放時間調整如下：\n\n除夕：06:00 - 02:00（跨年）\n初一至初三：05:00 - 22:00\n初四至初五：06:00 - 21:00\n\n歡迎十方信眾蒞臨參拜，恭祝新春如意！\n\n三官寶殿 敬上',
    channels: ['line', 'app'],
    targetAudience: '全部信眾',
    targetCount: 1250,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    status: 'scheduled',
    scheduledAt: '2026-01-28T08:00:00',
    sentAt: null,
    createdAt: '2026-01-25T11:00:00',
    stats: {},
  },
  4: {
    id: 4,
    title: '元宵節活動邀請',
    content: '元宵佳節將至，本殿特舉辦猜燈謎活動，歡迎闘家蒞臨同樂...',
    channels: ['app'],
    targetAudience: '活躍信眾',
    targetCount: 420,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    status: 'draft',
    scheduledAt: null,
    sentAt: null,
    createdAt: '2026-01-26T09:30:00',
    stats: {},
  },
};

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

const NotificationDetail = () => {
  const { templeId, notificationId } = useParams();
  const navigate = useNavigate();

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const templeInfo = {
    name: '三官寶殿',
  };

  useEffect(() => {
    setTimeout(() => {
      setNotification(mockNotifications[notificationId] || null);
      setLoading(false);
    }, 300);
  }, [notificationId]);

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

  const handleBack = () => {
    navigate(`/temple-admin/${templeId}/notifications`);
  };

  const handleEdit = () => {
    navigate(`/temple-admin/${templeId}/notifications/${notificationId}/edit`);
  };

  const handleResend = () => {
    if (window.confirm('確定要重新發送此推播嗎？')) {
      alert('推播已重新發送');
    }
  };

  const handleCancel = () => {
    if (window.confirm('確定要取消此排程推播嗎？')) {
      alert('已取消排程');
      navigate(`/temple-admin/${templeId}/notifications`);
    }
  };

  const handleDelete = () => {
    if (window.confirm('確定要刪除此推播嗎？此操作無法復原。')) {
      alert('推播已刪除');
      navigate(`/temple-admin/${templeId}/notifications`);
    }
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-state">載入中...</div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="notifications-container">
        <div className="empty-state">找不到此推播通知</div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>推播詳情</h2>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleBack}>
            返回列表
          </button>
          {notification.status === 'draft' && (
            <button className="btn-primary" onClick={handleEdit}>
              編輯
            </button>
          )}
          {notification.status === 'scheduled' && (
            <button className="btn-danger" onClick={handleCancel}>
              取消排程
            </button>
          )}
          {notification.status === 'sent' && (
            <button className="btn-secondary" onClick={handleResend}>
              重新發送
            </button>
          )}
        </div>
      </div>

      <div className="detail-content">
        {/* 基本資訊 */}
        <div className="detail-card">
          <div className="detail-card-header">
            <h3>{notification.title}</h3>
            <span className={`status-badge ${statusColors[notification.status]}`}>
              {statusLabels[notification.status]}
            </span>
          </div>
          <div className="detail-body">
            <div className="message-preview">
              <pre>{notification.content}</pre>
            </div>
            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-label">發送管道</span>
                <span className="meta-value">
                  {notification.channels.map((ch) => (
                    <span key={ch} className={`channel-badge ${ch}`}>
                      {ch === 'line' ? 'LINE' : 'APP'}
                    </span>
                  ))}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">目標客群</span>
                <span className="meta-value">{notification.targetAudience}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">目標人數</span>
                <span className="meta-value">{notification.targetCount.toLocaleString()} 人</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">建立時間</span>
                <span className="meta-value">{formatDateTime(notification.createdAt)}</span>
              </div>
              {notification.scheduledAt && (
                <div className="meta-item">
                  <span className="meta-label">排程時間</span>
                  <span className="meta-value">{formatDateTime(notification.scheduledAt)}</span>
                </div>
              )}
              {notification.sentAt && (
                <div className="meta-item">
                  <span className="meta-label">發送時間</span>
                  <span className="meta-value">{formatDateTime(notification.sentAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 發送統計 */}
        {notification.status === 'sent' && (
          <div className="detail-card">
            <div className="detail-card-header">
              <h3>發送統計</h3>
            </div>
            <div className="stats-overview">
              <div className="stat-box">
                <div className="stat-box-value">{notification.sentCount.toLocaleString()}</div>
                <div className="stat-box-label">已發送</div>
              </div>
              <div className="stat-box">
                <div className="stat-box-value">{notification.openRate}%</div>
                <div className="stat-box-label">開信率</div>
              </div>
              <div className="stat-box">
                <div className="stat-box-value">{notification.clickRate}%</div>
                <div className="stat-box-label">點擊率</div>
              </div>
            </div>

            {/* 分管道統計 */}
            <div className="channel-stats">
              {notification.channels.includes('line') && notification.stats.line && (
                <div className="channel-stat-card">
                  <div className="channel-stat-header">
                    <span className="channel-badge line">LINE</span>
                  </div>
                  <div className="channel-stat-body">
                    <div className="channel-stat-item">
                      <span>發送</span>
                      <strong>{notification.stats.line.sent}</strong>
                    </div>
                    <div className="channel-stat-item">
                      <span>開啟</span>
                      <strong>{notification.stats.line.opened}</strong>
                    </div>
                    <div className="channel-stat-item">
                      <span>點擊</span>
                      <strong>{notification.stats.line.clicked}</strong>
                    </div>
                  </div>
                </div>
              )}
              {notification.channels.includes('app') && notification.stats.app && (
                <div className="channel-stat-card">
                  <div className="channel-stat-header">
                    <span className="channel-badge app">APP</span>
                  </div>
                  <div className="channel-stat-body">
                    <div className="channel-stat-item">
                      <span>發送</span>
                      <strong>{notification.stats.app.sent}</strong>
                    </div>
                    <div className="channel-stat-item">
                      <span>開啟</span>
                      <strong>{notification.stats.app.opened}</strong>
                    </div>
                    <div className="channel-stat-item">
                      <span>點擊</span>
                      <strong>{notification.stats.app.clicked}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 預覽 */}
        <div className="detail-card">
          <div className="detail-card-header">
            <h3>訊息預覽</h3>
          </div>
          <div className="preview-section" style={{ padding: 0 }}>
            {notification.channels.includes('line') && (
              <div className="preview-column">
                <h4>LINE</h4>
                <div className="line-preview">
                  <div className="line-chat-bubble">
                    <div className="line-sender">
                      <div className="line-avatar">{templeInfo.name.charAt(0)}</div>
                      <span className="line-name">{templeInfo.name}</span>
                    </div>
                    <div className="line-message">
                      <div className="line-title">{notification.title}</div>
                      <div className="line-content">{notification.content}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {notification.channels.includes('app') && (
              <div className="preview-column">
                <h4>APP</h4>
                <div className="app-preview">
                  <div className="app-notification">
                    <div className="app-notif-header">
                      <div className="app-icon">{templeInfo.name.charAt(0)}</div>
                      <div className="app-notif-meta">
                        <span className="app-name">{templeInfo.name}</span>
                        <span className="app-time">
                          {notification.sentAt ? formatDateTime(notification.sentAt) : '排程中'}
                        </span>
                      </div>
                    </div>
                    <div className="app-notif-title">{notification.title}</div>
                    <div className="app-notif-content">
                      {notification.content.length > 100
                        ? notification.content.substring(0, 100) + '...'
                        : notification.content}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 操作按鈕 */}
        {notification.status === 'draft' && (
          <div className="detail-actions">
            <button className="btn-ghost" onClick={handleDelete}>
              刪除草稿
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDetail;
