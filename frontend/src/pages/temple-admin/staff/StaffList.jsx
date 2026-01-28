/**
 * StaffList - 服務人員帳號列表
 *
 * 顯示廟方所有服務人員帳號，支援搜尋、篩選、狀態管理
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Staff.css';

// Mock 資料
const mockStaffList = [
  {
    id: 1,
    name: '王小明',
    email: 'wang@temple.com',
    phone: '0912-345-678',
    role: 'manager',
    roleName: '廟務主管',
    status: 'active',
    lastLoginAt: '2025-01-29T10:30:00',
    createdAt: '2024-06-15T09:00:00',
    createdBy: '系統管理員',
  },
  {
    id: 2,
    name: '李美玲',
    email: 'lee@temple.com',
    phone: '0923-456-789',
    role: 'staff',
    roleName: '一般服務員',
    status: 'active',
    lastLoginAt: '2025-01-28T14:20:00',
    createdAt: '2024-08-20T10:00:00',
    createdBy: '王小明',
  },
  {
    id: 3,
    name: '張大偉',
    email: 'zhang@temple.com',
    phone: '0934-567-890',
    role: 'cashier',
    roleName: '收銀員',
    status: 'active',
    lastLoginAt: '2025-01-29T08:15:00',
    createdAt: '2024-10-01T08:00:00',
    createdBy: '王小明',
  },
  {
    id: 4,
    name: '陳志豪',
    email: 'chen@temple.com',
    phone: '0945-678-901',
    role: 'event_manager',
    roleName: '活動管理員',
    status: 'inactive',
    lastLoginAt: '2024-12-15T16:45:00',
    createdAt: '2024-07-10T11:00:00',
    createdBy: '系統管理員',
  },
  {
    id: 5,
    name: '林淑芬',
    email: 'lin@temple.com',
    phone: '0956-789-012',
    role: 'viewer',
    roleName: '唯讀人員',
    status: 'active',
    lastLoginAt: '2025-01-27T09:00:00',
    createdAt: '2024-11-20T14:00:00',
    createdBy: '王小明',
  },
];

const StaffList = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  // 狀態管理
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 篩選
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [keyword, setKeyword] = useState('');

  // 載入資料
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        // TODO: 替換為實際 API
        await new Promise(resolve => setTimeout(resolve, 500));
        setStaffList(mockStaffList);
      } catch (err) {
        setError('載入服務人員列表失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [templeId]);

  // 篩選資料
  const filteredStaff = staffList.filter(staff => {
    // 狀態篩選
    if (statusFilter !== 'all' && staff.status !== statusFilter) return false;
    // 角色篩選
    if (roleFilter !== 'all' && staff.role !== roleFilter) return false;
    // 關鍵字搜尋
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      return (
        staff.name.toLowerCase().includes(lowerKeyword) ||
        staff.email.toLowerCase().includes(lowerKeyword) ||
        staff.phone.includes(keyword)
      );
    }
    return true;
  });

  // 格式化日期
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

  // 取得狀態樣式
  const getStatusBadge = (status) => {
    const config = {
      active: { label: '啟用中', className: 'status-active' },
      inactive: { label: '已停用', className: 'status-inactive' },
    };
    const { label, className } = config[status] || { label: status, className: '' };
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  // 取得角色樣式
  const getRoleBadge = (role, roleName) => {
    const colorMap = {
      manager: 'role-manager',
      staff: 'role-staff',
      cashier: 'role-cashier',
      event_manager: 'role-event',
      viewer: 'role-viewer',
    };
    return (
      <span className={`role-badge ${colorMap[role] || ''}`}>
        {roleName}
      </span>
    );
  };

  // 導航處理
  const handleCreate = () => navigate(`/temple-admin/${templeId}/staff/new`);
  const handleView = (id) => navigate(`/temple-admin/${templeId}/staff/${id}`);
  const handleEdit = (id) => navigate(`/temple-admin/${templeId}/staff/${id}/edit`);
  const handleRoles = () => navigate(`/temple-admin/${templeId}/staff/roles`);
  const handleLogs = () => navigate(`/temple-admin/${templeId}/staff/logs`);

  // 停用/啟用帳號
  const handleToggleStatus = async (staff) => {
    const action = staff.status === 'active' ? '停用' : '啟用';
    if (!window.confirm(`確定要${action}「${staff.name}」的帳號嗎？`)) return;

    // TODO: 呼叫 API
    setStaffList(prev =>
      prev.map(s =>
        s.id === staff.id
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      )
    );
  };

  return (
    <div className="staff-container">
      {/* 頁面標題 */}
      <div className="staff-header">
        <div className="header-left">
          <h2>帳號與權限管理</h2>
          <p className="header-subtitle">管理廟方服務人員帳號與權限設定</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleLogs}>
            📋 操作日誌
          </button>
          <button className="btn-secondary" onClick={handleRoles}>
            🔐 角色管理
          </button>
          <button className="btn-primary" onClick={handleCreate}>
            ➕ 新增人員
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="staff-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{staffList.length}</div>
            <div className="stat-label">總人數</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">
              {staffList.filter(s => s.status === 'active').length}
            </div>
            <div className="stat-label">啟用中</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏸️</div>
          <div className="stat-content">
            <div className="stat-value">
              {staffList.filter(s => s.status === 'inactive').length}
            </div>
            <div className="stat-label">已停用</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <div className="stat-value">
              {staffList.filter(s => {
                if (!s.lastLoginAt) return false;
                const lastLogin = new Date(s.lastLoginAt);
                const now = new Date();
                return (now - lastLogin) < 24 * 60 * 60 * 1000;
              }).length}
            </div>
            <div className="stat-label">今日在線</div>
          </div>
        </div>
      </div>

      {/* 篩選區 */}
      <div className="staff-filters">
        <div className="filter-group">
          <div className="status-filters">
            <button
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              全部
            </button>
            <button
              className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              啟用中
            </button>
            <button
              className={`filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
              onClick={() => setStatusFilter('inactive')}
            >
              已停用
            </button>
          </div>

          <select
            className="role-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">所有角色</option>
            <option value="manager">廟務主管</option>
            <option value="staff">一般服務員</option>
            <option value="cashier">收銀員</option>
            <option value="event_manager">活動管理員</option>
            <option value="viewer">唯讀人員</option>
          </select>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="搜尋姓名、Email 或電話..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="loading-state">載入中...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : filteredStaff.length === 0 ? (
        <div className="empty-state">
          {keyword || statusFilter !== 'all' || roleFilter !== 'all'
            ? '沒有符合條件的人員'
            : '尚無服務人員，點擊「新增人員」建立第一位'}
        </div>
      ) : (
        <div className="staff-table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>聯絡資訊</th>
                <th>角色</th>
                <th>狀態</th>
                <th>最後登入</th>
                <th>建立資訊</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className={staff.status === 'inactive' ? 'row-inactive' : ''}>
                  <td>
                    <div className="staff-name">
                      <div className="avatar">
                        {staff.name.charAt(0)}
                      </div>
                      <span>{staff.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="email">📧 {staff.email}</div>
                      <div className="phone">📱 {staff.phone}</div>
                    </div>
                  </td>
                  <td>{getRoleBadge(staff.role, staff.roleName)}</td>
                  <td>{getStatusBadge(staff.status)}</td>
                  <td>
                    <div className="last-login">
                      {formatDateTime(staff.lastLoginAt)}
                    </div>
                  </td>
                  <td>
                    <div className="created-info">
                      <div>{formatDateTime(staff.createdAt)}</div>
                      <div className="created-by">由 {staff.createdBy}</div>
                    </div>
                  </td>
                  <td>
                    <div className="quick-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleView(staff.id)}
                        title="查看詳情"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(staff.id)}
                        title="編輯"
                      >
                        ✏️
                      </button>
                      <button
                        className={`btn-icon ${staff.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(staff)}
                        title={staff.status === 'active' ? '停用帳號' : '啟用帳號'}
                      >
                        {staff.status === 'active' ? '⏸️' : '▶️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffList;
