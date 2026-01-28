import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listEvents } from '../../../services/templeEventsService';
import './Events.css';

const EventList = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  // 狀態管理
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 篩選與分頁
  const [statusFilter, setStatusFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // 計算進度條樣式類別
  const getProgressClass = (registered, capacity) => {
    if (!capacity || capacity === 0) return 'low';
    const percentage = (registered / capacity) * 100;
    if (percentage >= 100) return 'full';
    if (percentage >= 90) return 'high';
    if (percentage >= 70) return 'medium';
    return 'low';
  };

  // 計算剩餘時間
  const getTimeRemaining = (dateStr) => {
    if (!dateStr) return null;
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target - now;

    if (diff <= 0) return { text: '已截止', type: 'expired' };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 7) return { text: `${days} 天後截止`, type: 'normal' };
    if (days > 1) return { text: `剩 ${days} 天`, type: 'warning' };
    if (days === 1) return { text: '明天截止', type: 'warning' };
    if (hours > 0) return { text: `剩 ${hours} 小時`, type: 'urgent' };
    return { text: '即將截止', type: 'urgent' };
  };

  // 產生活動狀態標籤
  const getEventTags = (event) => {
    const tags = [];
    const registered = event.registeredCount || 0;
    const capacity = event.capacity || 0;
    const percentage = capacity > 0 ? (registered / capacity) * 100 : 0;

    // 名額相關標籤
    if (percentage >= 100) {
      tags.push({ label: '已額滿', type: 'urgent', icon: '🔴' });
    } else if (percentage >= 90) {
      tags.push({ label: '即將額滿', type: 'warning', icon: '🟡' });
    }

    // 時間相關標籤
    if (event.status === 'published' && event.signupEndAt) {
      const timeInfo = getTimeRemaining(event.signupEndAt);
      if (timeInfo && timeInfo.type === 'urgent') {
        tags.push({ label: '快截止', type: 'urgent', icon: '⏰' });
      }
    }

    // 活動即將開始
    if (event.status === 'published' && event.startAt) {
      const startTime = getTimeRemaining(event.startAt);
      if (startTime && startTime.type === 'warning') {
        tags.push({ label: '即將開始', type: 'info', icon: '📅' });
      }
    }

    return tags;
  };

  // 載入活動列表
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        temple_id: templeId, // 傳遞 temple_id 給後端
        status: statusFilter,
        q: keyword,
        page: currentPage,
        pageSize,
      };

      const response = await listEvents(params);

      if (response.success) {
        setEvents(response.data.events || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError(response.message || '載入活動列表失敗');
      }
    } catch (err) {
      console.error('載入活動列表失敗:', err);
      setError('載入活動列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 篩選或分頁變更時重新載入
  useEffect(() => {
    fetchEvents();
  }, [statusFilter, keyword, currentPage]);

  // 狀態顯示設定
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: '草稿', className: 'status-draft' },
      published: { label: '已發布', className: 'status-published' },
      closed: { label: '已截止', className: 'status-closed' },
      canceled: { label: '已取消', className: 'status-canceled' },
    };

    const config = statusConfig[status] || { label: status, className: '' };
    return (
      <span className={`status-badge ${config.className}`}>{config.label}</span>
    );
  };

  // 格式化日期時間
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

  // 處理新增按鈕
  const handleCreate = () => {
    navigate(`/temple-admin/${templeId}/events/new`);
  };

  // 處理查看詳情
  const handleView = (eventId) => {
    navigate(`/temple-admin/${templeId}/events/${eventId}`);
  };

  // 處理編輯
  const handleEdit = (eventId) => {
    navigate(`/temple-admin/${templeId}/events/${eventId}/edit`);
  };

  // 處理簽到頁面
  const handleCheckin = (eventId) => {
    navigate(`/temple-admin/${templeId}/events/${eventId}/registrations?mode=checkin`);
  };

  // 處理複製活動
  const handleCopy = (eventId) => {
    navigate(`/temple-admin/${templeId}/events/new?copyFrom=${eventId}`);
  };

  // 處理搜尋
  const handleSearch = (e) => {
    setKeyword(e.target.value);
    setCurrentPage(1); // 重置到第一頁
  };

  // 處理狀態篩選
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // 重置到第一頁
  };

  // 處理分頁
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="events-container">
      {/* 頁面標題與操作 */}
      <div className="events-header">
        <h2>活動報名管理</h2>
        <button className="btn-primary" onClick={handleCreate}>
          新增活動
        </button>
      </div>

      {/* 篩選與搜尋 */}
      <div className="events-filters">
        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('all')}
          >
            全部
          </button>
          <button
            className={`filter-btn ${statusFilter === 'draft' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('draft')}
          >
            草稿
          </button>
          <button
            className={`filter-btn ${statusFilter === 'published' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('published')}
          >
            已發布
          </button>
          <button
            className={`filter-btn ${statusFilter === 'closed' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('closed')}
          >
            已截止
          </button>
          <button
            className={`filter-btn ${statusFilter === 'canceled' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('canceled')}
          >
            已取消
          </button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="搜尋活動名稱或地點..."
          value={keyword}
          onChange={handleSearch}
        />
      </div>

      {/* Loading / Error / Empty / Data */}
      {loading ? (
        <div className="loading-state">載入中...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          {keyword || statusFilter !== 'all'
            ? '沒有符合條件的活動'
            : '尚無活動，點擊「新增活動」建立第一個活動'}
        </div>
      ) : (
        <>
          {/* 活動列表表格 */}
          <div className="events-table-wrapper">
            <table className="events-table">
              <thead>
                <tr>
                  <th>狀態</th>
                  <th>活動名稱</th>
                  <th>報名進度</th>
                  <th>活動時間</th>
                  <th>報名截止</th>
                  <th>費用</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const registered = event.registeredCount || 0;
                  const capacity = event.capacity || 0;
                  const percentage = capacity > 0 ? Math.min((registered / capacity) * 100, 100) : 0;
                  const progressClass = getProgressClass(registered, capacity);
                  const eventTags = getEventTags(event);
                  const signupTimeInfo = event.signupEndAt ? getTimeRemaining(event.signupEndAt) : null;

                  return (
                    <tr key={event.id}>
                      <td>{getStatusBadge(event.status)}</td>
                      <td className="event-info-cell">
                        <div className="event-title-row">
                          <span className="event-title">{event.title}</span>
                        </div>
                        {event.location && (
                          <div className="event-subtitle">📍 {event.location}</div>
                        )}
                        {eventTags.length > 0 && (
                          <div className="event-tags">
                            {eventTags.map((tag, idx) => (
                              <span key={idx} className={`event-tag ${tag.type}`}>
                                {tag.icon} {tag.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="progress-cell">
                        <div className="progress-bar-container">
                          <div className="progress-bar">
                            <div
                              className={`progress-bar-fill ${progressClass}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="progress-text">
                            {registered}/{capacity}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="time-display">
                          <span>{formatDateTime(event.startAt)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="time-display">
                          <span>{formatDateTime(event.signupEndAt)}</span>
                          {signupTimeInfo && event.status === 'published' && (
                            <span className={`time-countdown ${signupTimeInfo.type}`}>
                              {signupTimeInfo.text}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{event.fee === 0 ? '免費' : `$${event.fee}`}</td>
                      <td>
                        <div className="quick-actions">
                          <button
                            className="btn-icon"
                            onClick={() => handleView(event.id)}
                            title="查看詳情"
                          >
                            👁️
                          </button>
                          {event.status === 'draft' && (
                            <button
                              className="btn-icon"
                              onClick={() => handleEdit(event.id)}
                              title="編輯活動"
                            >
                              ✏️
                            </button>
                          )}
                          {(event.status === 'published' || event.status === 'closed') && (
                            <button
                              className="btn-icon btn-checkin"
                              onClick={() => handleCheckin(event.id)}
                              title="報到簽到"
                            >
                              ✅
                            </button>
                          )}
                          <button
                            className="btn-icon btn-copy"
                            onClick={() => handleCopy(event.id)}
                            title="複製活動"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 分頁 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-pagination"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                上一頁
              </button>
              <span className="pagination-info">
                第 {currentPage} / {totalPages} 頁 （共 {total} 筆）
              </span>
              <button
                className="btn-pagination"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                下一頁
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventList;
