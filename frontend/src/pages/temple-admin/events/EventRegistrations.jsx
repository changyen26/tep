import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  getEvent,
  listRegistrations,
  exportRegistrationsToCSV,
} from '../../../services/templeEventsService';
import './Events.css';

const EventRegistrations = () => {
  const { templeId, eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 從 URL 讀取簽到模式
  const initialMode = searchParams.get('mode') === 'checkin' ? 'checkin' : 'list';

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 模式切換：list（列表模式）或 checkin（簽到模式）
  const [viewMode, setViewMode] = useState(initialMode);

  // 篩選與分頁
  const [statusFilter, setStatusFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // 所有報名資料（用於匯出）
  const [allRegistrations, setAllRegistrations] = useState([]);

  // 簽到相關狀態
  const [checkinFilter, setCheckinFilter] = useState('all'); // all, checked, unchecked

  // 手動新增報名
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [addLoading, setAddLoading] = useState(false);

  // 報名者詳情 Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');

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

  // 切換模式
  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'checkin' : 'list');
  };

  // 處理簽到
  const handleCheckin = async (registrationId) => {
    try {
      // TODO: 呼叫後端 API 進行簽到
      // await checkinRegistration(eventId, registrationId);

      const checkedInAt = new Date().toISOString();
      const updateReg = (reg) =>
        reg.id === registrationId
          ? { ...reg, checkedIn: true, checkedInAt }
          : reg;

      setRegistrations((prev) => prev.map(updateReg));
      setAllRegistrations((prev) => prev.map(updateReg));
      setSelectedRegistration((prev) =>
        prev && prev.id === registrationId
          ? { ...prev, checkedIn: true, checkedInAt }
          : prev
      );
    } catch (err) {
      console.error('簽到失敗:', err);
      alert('簽到失敗，請稍後再試');
    }
  };

  // 取消簽到
  const handleUndoCheckin = async (registrationId) => {
    try {
      // TODO: 呼叫後端 API 取消簽到
      // await undoCheckinRegistration(eventId, registrationId);

      const updateReg = (reg) =>
        reg.id === registrationId
          ? { ...reg, checkedIn: false, checkedInAt: null }
          : reg;

      setRegistrations((prev) => prev.map(updateReg));
      setAllRegistrations((prev) => prev.map(updateReg));
      setSelectedRegistration((prev) =>
        prev && prev.id === registrationId
          ? { ...prev, checkedIn: false, checkedInAt: null }
          : prev
      );
    } catch (err) {
      console.error('取消簽到失敗:', err);
      alert('取消簽到失敗，請稍後再試');
    }
  };

  // 計算簽到統計
  const checkinStats = useMemo(() => {
    const validRegistrations = allRegistrations.filter(
      (reg) => reg.status === 'registered'
    );
    const checkedIn = validRegistrations.filter((reg) => reg.checkedIn).length;
    const total = validRegistrations.length;
    const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    return { checkedIn, total, percentage, unchecked: total - checkedIn };
  }, [allRegistrations]);

  // 篩選簽到名單
  const filteredCheckinList = useMemo(() => {
    let list = allRegistrations.filter((reg) => reg.status === 'registered');

    if (checkinFilter === 'checked') {
      list = list.filter((reg) => reg.checkedIn);
    } else if (checkinFilter === 'unchecked') {
      list = list.filter((reg) => !reg.checkedIn);
    }

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      list = list.filter(
        (reg) =>
          reg.name?.toLowerCase().includes(lowerKeyword) ||
          reg.phone?.includes(keyword) ||
          reg.email?.toLowerCase().includes(lowerKeyword)
      );
    }

    return list;
  }, [allRegistrations, checkinFilter, keyword]);

  // 手動新增報名表單
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!addForm.name || !addForm.phone) {
      alert('請填寫姓名和電話');
      return;
    }

    setAddLoading(true);
    try {
      // TODO: 呼叫後端 API 新增報名
      // await createManualRegistration(eventId, addForm);

      // 暫時使用前端模擬
      const newReg = {
        id: Date.now(),
        ...addForm,
        status: 'registered',
        registeredAt: new Date().toISOString(),
        checkedIn: false,
        isManual: true,
      };

      setRegistrations((prev) => [newReg, ...prev]);
      setAllRegistrations((prev) => [newReg, ...prev]);
      setTotal((prev) => prev + 1);

      setShowAddModal(false);
      setAddForm({ name: '', phone: '', email: '', notes: '' });
      alert('新增報名成功');
    } catch (err) {
      console.error('新增報名失敗:', err);
      alert('新增報名失敗，請稍後再試');
    } finally {
      setAddLoading(false);
    }
  };

  // 開啟報名者詳情
  const handleViewDetail = (registration) => {
    setSelectedRegistration(registration);
    setTempNotes(registration.notes || '');
    setEditingNotes(false);
    setShowDetailModal(true);
  };

  // 更新報名狀態
  const handleUpdateStatus = async (registrationId, newStatus) => {
    try {
      // TODO: 呼叫後端 API 更新狀態
      // await updateRegistrationStatus(eventId, registrationId, newStatus);

      // 暫時使用前端模擬
      const updateReg = (reg) =>
        reg.id === registrationId ? { ...reg, status: newStatus } : reg;

      setRegistrations((prev) => prev.map(updateReg));
      setAllRegistrations((prev) => prev.map(updateReg));
      setSelectedRegistration((prev) =>
        prev ? { ...prev, status: newStatus } : prev
      );

      alert('狀態已更新');
    } catch (err) {
      console.error('更新狀態失敗:', err);
      alert('更新狀態失敗');
    }
  };

  // 儲存備註
  const handleSaveNotes = async () => {
    if (!selectedRegistration) return;

    try {
      // TODO: 呼叫後端 API 儲存備註
      // await updateRegistrationNotes(eventId, selectedRegistration.id, tempNotes);

      // 暫時使用前端模擬
      const updateReg = (reg) =>
        reg.id === selectedRegistration.id ? { ...reg, notes: tempNotes } : reg;

      setRegistrations((prev) => prev.map(updateReg));
      setAllRegistrations((prev) => prev.map(updateReg));
      setSelectedRegistration((prev) =>
        prev ? { ...prev, notes: tempNotes } : prev
      );

      setEditingNotes(false);
      alert('備註已儲存');
    } catch (err) {
      console.error('儲存備註失敗:', err);
      alert('儲存備註失敗');
    }
  };

  // 前往信眾詳情頁
  const handleGoToDevotee = (publicUserId) => {
    if (publicUserId) {
      navigate(`/temple-admin/${templeId}/devotees/${publicUserId}`);
    }
  };

  return (
    <div className="events-container">
      {/* 頁面標題 */}
      <div className="events-header">
        <div>
          <h2>{viewMode === 'checkin' ? '活動簽到' : '報名名單'}</h2>
          {event && (
            <div style={{ fontSize: '16px', color: '#6b7280', marginTop: '4px' }}>
              {event.title}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={handleBack}>
            返回活動
          </button>
          <button
            className={`btn-secondary ${viewMode === 'checkin' ? 'active' : ''}`}
            onClick={toggleViewMode}
            style={viewMode === 'checkin' ? { background: '#10b981', color: 'white', borderColor: '#10b981' } : {}}
          >
            {viewMode === 'checkin' ? '返回列表' : '進入簽到模式'}
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            手動新增報名
          </button>
          <button className="btn-secondary" onClick={handleExport}>
            匯出 CSV
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="event-stats-cards">
        <div className="stat-card">
          <div className="stat-card-value">{total}</div>
          <div className="stat-card-label">總報名人數</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">
            {allRegistrations.filter((r) => r.status === 'registered').length}
          </div>
          <div className="stat-card-label">已確認</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-card-value">{checkinStats.checkedIn}</div>
          <div className="stat-card-label">已簽到</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{checkinStats.percentage}%</div>
          <div className="stat-card-label">簽到率</div>
        </div>
      </div>

      {/* 簽到模式 */}
      {viewMode === 'checkin' ? (
        <div className="checkin-section">
          <div className="checkin-header">
            <h3>快速簽到</h3>
            <div className="checkin-stats">
              <div className="checkin-stat">
                <div className="checkin-stat-value">{checkinStats.checkedIn}</div>
                <div className="checkin-stat-label">已簽到</div>
              </div>
              <div className="checkin-stat">
                <div className="checkin-stat-value">{checkinStats.unchecked}</div>
                <div className="checkin-stat-label">未簽到</div>
              </div>
            </div>
          </div>

          <div className="checkin-search">
            <input
              type="text"
              placeholder="搜尋姓名、電話..."
              value={keyword}
              onChange={handleSearch}
            />
            <div className="status-filters">
              <button
                className={`filter-btn ${checkinFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCheckinFilter('all')}
              >
                全部
              </button>
              <button
                className={`filter-btn ${checkinFilter === 'unchecked' ? 'active' : ''}`}
                onClick={() => setCheckinFilter('unchecked')}
              >
                未簽到
              </button>
              <button
                className={`filter-btn ${checkinFilter === 'checked' ? 'active' : ''}`}
                onClick={() => setCheckinFilter('checked')}
              >
                已簽到
              </button>
            </div>
          </div>

          <div className="checkin-list">
            {filteredCheckinList.length === 0 ? (
              <div className="empty-state">沒有符合條件的報名者</div>
            ) : (
              filteredCheckinList.map((reg) => (
                <div
                  key={reg.id}
                  className={`checkin-item ${reg.checkedIn ? 'checked-in' : ''}`}
                >
                  <div className="checkin-info">
                    <div className="checkin-avatar">
                      {reg.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="checkin-name">
                        {reg.name}
                        {reg.isManual && (
                          <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px' }}>
                            (手動新增)
                          </span>
                        )}
                      </div>
                      <div className="checkin-contact">{reg.phone}</div>
                    </div>
                  </div>
                  <div>
                    {reg.checkedIn ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="checkin-time">
                          {formatDateTime(reg.checkedInAt)}
                        </span>
                        <button
                          className="btn-checkin-action undo-checkin"
                          onClick={() => handleUndoCheckin(reg.id)}
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-checkin-action do-checkin"
                        onClick={() => handleCheckin(reg.id)}
                      >
                        簽到
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          {/* 列表模式：篩選與搜尋 */}
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
                      <th>簽到</th>
                      <th>報名時間</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>
                          {reg.id}
                          {reg.isManual && (
                            <span className="event-tag info" style={{ marginLeft: '4px' }}>
                              手動
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            className="link-button"
                            onClick={() => handleViewDetail(reg)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              padding: 0,
                              font: 'inherit',
                              textDecoration: 'underline',
                            }}
                          >
                            {reg.name}
                          </button>
                        </td>
                        <td>{reg.phone}</td>
                        <td>{reg.email}</td>
                        <td>{getStatusBadge(reg.status)}</td>
                        <td>
                          {reg.status === 'registered' ? (
                            reg.checkedIn ? (
                              <span className="status-badge status-registered">
                                已簽到
                              </span>
                            ) : (
                              <span className="status-badge status-draft">
                                未簽到
                              </span>
                            )
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{formatDateTime(reg.registeredAt)}</td>
                        <td>
                          <button
                            className="btn-icon"
                            onClick={() => handleViewDetail(reg)}
                            title="查看詳情"
                          >
                            👁️
                          </button>
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
        </>
      )}

      {/* 手動新增報名 Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              margin: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>
              手動新增報名
            </h3>
            <form onSubmit={handleAddSubmit} className="add-registration-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">姓名</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={addForm.name}
                    onChange={handleAddFormChange}
                    placeholder="請輸入姓名"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">電話</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={addForm.phone}
                    onChange={handleAddFormChange}
                    placeholder="請輸入電話"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={addForm.email}
                  onChange={handleAddFormChange}
                  placeholder="請輸入 Email（選填）"
                />
              </div>
              <div className="form-group">
                <label className="form-label">備註</label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  value={addForm.notes}
                  onChange={handleAddFormChange}
                  placeholder="請輸入備註（選填）"
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={addLoading}
                >
                  {addLoading ? '新增中...' : '確認新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 報名者詳情 Modal */}
      {showDetailModal && selectedRegistration && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '600px',
              margin: '20px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 標題 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>報名者詳情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                &times;
              </button>
            </div>

            {/* 基本資訊 */}
            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}>
                  {selectedRegistration.name?.charAt(0) || '?'}
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '600' }}>
                    {selectedRegistration.name}
                    {selectedRegistration.isManual && (
                      <span className="event-tag info" style={{ marginLeft: '8px' }}>手動新增</span>
                    )}
                  </div>
                  <div style={{ color: '#6b7280', marginTop: '4px' }}>
                    報名編號：#{selectedRegistration.id}
                  </div>
                </div>
              </div>

              {/* 聯絡方式 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>電話</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{selectedRegistration.phone}</span>
                    <a
                      href={`tel:${selectedRegistration.phone}`}
                      className="btn-icon"
                      title="撥打電話"
                      style={{ textDecoration: 'none' }}
                    >
                      📞
                    </a>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Email</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{selectedRegistration.email || '-'}</span>
                    {selectedRegistration.email && (
                      <a
                        href={`mailto:${selectedRegistration.email}`}
                        className="btn-icon"
                        title="發送郵件"
                        style={{ textDecoration: 'none' }}
                      >
                        ✉️
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 報名狀態 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>報名狀態</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className={`filter-btn ${selectedRegistration.status === 'registered' ? 'active' : ''}`}
                  onClick={() => handleUpdateStatus(selectedRegistration.id, 'registered')}
                >
                  已報名
                </button>
                <button
                  className={`filter-btn ${selectedRegistration.status === 'waitlist' ? 'active' : ''}`}
                  onClick={() => handleUpdateStatus(selectedRegistration.id, 'waitlist')}
                >
                  候補
                </button>
                <button
                  className={`filter-btn ${selectedRegistration.status === 'canceled' ? 'active' : ''}`}
                  onClick={() => handleUpdateStatus(selectedRegistration.id, 'canceled')}
                  style={selectedRegistration.status === 'canceled' ? { background: '#ef4444', borderColor: '#ef4444' } : {}}
                >
                  已取消
                </button>
              </div>
            </div>

            {/* 簽到狀態 */}
            {selectedRegistration.status === 'registered' && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>簽到狀態</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {selectedRegistration.checkedIn ? (
                    <>
                      <span className="status-badge status-registered">已簽到</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {formatDateTime(selectedRegistration.checkedInAt)}
                      </span>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '13px' }}
                        onClick={() => handleUndoCheckin(selectedRegistration.id)}
                      >
                        取消簽到
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="status-badge status-draft">未簽到</span>
                      <button
                        className="btn-primary"
                        style={{ padding: '4px 12px', fontSize: '13px' }}
                        onClick={() => handleCheckin(selectedRegistration.id)}
                      >
                        立即簽到
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 報名時間 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>報名時間</div>
              <div style={{ color: '#374151' }}>
                {formatDateTime(selectedRegistration.registeredAt)}
              </div>
            </div>

            {/* 備註 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>備註</div>
                {!editingNotes && (
                  <button
                    className="btn-secondary"
                    style={{ padding: '4px 12px', fontSize: '13px' }}
                    onClick={() => setEditingNotes(true)}
                  >
                    編輯
                  </button>
                )}
              </div>
              {editingNotes ? (
                <div>
                  <textarea
                    className="form-textarea"
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    rows={3}
                    placeholder="輸入備註..."
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 16px' }}
                      onClick={() => {
                        setEditingNotes(false);
                        setTempNotes(selectedRegistration.notes || '');
                      }}
                    >
                      取消
                    </button>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 16px' }}
                      onClick={handleSaveNotes}
                    >
                      儲存
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '6px',
                  color: selectedRegistration.notes ? '#374151' : '#9ca3af',
                  minHeight: '60px',
                }}>
                  {selectedRegistration.notes || '無備註'}
                </div>
              )}
            </div>

            {/* 查看信眾資料連結 */}
            {selectedRegistration.publicUserId && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <button
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => handleGoToDevotee(selectedRegistration.publicUserId)}
                >
                  查看完整信眾資料
                </button>
              </div>
            )}

            {/* 關閉按鈕 */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRegistrations;
