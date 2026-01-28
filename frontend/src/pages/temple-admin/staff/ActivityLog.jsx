/**
 * ActivityLog - 操作日誌查詢
 *
 * 追蹤所有服務人員的操作記錄
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Staff.css';

// Mock 操作日誌資料
const mockActivityLogs = [
  {
    id: 1,
    staffId: 1,
    staffName: '王小明',
    action: 'login',
    actionLabel: '登入系統',
    target: null,
    ip: '192.168.1.100',
    userAgent: 'Chrome 120 / Windows',
    createdAt: '2025-01-29T10:30:00',
  },
  {
    id: 2,
    staffId: 1,
    staffName: '王小明',
    action: 'order_update',
    actionLabel: '更新訂單狀態',
    target: '訂單 #1234',
    targetType: 'order',
    targetId: 1234,
    detail: '狀態從「處理中」改為「已出貨」',
    ip: '192.168.1.100',
    createdAt: '2025-01-29T09:45:00',
  },
  {
    id: 3,
    staffId: 2,
    staffName: '李美玲',
    action: 'devotee_view',
    actionLabel: '查看信眾資料',
    target: '陳**',
    targetType: 'devotee',
    targetId: 56,
    ip: '192.168.1.102',
    createdAt: '2025-01-29T09:30:00',
  },
  {
    id: 4,
    staffId: 1,
    staffName: '王小明',
    action: 'event_create',
    actionLabel: '建立活動',
    target: '新春祈福法會',
    targetType: 'event',
    targetId: 5,
    ip: '192.168.1.100',
    createdAt: '2025-01-28T16:20:00',
  },
  {
    id: 5,
    staffId: 3,
    staffName: '張大偉',
    action: 'order_update',
    actionLabel: '更新訂單狀態',
    target: '訂單 #1230',
    targetType: 'order',
    targetId: 1230,
    detail: '狀態從「待處理」改為「處理中」',
    ip: '192.168.1.103',
    createdAt: '2025-01-28T15:00:00',
  },
  {
    id: 6,
    staffId: 1,
    staffName: '王小明',
    action: 'product_update',
    actionLabel: '更新商品',
    target: '平安符',
    targetType: 'product',
    targetId: 12,
    detail: '庫存從 50 改為 100',
    ip: '192.168.1.100',
    createdAt: '2025-01-28T14:10:00',
  },
  {
    id: 7,
    staffId: 2,
    staffName: '李美玲',
    action: 'login',
    actionLabel: '登入系統',
    ip: '192.168.1.102',
    userAgent: 'Safari / macOS',
    createdAt: '2025-01-28T14:00:00',
  },
  {
    id: 8,
    staffId: 1,
    staffName: '王小明',
    action: 'notification_send',
    actionLabel: '發送推播通知',
    target: '新春活動通知',
    targetType: 'notification',
    targetId: 8,
    detail: '發送給 1,234 位信眾',
    ip: '192.168.1.100',
    createdAt: '2025-01-27T10:00:00',
  },
  {
    id: 9,
    staffId: 1,
    staffName: '王小明',
    action: 'staff_create',
    actionLabel: '新增人員',
    target: '林淑芬',
    targetType: 'staff',
    targetId: 5,
    ip: '192.168.1.100',
    createdAt: '2025-01-26T11:30:00',
  },
  {
    id: 10,
    staffId: 3,
    staffName: '張大偉',
    action: 'login',
    actionLabel: '登入系統',
    ip: '192.168.1.103',
    userAgent: 'Chrome 120 / Windows',
    createdAt: '2025-01-26T08:00:00',
  },
  {
    id: 11,
    staffId: 1,
    staffName: '王小明',
    action: 'settings_update',
    actionLabel: '更新廟宇設定',
    target: '營業時間',
    detail: '更新為 08:00-18:00',
    ip: '192.168.1.100',
    createdAt: '2025-01-25T16:00:00',
  },
  {
    id: 12,
    staffId: 4,
    staffName: '陳志豪',
    action: 'event_update',
    actionLabel: '編輯活動',
    target: '冬至法會',
    targetType: 'event',
    targetId: 3,
    detail: '更新活動地點',
    ip: '192.168.1.104',
    createdAt: '2025-01-25T10:20:00',
  },
];

const mockStaffOptions = [
  { id: 1, name: '王小明' },
  { id: 2, name: '李美玲' },
  { id: 3, name: '張大偉' },
  { id: 4, name: '陳志豪' },
  { id: 5, name: '林淑芬' },
];

const actionOptions = [
  { value: 'login', label: '登入系統' },
  { value: 'logout', label: '登出系統' },
  { value: 'order_update', label: '更新訂單' },
  { value: 'order_create', label: '建立訂單' },
  { value: 'event_create', label: '建立活動' },
  { value: 'event_update', label: '編輯活動' },
  { value: 'product_update', label: '更新商品' },
  { value: 'product_create', label: '新增商品' },
  { value: 'devotee_view', label: '查看信眾' },
  { value: 'notification_send', label: '發送推播' },
  { value: 'staff_create', label: '新增人員' },
  { value: 'staff_update', label: '編輯人員' },
  { value: 'settings_update', label: '更新設定' },
  { value: 'password_change', label: '修改密碼' },
];

const ActivityLog = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // 篩選條件
  const [filters, setFilters] = useState({
    staffId: '',
    action: '',
    startDate: '',
    endDate: '',
    keyword: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // 載入資料
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        // TODO: 替換為實際 API
        await new Promise(resolve => setTimeout(resolve, 500));

        // 模擬篩選
        let filteredLogs = [...mockActivityLogs];

        if (filters.staffId) {
          filteredLogs = filteredLogs.filter(
            log => log.staffId === parseInt(filters.staffId)
          );
        }

        if (filters.action) {
          filteredLogs = filteredLogs.filter(log => log.action === filters.action);
        }

        if (filters.keyword) {
          const kw = filters.keyword.toLowerCase();
          filteredLogs = filteredLogs.filter(
            log =>
              log.actionLabel.toLowerCase().includes(kw) ||
              (log.target && log.target.toLowerCase().includes(kw)) ||
              (log.detail && log.detail.toLowerCase().includes(kw))
          );
        }

        if (filters.startDate) {
          const start = new Date(filters.startDate);
          filteredLogs = filteredLogs.filter(
            log => new Date(log.createdAt) >= start
          );
        }

        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59);
          filteredLogs = filteredLogs.filter(
            log => new Date(log.createdAt) <= end
          );
        }

        setLogs(filteredLogs);
        setTotal(filteredLogs.length);
      } catch (err) {
        console.error('載入失敗:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [templeId, filters, currentPage]);

  // 格式化日期
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 取得操作圖示
  const getActionIcon = (action) => {
    const icons = {
      login: '🔐',
      logout: '🚪',
      order_update: '📦',
      order_create: '📦',
      event_create: '📅',
      event_update: '📅',
      product_update: '🛍️',
      product_create: '🛍️',
      devotee_view: '👥',
      notification_send: '📢',
      password_change: '🔑',
      staff_create: '➕',
      staff_update: '✏️',
      settings_update: '⚙️',
    };
    return icons[action] || '📝';
  };

  // 取得操作類型樣式
  const getActionClass = (action) => {
    if (action.includes('create')) return 'action-create';
    if (action.includes('update')) return 'action-update';
    if (action.includes('delete')) return 'action-delete';
    if (action === 'login' || action === 'logout') return 'action-auth';
    if (action.includes('view')) return 'action-view';
    return '';
  };

  // 處理篩選變更
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  // 清除篩選
  const handleClearFilters = () => {
    setFilters({
      staffId: '',
      action: '',
      startDate: '',
      endDate: '',
      keyword: '',
    });
    setCurrentPage(1);
  };

  // 匯出日誌
  const handleExport = () => {
    // TODO: 實作匯出功能
    alert('匯出功能開發中...');
  };

  const handleBack = () => navigate(`/temple-admin/${templeId}/staff`);

  // 查看人員詳情
  const handleViewStaff = (staffId) => {
    navigate(`/temple-admin/${templeId}/staff/${staffId}`);
  };

  return (
    <div className="staff-container">
      {/* 頁面標題 */}
      <div className="staff-header">
        <div className="header-left">
          <button className="btn-back" onClick={handleBack}>
            ← 返回
          </button>
          <h2>操作日誌</h2>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleExport}>
            📥 匯出日誌
          </button>
        </div>
      </div>

      {/* 篩選區 */}
      <div className="log-filters">
        <div className="filter-row">
          <div className="filter-item">
            <label>操作人員</label>
            <select
              value={filters.staffId}
              onChange={(e) => handleFilterChange('staffId', e.target.value)}
            >
              <option value="">全部人員</option>
              {mockStaffOptions.map(staff => (
                <option key={staff.id} value={staff.id}>{staff.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>操作類型</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">全部類型</option>
              {actionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>開始日期</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label>結束日期</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="filter-item flex-grow">
            <label>關鍵字搜尋</label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              placeholder="搜尋操作內容..."
            />
          </div>

          <div className="filter-item">
            <label>&nbsp;</label>
            <button className="btn-secondary" onClick={handleClearFilters}>
              清除篩選
            </button>
          </div>
        </div>
      </div>

      {/* 統計 */}
      <div className="log-summary">
        <span>共 {total} 筆紀錄</span>
      </div>

      {/* 日誌列表 */}
      {loading ? (
        <div className="loading-state">載入中...</div>
      ) : logs.length === 0 ? (
        <div className="empty-state">沒有符合條件的操作紀錄</div>
      ) : (
        <div className="log-table-wrapper">
          <table className="log-table">
            <thead>
              <tr>
                <th style={{ width: 160 }}>時間</th>
                <th style={{ width: 100 }}>操作人員</th>
                <th style={{ width: 120 }}>操作類型</th>
                <th>操作內容</th>
                <th style={{ width: 120 }}>IP 位址</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="log-time">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td>
                    <button
                      className="staff-link"
                      onClick={() => handleViewStaff(log.staffId)}
                    >
                      {log.staffName}
                    </button>
                  </td>
                  <td>
                    <span className={`action-badge ${getActionClass(log.action)}`}>
                      {getActionIcon(log.action)} {log.actionLabel}
                    </span>
                  </td>
                  <td className="log-content">
                    {log.target && (
                      <span className="log-target">{log.target}</span>
                    )}
                    {log.detail && (
                      <span className="log-detail">{log.detail}</span>
                    )}
                    {log.userAgent && (
                      <span className="log-ua">{log.userAgent}</span>
                    )}
                  </td>
                  <td className="log-ip">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分頁 */}
      {total > pageSize && (
        <div className="pagination">
          <button
            className="btn-pagination"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            上一頁
          </button>
          <span className="pagination-info">
            第 {currentPage} / {Math.ceil(total / pageSize)} 頁
          </span>
          <button
            className="btn-pagination"
            disabled={currentPage >= Math.ceil(total / pageSize)}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
