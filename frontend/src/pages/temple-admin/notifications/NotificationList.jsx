/**
 * 推播通知管理 - 列表頁面
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

const NotificationList = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadNotifications();
  }, [templeId, statusFilter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.notifications.list(templeId, {
        status: statusFilter,
        pageSize: 100,
      });
      if (res.data?.success) {
        setNotifications(res.data.data.items || []);
      }
    } catch (err) {
      console.error('載入通知列表失敗', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (!keyword) return true;
    return n.title.includes(keyword) || n.content.includes(keyword);
  });

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChannelIcons = (channels = []) =>
    channels.map((ch) => (
      <span key={ch} className={`channel-badge ${ch}`}>
        {ch === 'line' ? 'LINE' : 'APP'}
      </span>
    ));

  const stats = {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === 'sent').length,
    scheduled: notifications.filter((n) => n.status === 'scheduled').length,
    totalSent: notifications.reduce((sum, n) => sum + (n.sentCount || 0), 0),
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>推播通知管理</h2>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate(`/temple-admin/${templeId}/notifications/templates`)}>
            範本管理
          </button>
          <button className="btn-primary" onClick={() => navigate(`/temple-admin/${templeId}/notifications/new`)}>
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
          {['all', 'sent', 'scheduled', 'draft'].map((s) => (
            <button
              key={s}
              className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? '全部' : statusLabels[s]}
            </button>
          ))}
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
              onClick={() => navigate(`/temple-admin/${templeId}/notifications/${notif.id}`)}
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
                  <span className="notif-audience">
                    {audienceLabels[notif.targetAudience] || notif.targetAudience}
                  </span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
