import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getLampType,
  listLampApplications,
  exportLampApplicationsToCSV,
} from '../../../services/templeLampsService';
import './Lamps.css';

const LampApplications = () => {
  const { templeId, lampTypeId } = useParams();
  const navigate = useNavigate();

  // 狀態
  const [lampType, setLampType] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 篩選與分頁
  const [statusFilter, setStatusFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // 載入燈種資訊
  useEffect(() => {
    const fetchLampType = async () => {
      try {
        const response = await getLampType(templeId, lampTypeId);
        if (response.success) {
          setLampType(response.data);
        }
      } catch (err) {
        console.error('載入燈種資料失敗:', err);
      }
    };

    fetchLampType();
  }, [templeId, lampTypeId]);

  // 載入申請名冊
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        q: keyword,
        page: currentPage,
        pageSize,
      };

      const response = await listLampApplications(templeId, lampTypeId, params);

      if (response.success) {
        setApplications(response.data.applications || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError(response.message || '載入申請名冊失敗');
      }
    } catch (err) {
      console.error('載入申請名冊失敗:', err);
      setError('載入申請名冊失敗');
    } finally {
      setLoading(false);
    }
  };

  // 篩選或分頁變更時重新載入
  useEffect(() => {
    fetchApplications();
  }, [statusFilter, keyword, currentPage]);

  // 狀態顯示
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: '待處理', className: 'status-draft' },
      paid: { label: '已付款', className: 'status-published' },
      completed: { label: '已完成', className: 'status-completed' },
      canceled: { label: '已取消', className: 'status-canceled' },
    };

    const config = statusConfig[status] || { label: status, className: '' };
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  // 處理返回
  const handleBack = () => {
    navigate(`/temple-admin/${templeId}/lamps/${lampTypeId}`);
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

  // 處理匯出 CSV
  const handleExportCSV = async () => {
    try {
      // 取得所有符合篩選條件的資料（不分頁）
      const params = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        q: keyword,
        page: 1,
        pageSize: 10000, // 取得所有資料
      };

      const response = await listLampApplications(templeId, lampTypeId, params);

      if (response.success && response.data.applications.length > 0) {
        const lampTypeName = lampType ? lampType.name : '點燈';
        exportLampApplicationsToCSV(response.data.applications, lampTypeName);
      } else {
        alert('沒有資料可匯出');
      }
    } catch (err) {
      console.error('匯出失敗:', err);
      alert('匯出失敗');
    }
  };

  return (
    <div className="lamps-container">
      {/* 頁面標題與操作 */}
      <div className="lamps-header">
        <h2>
          {lampType ? `${lampType.name} - ` : ''}點燈申請名冊
        </h2>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleBack}>
            返回燈種
          </button>
          <button className="btn-success" onClick={handleExportCSV}>
            匯出 CSV
          </button>
        </div>
      </div>

      {/* 篩選與搜尋 */}
      <div className="lamps-filters">
        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('all')}
          >
            全部
          </button>
          <button
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('pending')}
          >
            待處理
          </button>
          <button
            className={`filter-btn ${statusFilter === 'paid' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('paid')}
          >
            已付款
          </button>
          <button
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('completed')}
          >
            已完成
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
          placeholder="搜尋姓名、電話、Email..."
          value={keyword}
          onChange={handleSearch}
        />
      </div>

      {/* Loading / Error / Empty / Data */}
      {loading ? (
        <div className="loading-state">載入中...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          {keyword || statusFilter !== 'all'
            ? '沒有符合條件的申請記錄'
            : '尚無申請記錄'}
        </div>
      ) : (
        <>
          {/* 申請名冊表格 */}
          <div className="lamps-table-wrapper">
            <table className="lamps-table applications-table">
              <thead>
                <tr>
                  <th>申請ID</th>
                  <th>姓名</th>
                  <th>電話</th>
                  <th>Email</th>
                  <th>生日</th>
                  <th>生肖</th>
                  <th>地址</th>
                  <th>狀態</th>
                  <th>申請時間</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.id}</td>
                    <td>{app.applicantName}</td>
                    <td>{app.phone}</td>
                    <td>{app.email || '-'}</td>
                    <td>
                      {app.birthday}
                      {app.lunarBirthday && (
                        <div className="lunar-birthday">({app.lunarBirthday})</div>
                      )}
                    </td>
                    <td>{app.zodiac}</td>
                    <td>
                      <div className="address-cell">{app.address || '-'}</div>
                    </td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>{new Date(app.createdAt).toLocaleString('zh-TW')}</td>
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

export default LampApplications;
