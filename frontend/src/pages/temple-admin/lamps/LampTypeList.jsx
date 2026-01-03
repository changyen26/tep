import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listLampTypes } from '../../../services/templeLampsService';
import './Lamps.css';

const LampTypeList = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  // 狀態管理
  const [lampTypes, setLampTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 篩選與分頁
  const [yearFilter, setYearFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // 取得可選擇的年份選項
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear + 1];

  // 載入燈種列表
  const fetchLampTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        templeId,
        year: yearFilter === 'all' ? undefined : parseInt(yearFilter),
        isActive: activeFilter === 'all' ? undefined : activeFilter,
        q: keyword,
        page: currentPage,
        pageSize,
      };

      const response = await listLampTypes(params);

      if (response.success) {
        setLampTypes(response.data.lampTypes || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError(response.message || '載入燈種列表失敗');
      }
    } catch (err) {
      console.error('載入燈種列表失敗:', err);
      setError('載入燈種列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 篩選或分頁變更時重新載入
  useEffect(() => {
    fetchLampTypes();
  }, [yearFilter, activeFilter, keyword, currentPage]);

  // 開放狀態顯示
  const getActiveBadge = (isActive) => {
    return (
      <span className={`status-badge ${isActive ? 'status-published' : 'status-closed'}`}>
        {isActive ? '開放中' : '已關閉'}
      </span>
    );
  };

  // 處理新增按鈕
  const handleCreate = () => {
    navigate(`/temple-admin/${templeId}/lamps/new`);
  };

  // 處理查看詳情
  const handleView = (lampTypeId) => {
    navigate(`/temple-admin/${templeId}/lamps/${lampTypeId}`);
  };

  // 處理編輯
  const handleEdit = (lampTypeId) => {
    navigate(`/temple-admin/${templeId}/lamps/${lampTypeId}/edit`);
  };

  // 處理查看申請名冊
  const handleViewApplications = (lampTypeId) => {
    navigate(`/temple-admin/${templeId}/lamps/${lampTypeId}/applications`);
  };

  // 處理搜尋
  const handleSearch = (e) => {
    setKeyword(e.target.value);
    setCurrentPage(1); // 重置到第一頁
  };

  // 處理年份篩選
  const handleYearFilter = (year) => {
    setYearFilter(year);
    setCurrentPage(1);
  };

  // 處理開放狀態篩選
  const handleActiveFilter = (status) => {
    setActiveFilter(status);
    setCurrentPage(1);
  };

  // 處理分頁
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="lamps-container">
      {/* 頁面標題與操作 */}
      <div className="lamps-header">
        <h2>燈種管理</h2>
        <button className="btn-primary" onClick={handleCreate}>
          新增燈種
        </button>
      </div>

      {/* 篩選與搜尋 */}
      <div className="lamps-filters">
        <div className="filter-group">
          <label>年度：</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${yearFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleYearFilter('all')}
            >
              全部
            </button>
            {yearOptions.map((year) => (
              <button
                key={year}
                className={`filter-btn ${yearFilter === String(year) ? 'active' : ''}`}
                onClick={() => handleYearFilter(String(year))}
              >
                {year}年
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>狀態：</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleActiveFilter('all')}
            >
              全部
            </button>
            <button
              className={`filter-btn ${activeFilter === 'true' ? 'active' : ''}`}
              onClick={() => handleActiveFilter('true')}
            >
              開放中
            </button>
            <button
              className={`filter-btn ${activeFilter === 'false' ? 'active' : ''}`}
              onClick={() => handleActiveFilter('false')}
            >
              已關閉
            </button>
          </div>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="搜尋燈種名稱或說明..."
          value={keyword}
          onChange={handleSearch}
        />
      </div>

      {/* Loading / Error / Empty / Data */}
      {loading ? (
        <div className="loading-state">載入中...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : lampTypes.length === 0 ? (
        <div className="empty-state">
          {keyword || yearFilter !== 'all' || activeFilter !== 'all'
            ? '沒有符合條件的燈種'
            : '尚無燈種，點擊「新增燈種」建立第一個燈種'}
        </div>
      ) : (
        <>
          {/* 燈種列表表格 */}
          <div className="lamps-table-wrapper">
            <table className="lamps-table">
              <thead>
                <tr>
                  <th>狀態</th>
                  <th>年度</th>
                  <th>燈種名稱</th>
                  <th>說明</th>
                  <th>價格</th>
                  <th>名額</th>
                  <th>已申請</th>
                  <th>剩餘</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {lampTypes.map((lampType) => (
                  <tr key={lampType.id}>
                    <td>{getActiveBadge(lampType.isActive)}</td>
                    <td>{lampType.year}年</td>
                    <td>
                      <span className="lamp-title">{lampType.name}</span>
                    </td>
                    <td>
                      <div className="lamp-description">{lampType.description}</div>
                    </td>
                    <td>${lampType.price}</td>
                    <td>{lampType.capacity || '不限'}</td>
                    <td>
                      {lampType.stats
                        ? lampType.stats.paidCount + lampType.stats.completedCount
                        : 0}
                    </td>
                    <td>
                      {lampType.stats && lampType.stats.remaining !== null
                        ? lampType.stats.remaining
                        : '不限'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-sm btn-view"
                          onClick={() => handleView(lampType.id)}
                        >
                          查看
                        </button>
                        <button
                          className="btn-sm btn-edit"
                          onClick={() => handleEdit(lampType.id)}
                        >
                          編輯
                        </button>
                        <button
                          className="btn-sm btn-info"
                          onClick={() => handleViewApplications(lampType.id)}
                        >
                          名冊
                        </button>
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

export default LampTypeList;
