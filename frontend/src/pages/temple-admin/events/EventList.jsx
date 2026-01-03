import { useState, useEffect } from 'react';
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
                  <th>地點</th>
                  <th>活動時間</th>
                  <th>報名截止</th>
                  <th>名額</th>
                  <th>費用</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{getStatusBadge(event.status)}</td>
                    <td>
                      <span className="event-title">{event.title}</span>
                    </td>
                    <td>{event.location}</td>
                    <td>{formatDateTime(event.startAt)}</td>
                    <td>{formatDateTime(event.signupEndAt)}</td>
                    <td>{event.capacity}</td>
                    <td>{event.fee === 0 ? '免費' : `$${event.fee}`}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-sm btn-view"
                          onClick={() => handleView(event.id)}
                        >
                          查看
                        </button>
                        {event.status === 'draft' && (
                          <button
                            className="btn-sm btn-edit"
                            onClick={() => handleEdit(event.id)}
                          >
                            編輯
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
