/**
 * 推播通知管理 - 通知詳情
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/templeAdminApi';
import './Notifications.css';

const statusLabels = {
  draft: '草稿',
  scheduled: '排程中',
  sending: '發送中',
  sent: '已發送',
  failed: '發送失敗',
};

const statusColors = {
  draft: 'gray',
  scheduled: 'blue',
  sending: 'blue',
  sent: 'green',
  failed: 'red',
};

const audienceLabels = {
  all: '全部信眾',
  active: '活躍信眾',
  dormant: '休眠信眾',
  new: '新信眾',
  lamp_expiring: '點燈即將到期',
  birthday_month: '本月壽星',
  event_registered: '特定活動報名者',
  custom: '自訂條件',
};

const NotificationDetail = () => {
  const { templeId, notificationId } = useParams();
  const navigate = useNavigate();

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadNotification();
  }, [notificationId]);

  const loadNotification = async () => {
    setLoading(true);
    try {
      const res = await api.notifications.get(notificationId);
      if (res.data?.success) {
        setNotification(res.data.data);
      }
    } catch (err) {
      console.error('載入通知失敗', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleSend = async () => {
    if (!window.confirm('確定要立即發送此推播嗎？')) return;
    setSending(true);
    try {
      const res = await api.notifications.send(notificationId);
      if (res.data?.success) {
        setNotification(res.data.data);
        alert('推播已發送！');
      } else {
        alert('發送失敗：' + (res.data?.message || '未知錯誤'));
      }
    } catch (err) {
      alert('發送失敗，請稍後再試');
    } finally {
      setSending(false);
    }
  };

  const handleCancelSchedule = async () => {
    if (!window.confirm('確定要取消此排程推播嗎？')) return;
    try {
      const res = await api.notifications.cancelSchedule(notificationId);
      if (res.data?.success) {
        setNotification(res.data.data);
      }
    } catch (err) {
      alert('取消排程失敗');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除此草稿嗎？此操作無法復原。')) return;
    try {
      await api.notifications.delete(notificationId);
      navigate(`/temple-admin/${templeId}/notifications`);
    } catch (err) {
      alert('刪除失敗');
    }
  };

  if (loading) {
    return <div className="notifications-container"><div className="loading-state">載入中...</div></div>;
  }

  if (!notification) {
    return <div className="notifications-container"><div className="empty-state">找不到此推播通知</div></div>;
  }

  const stats = notification.stats || {};

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>推播詳情</h2>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate(`/temple-admin/${templeId}/notifications`)}>
            返回列表
          </button>
          {(notification.status === 'draft' || notification.status === 'scheduled') && (
            <button className="btn-primary" onClick={handleSend} disabled={sending}>
              {sending ? '發送中...' : '立即發送'}
            </button>
          )}
          {notification.status === 'scheduled' && (
            <button className="btn-danger" onClick={handleCancelSchedule}>
              取消排程
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
                  {(notification.channels || []).map((ch) => (
                    <span key={ch} className={`channel-badge ${ch}`}>
                      {ch === 'line' ? 'LINE' : 'APP'}
                    </span>
                  ))}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">目標客群</span>
                <span className="meta-value">
                  {audienceLabels[notification.targetAudience] || notification.targetAudience}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">目標人數</span>
                <span className="meta-value">{(notification.targetCount || 0).toLocaleString()} 人</span>
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
            <div className="detail-card-header"><h3>發送統計</h3></div>
            <div className="stats-overview">
              <div className="stat-box">
                <div className="stat-box-value">{(notification.sentCount || 0).toLocaleString()}</div>
                <div className="stat-box-label">已發送</div>
              </div>
            </div>
            <div className="channel-stats">
              {['line', 'app'].map((ch) =>
                (notification.channels || []).includes(ch) && stats[ch] ? (
                  <div key={ch} className="channel-stat-card">
                    <div className="channel-stat-header">
                      <span className={`channel-badge ${ch}`}>{ch === 'line' ? 'LINE' : 'APP'}</span>
                    </div>
                    <div className="channel-stat-body">
                      <div className="channel-stat-item"><span>發送</span><strong>{stats[ch].sent}</strong></div>
                      <div className="channel-stat-item"><span>開啟</span><strong>{stats[ch].opened}</strong></div>
                      <div className="channel-stat-item"><span>點擊</span><strong>{stats[ch].clicked}</strong></div>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* 訊息預覽 */}
        <div className="detail-card">
          <div className="detail-card-header"><h3>訊息預覽</h3></div>
          <div className="preview-section" style={{ padding: 0 }}>
            {(notification.channels || []).includes('line') && (
              <div className="preview-column">
                <h4>LINE</h4>
                <div className="line-preview">
                  <div className="line-chat-bubble">
                    <div className="line-message">
                      <div className="line-title">{notification.title}</div>
                      <div className="line-content">{notification.content}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {(notification.channels || []).includes('app') && (
              <div className="preview-column">
                <h4>APP</h4>
                <div className="app-preview">
                  <div className="app-notification">
                    <div className="app-notif-title">{notification.title}</div>
                    <div className="app-notif-content">
                      {(notification.content || '').substring(0, 100)}
                      {(notification.content || '').length > 100 ? '...' : ''}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 草稿操作 */}
        {notification.status === 'draft' && (
          <div className="detail-actions">
            <button className="btn-ghost" onClick={handleDelete}>刪除草稿</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDetail;
