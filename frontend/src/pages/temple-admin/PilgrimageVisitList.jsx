import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockPilgrimageVisits as initialMockVisits } from '../../mocks/templeAdminMockData';
import './PilgrimageVisitList.css';

const USE_MOCK = true; // 設為 false 使用真實 API

// 本地 mock 資料（可修改）
let mockVisitsData = [...initialMockVisits];

const PilgrimageVisitList = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  // 篩選條件
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('visit_time');

  // 資料狀態
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 分頁
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // 新增登記 modal 狀態
  const [showNewModal, setShowNewModal] = useState(false);
  const [newVisitData, setNewVisitData] = useState({
    contactName: '',
    contactPhone: '',
    visitStartAt: '',
    peopleCount: 1,
    groupName: '',
    purpose: '',
    needs: '',
  });

  // 載入進香登記列表
  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: pageSize,
        sort: sortBy,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (USE_MOCK) {
        // 使用 Mock 資料
        await new Promise(resolve => setTimeout(resolve, 300));
        let filtered = [...mockVisitsData];

        if (params.status) {
          filtered = filtered.filter(v => v.status === params.status);
        }

        // 排序
        if (params.sort === 'visit_time') {
          filtered.sort((a, b) => new Date(a.expected_date) - new Date(b.expected_date));
        } else {
          filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        const start = (params.page - 1) * params.per_page;
        const paginated = filtered.slice(start, start + params.per_page);

        // 轉換欄位名稱以匹配頁面期望的格式
        const formattedVisits = paginated.map(v => ({
          id: v.id,
          contactName: v.contact_name,
          contactPhone: v.contact_phone,
          groupName: v.organization_name,
          peopleCount: v.estimated_people,
          visitStartAt: `${v.expected_date}T${v.expected_time}`,
          purpose: '進香祈福',
          status: v.status,
          createdAt: v.created_at,
          notes: v.notes,
        }));

        setVisits(formattedVisits);
        setTotal(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize));
      } else {
        const templeAdminApi = await import('../../services/templeAdminApi').then(m => m.default);
        const response = await templeAdminApi.pilgrimageVisits.list(templeId, params);

        if (response.success || response.data) {
          const data = response.data || response;
          setVisits(data.items || []);
          setTotal(data.pagination?.total || 0);
          setTotalPages(data.pagination?.pages || 1);
        }
      }
    } catch (err) {
      console.error('載入進香登記列表失敗:', err);
      setError(err.message || '載入資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 初始載入和參數變更時重新載入
  useEffect(() => {
    if (templeId) {
      fetchVisits();
    }
  }, [templeId, currentPage, sortBy, statusFilter]);

  // 導航到詳情頁
  const handleRowClick = (visit) => {
    navigate(`/temple-admin/${templeId}/pilgrimage-visits/${visit.id}`);
  };

  // 開啟新增 modal
  const handleOpenNewModal = () => {
    setShowNewModal(true);
    // 預設來訪時間為明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setNewVisitData({
      contactName: '',
      contactPhone: '',
      visitStartAt: tomorrow.toISOString().slice(0, 16),
      peopleCount: 1,
      groupName: '',
      purpose: '',
      needs: '',
    });
  };

  // 關閉新增 modal
  const handleCloseNewModal = () => {
    setShowNewModal(false);
  };

  // 提交新增
  const handleSubmitNew = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));

        const dateTime = new Date(newVisitData.visitStartAt);
        const newVisit = {
          id: Math.max(...mockVisitsData.map(v => v.id), 0) + 1,
          temple_id: parseInt(templeId),
          organization_name: newVisitData.groupName || '',
          contact_name: newVisitData.contactName,
          contact_phone: newVisitData.contactPhone,
          contact_email: '',
          expected_date: dateTime.toISOString().split('T')[0],
          expected_time: dateTime.toTimeString().slice(0, 5),
          estimated_people: newVisitData.peopleCount,
          transportation: 'bus',
          bus_count: Math.ceil(newVisitData.peopleCount / 40),
          notes: newVisitData.needs || '',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mockVisitsData.push(newVisit);
        setShowNewModal(false);
        setCurrentPage(1);
        await fetchVisits();
      } else {
        const templeAdminApi = await import('../../services/templeAdminApi').then(m => m.default);
        await templeAdminApi.pilgrimageVisits.create(templeId, newVisitData);
        setShowNewModal(false);
        setCurrentPage(1);
        await fetchVisits();
      }
    } catch (err) {
      console.error('新增進香登記失敗:', err);
      alert(err.message || '新增失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期時間
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 狀態標籤
  const statusLabels = {
    pending: '待處理',
    confirmed: '已確認',
    rejected: '已拒絕',
    completed: '已完成',
    canceled: '已取消',
  };

  const statusColors = {
    pending: '#ff9800',
    confirmed: '#4caf50',
    rejected: '#f44336',
    completed: '#9e9e9e',
    canceled: '#607d8b',
  };

  if (loading && visits.length === 0) {
    return (
      <div className="pilgrimage-visit-list">
        <div className="loading-message">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pilgrimage-visit-list">
        <div className="error-message">{error}</div>
        <button type="button" className="btn-primary" onClick={fetchVisits}>
          重試
        </button>
      </div>
    );
  }

  return (
    <div className="pilgrimage-visit-list">
      <div className="page-header">
        <h1 className="page-title">進香登記管理</h1>
        <button type="button" className="btn-primary" onClick={handleOpenNewModal}>
          + 新增登記
        </button>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label htmlFor="statusFilter">狀態</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">全部</option>
            <option value="pending">待處理</option>
            <option value="confirmed">已確認</option>
            <option value="rejected">已拒絕</option>
            <option value="completed">已完成</option>
            <option value="canceled">已取消</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sortBy">排序</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="visit_time">來訪時間</option>
            <option value="created_at">登記時間</option>
          </select>
        </div>

        <div className="filter-info">共 {total} 筆登記</div>
      </div>

      {visits.length === 0 ? (
        <div className="empty-message">尚無進香登記</div>
      ) : (
        <>
          <div className="table-container">
            <table className="visits-table">
              <thead>
                <tr>
                  <th>來訪時間</th>
                  <th>聯絡人/團體</th>
                  <th>人數</th>
                  <th>來訪目的</th>
                  <th>狀態</th>
                  <th>登記時間</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr
                    key={visit.id}
                    onClick={() => handleRowClick(visit)}
                    className="clickable-row"
                  >
                    <td>{formatDateTime(visit.visitStartAt)}</td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-name">{visit.contactName}</div>
                        {visit.groupName && (
                          <div className="group-name">{visit.groupName}</div>
                        )}
                      </div>
                    </td>
                    <td>{visit.peopleCount} 人</td>
                    <td className="purpose-cell">
                      {visit.purpose || '-'}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: statusColors[visit.status] }}
                      >
                        {statusLabels[visit.status] || visit.status}
                      </span>
                    </td>
                    <td>{formatDateTime(visit.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                上一頁
              </button>
              <span className="page-info">
                第 {currentPage} / {totalPages} 頁
              </span>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                下一頁
              </button>
            </div>
          )}
        </>
      )}

      {/* 新增登記 Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={handleCloseNewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>新增進香登記</h2>
              <button
                type="button"
                className="modal-close"
                onClick={handleCloseNewModal}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitNew} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactName">
                    聯絡人姓名 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    value={newVisitData.contactName}
                    onChange={(e) =>
                      setNewVisitData({ ...newVisitData, contactName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactPhone">
                    聯絡電話 <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    value={newVisitData.contactPhone}
                    onChange={(e) =>
                      setNewVisitData({ ...newVisitData, contactPhone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="groupName">團體名稱</label>
                  <input
                    type="text"
                    id="groupName"
                    value={newVisitData.groupName}
                    onChange={(e) =>
                      setNewVisitData({ ...newVisitData, groupName: e.target.value })
                    }
                    placeholder="例如：XX進香團"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="peopleCount">
                    預計人數 <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="peopleCount"
                    min="1"
                    value={newVisitData.peopleCount}
                    onChange={(e) =>
                      setNewVisitData({
                        ...newVisitData,
                        peopleCount: parseInt(e.target.value, 10),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="visitStartAt">
                  來訪時間 <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="visitStartAt"
                  value={newVisitData.visitStartAt}
                  onChange={(e) =>
                    setNewVisitData({ ...newVisitData, visitStartAt: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="purpose">來訪目的</label>
                <input
                  type="text"
                  id="purpose"
                  value={newVisitData.purpose}
                  onChange={(e) =>
                    setNewVisitData({ ...newVisitData, purpose: e.target.value })
                  }
                  placeholder="例如：進香祈福、參加法會"
                />
              </div>

              <div className="form-group">
                <label htmlFor="needs">特殊需求</label>
                <textarea
                  id="needs"
                  rows="3"
                  value={newVisitData.needs}
                  onChange={(e) =>
                    setNewVisitData({ ...newVisitData, needs: e.target.value })
                  }
                  placeholder="例如：需要導覽、準備供品、安排休息空間等"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleCloseNewModal}
                >
                  取消
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '新增中...' : '確認新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PilgrimageVisitList;
