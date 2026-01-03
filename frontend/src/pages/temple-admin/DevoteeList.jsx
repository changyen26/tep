import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import templeAdminApi from '../../services/templeAdminApi';
import './DevoteeList.css';

const DevoteeList = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  // 篩選條件
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState('last_seen');

  // 資料狀態
  const [devotees, setDevotees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 分頁
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // 載入信眾列表
  const fetchDevotees = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: pageSize,
        sort: sortBy,
      };

      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }

      const response = await templeAdminApi.devotees.list(templeId, params);

      if (response.success || response.data) {
        const data = response.data || response;
        setDevotees(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / pageSize));
      }
    } catch (err) {
      console.error('載入信眾列表失敗:', err);
      setError('載入信眾資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 初始載入和參數變更時重新載入
  useEffect(() => {
    if (templeId) {
      fetchDevotees();
    }
  }, [templeId, currentPage, sortBy]);

  // 處理搜尋
  const handleSearch = () => {
    setCurrentPage(1);
    fetchDevotees();
  };

  // 處理Enter鍵搜尋
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 重置篩選
  const handleReset = () => {
    setKeyword('');
    setSortBy('last_seen');
    setCurrentPage(1);
  };

  // 導航到詳情頁
  const handleRowClick = (devotee) => {
    navigate(`/temple-admin/${templeId}/devotees/${devotee.public_user_id}`);
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

  return (
    <div className="devotee-list">
      <div className="page-header">
        <h1 className="page-title">信眾管理</h1>
        <div className="header-stats">
          <span className="stat-item">總信眾數：{total}</span>
        </div>
      </div>

      {/* 搜尋與篩選 */}
      <div className="filter-section">
        <div className="filter-form">
          <div className="filter-group">
            <label>搜尋</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="姓名或 Email"
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>排序</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="last_seen">最後互動時間</option>
              <option value="checkins">打卡次數</option>
              <option value="spend">總消費金額</option>
            </select>
          </div>

          <div className="filter-actions">
            <button type="button" className="btn-primary" onClick={handleSearch}>
              搜尋
            </button>
            <button type="button" className="btn-ghost" onClick={handleReset}>
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 信眾列表表格 */}
      <div className="table-section">
        {loading ? (
          <p className="loading-message">載入中...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : devotees.length === 0 ? (
          <p className="empty-message">目前沒有信眾資料</p>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>Email</th>
                    <th>最後互動</th>
                    <th>打卡次數</th>
                    <th>訂單數</th>
                    <th>總消費</th>
                  </tr>
                </thead>
                <tbody>
                  {devotees.map((devotee) => (
                    <tr
                      key={devotee.public_user_id}
                      onClick={() => handleRowClick(devotee)}
                      className="clickable-row"
                    >
                      <td>{devotee.name || '-'}</td>
                      <td>{devotee.email || '-'}</td>
                      <td>{formatDateTime(devotee.last_seen_at)}</td>
                      <td>{devotee.checkins_count || 0}</td>
                      <td>{devotee.orders_count || 0}</td>
                      <td>{devotee.spend_total || 0} 點</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  上一頁
                </button>
                <span className="pagination-info">
                  第 {currentPage} / {totalPages} 頁
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一頁
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DevoteeList;
