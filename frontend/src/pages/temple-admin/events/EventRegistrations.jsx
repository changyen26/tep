import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getEvent,
  listRegistrations,
  exportRegistrationsToCSV,
} from '../../../services/templeEventsService';
import './Events.css';

const EventRegistrations = () => {
  const { templeId, eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 篩選與分頁
  const [statusFilter, setStatusFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // 所有報名資料（用於匯出）
  const [allRegistrations, setAllRegistrations] = useState([]);

  // 載入活動資料
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEvent(eventId);
        if (response.success) {
          setEvent(response.data);
        }
      } catch (err) {
        console.error('載入活動失敗:', err);
      }
    };

    fetchEvent();
  }, [eventId]);

  // 載入報名名單
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        status: statusFilter,
        q: keyword,
        page: currentPage,
        pageSize,
      };

      const response = await listRegistrations(eventId, params);

      if (response.success) {
        setRegistrations(response.data.registrations || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError(response.message || '載入報名名單失敗');
      }
    } catch (err) {
      console.error('載入報名名單失敗:', err);
      setError('載入報名名單失敗');
    } finally {
      setLoading(false);
    }
  };

  // 載入所有報名資料（用於匯出）
  const fetchAllRegistrations = async () => {
    try {
      const params = {
        status: statusFilter,
        q: keyword,
        page: 1,
        pageSize: 9999, // 取得所有資料
      };

      const response = await listRegistrations(eventId, params);

      if (response.success) {
        setAllRegistrations(response.data.registrations || []);
      }
    } catch (err) {
      console.error('載入全部報名資料失敗:', err);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    fetchAllRegistrations();
  }, [eventId, statusFilter, keyword, currentPage]);

  // 狀態 badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      registered: { label: '已報名', className: 'status-registered' },
      canceled: { label: '已取消', className: 'status-canceled' },
      waitlist: { label: '候補', className: 'status-waitlist' },
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

  // 處理搜尋
  const handleSearch = (e) => {
    setKeyword(e.target.value);
    setCurrentPage(1);
  };

  // 處理狀態篩選
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // 處理分頁
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 處理匯出 CSV
  const handleExport = () => {
    if (allRegistrations.length === 0) {
      alert('沒有資料可匯出');
      return;
    }

    const eventTitle = event?.title || '活動';
    exportRegistrationsToCSV(allRegistrations, eventTitle);
  };

  // 返回活動詳情
  const handleBack = () => {
    navigate(`/temple-admin/${templeId}/events/${eventId}`);
  };

  return (
    <div className="events-container">
      {/* 頁面標題 */}
      <div className="events-header">
        <div>
          <h2>報名名單</h2>
          {event && <div style={{ fontSize: '16px', color: '#6b7280', marginTop: '4px' }}>
            {event.title}
          </div>}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={handleBack}>
            返回活動
          </button>
          <button className="btn-primary" onClick={handleExport}>
            匯出 CSV
          </button>
        </div>
      </div>

      {/* 篩選與搜尋 */}
      <div className="registrations-filters">
        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('all')}
          >
            全部
          </button>
          <button
            className={`filter-btn ${statusFilter === 'registered' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('registered')}
          >
            已報名
          </button>
          <button
            className={`filter-btn ${statusFilter === 'canceled' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('canceled')}
          >
            已取消
          </button>
          <button
            className={`filter-btn ${statusFilter === 'waitlist' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('waitlist')}
          >
            候補
          </button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="搜尋姓名、電話或 Email..."
          value={keyword}
          onChange={handleSearch}
        />
      </div>

      {/* Loading / Error / Empty / Data */}
      {loading ? (
        <div className="loading-state">載入中...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : registrations.length === 0 ? (
        <div className="empty-state">
          {keyword || statusFilter !== 'all'
            ? '沒有符合條件的報名記錄'
            : '目前尚無報名記錄'}
        </div>
      ) : (
        <>
          {/* 報名名單表格 */}
          <div className="events-table-wrapper">
            <table className="events-table">
              <thead>
                <tr>
                  <th>報名ID</th>
                  <th>姓名</th>
                  <th>電話</th>
                  <th>Email</th>
                  <th>狀態</th>
                  <th>報名時間</th>
                  <th>備註</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>{reg.id}</td>
                    <td>{reg.name}</td>
                    <td>{reg.phone}</td>
                    <td>{reg.email}</td>
                    <td>{getStatusBadge(reg.status)}</td>
                    <td>{formatDateTime(reg.registeredAt)}</td>
                    <td>{reg.notes || '-'}</td>
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

export default EventRegistrations;
