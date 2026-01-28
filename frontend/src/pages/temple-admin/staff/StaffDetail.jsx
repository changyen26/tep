/**
 * StaffDetail - 服務人員詳情
 *
 * 顯示人員資料、權限、操作記錄
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Staff.css';

// Mock 資料
const mockStaffDetail = {
  id: 1,
  name: '王小明',
  email: 'wang@temple.com',
  phone: '0912-345-678',
  role: 'manager',
  roleName: '廟務主管',
  status: 'active',
  lastLoginAt: '2025-01-29T10:30:00',
  lastLoginIp: '192.168.1.100',
  createdAt: '2024-06-15T09:00:00',
  createdBy: '系統管理員',
  updatedAt: '2025-01-20T14:00:00',
  updatedBy: '系統管理員',
  note: '負責統籌廟務運作',
  permissions: ['all'],
  loginCount: 156,
};

const mockActivityLogs = [
  {
    id: 1,
    action: 'login',
    actionLabel: '登入系統',
    target: null,
    ip: '192.168.1.100',
    userAgent: 'Chrome 120 / Windows',
    createdAt: '2025-01-29T10:30:00',
  },
  {
    id: 2,
    action: 'order_update',
    actionLabel: '更新訂單狀態',
    target: '訂單 #1234',
    targetLink: '/orders/1234',
    detail: '狀態從「處理中」改為「已出貨」',
    ip: '192.168.1.100',
    createdAt: '2025-01-29T09:45:00',
  },
  {
    id: 3,
    action: 'event_create',
    actionLabel: '建立活動',
    target: '新春祈福法會',
    targetLink: '/events/5',
    ip: '192.168.1.100',
    createdAt: '2025-01-28T16:20:00',
  },
  {
    id: 4,
    action: 'product_update',
    actionLabel: '更新商品',
    target: '平安符',
    detail: '庫存從 50 改為 100',
    ip: '192.168.1.100',
    createdAt: '2025-01-28T14:10:00',
  },
  {
    id: 5,
    action: 'devotee_view',
    actionLabel: '查看信眾資料',
    target: '陳**',
    ip: '192.168.1.100',
    createdAt: '2025-01-28T11:30:00',
  },
  {
    id: 6,
    action: 'notification_send',
    actionLabel: '發送推播通知',
    target: '新春活動通知',
    detail: '發送給 1,234 位信眾',
    ip: '192.168.1.100',
    createdAt: '2025-01-27T10:00:00',
  },
  {
    id: 7,
    action: 'login',
    actionLabel: '登入系統',
    ip: '192.168.1.105',
    userAgent: 'Safari / iOS',
    createdAt: '2025-01-26T08:15:00',
  },
  {
    id: 8,
    action: 'password_change',
    actionLabel: '修改密碼',
    ip: '192.168.1.100',
    createdAt: '2025-01-20T14:00:00',
  },
];

const StaffDetail = () => {
  const { templeId, staffId } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // info, logs

  // 載入資料
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // TODO: 替換為實際 API
        await new Promise(resolve => setTimeout(resolve, 500));
        setStaff(mockStaffDetail);
        setLogs(mockActivityLogs);
      } catch (err) {
        console.error('載入失敗:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [templeId, staffId]);

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

  // 導航
  const handleBack = () => navigate(`/temple-admin/${templeId}/staff`);
  const handleEdit = () => navigate(`/temple-admin/${templeId}/staff/${staffId}/edit`);

  // 重設密碼
  const handleResetPassword = async () => {
    if (!window.confirm('確定要重設此人員的密碼嗎？\n新密碼將發送至其 Email。')) return;
    // TODO: 呼叫 API
    alert('密碼重設連結已發送至 ' + staff.email);
  };

  // 停用/啟用帳號
  const handleToggleStatus = async () => {
    const action = staff.status === 'active' ? '停用' : '啟用';
    if (!window.confirm(`確定要${action}此帳號嗎？`)) return;
    // TODO: 呼叫 API
    setStaff(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active',
    }));
  };

  if (loading) {
    return (
      <div className="staff-container">
        <div className="loading-state">載入中...</div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="staff-container">
        <div className="error-state">找不到此人員資料</div>
      </div>
    );
  }

  return (
    <div className="staff-container">
      {/* 頁面標題 */}
      <div className="staff-header">
        <div className="header-left">
          <button className="btn-back" onClick={handleBack}>
            ← 返回
          </button>
          <h2>人員詳情</h2>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleResetPassword}>
            🔑 重設密碼
          </button>
          <button
            className={`btn-secondary ${staff.status === 'active' ? 'btn-danger' : 'btn-success'}`}
            onClick={handleToggleStatus}
          >
            {staff.status === 'active' ? '⏸️ 停用帳號' : '▶️ 啟用帳號'}
          </button>
          <button className="btn-primary" onClick={handleEdit}>
            ✏️ 編輯
          </button>
        </div>
      </div>

      {/* 人員卡片 */}
      <div className="staff-profile-card">
        <div className="profile-avatar">
          {staff.name.charAt(0)}
        </div>
        <div className="profile-info">
          <h3>{staff.name}</h3>
          <div className="profile-badges">
            <span className={`role-badge role-${staff.role}`}>
              {staff.roleName}
            </span>
            <span className={`status-badge status-${staff.status}`}>
              {staff.status === 'active' ? '啟用中' : '已停用'}
            </span>
          </div>
          <div className="profile-contact">
            <span>📧 {staff.email}</span>
            <span>📱 {staff.phone}</span>
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-value">{staff.loginCount}</div>
            <div className="stat-label">登入次數</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatDateTime(staff.lastLoginAt).split(' ')[0]}</div>
            <div className="stat-label">最後登入</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          📋 基本資料
        </button>
        <button
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📜 操作紀錄
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="detail-section">
          <div className="info-grid">
            <div className="info-item">
              <label>姓名</label>
              <div>{staff.name}</div>
            </div>
            <div className="info-item">
              <label>Email（登入帳號）</label>
              <div>{staff.email}</div>
            </div>
            <div className="info-item">
              <label>手機號碼</label>
              <div>{staff.phone}</div>
            </div>
            <div className="info-item">
              <label>權限角色</label>
              <div>{staff.roleName}</div>
            </div>
            <div className="info-item">
              <label>帳號狀態</label>
              <div>{staff.status === 'active' ? '啟用中' : '已停用'}</div>
            </div>
            <div className="info-item">
              <label>最後登入時間</label>
              <div>{formatDateTime(staff.lastLoginAt)}</div>
            </div>
            <div className="info-item">
              <label>最後登入 IP</label>
              <div>{staff.lastLoginIp || '-'}</div>
            </div>
            <div className="info-item">
              <label>建立時間</label>
              <div>{formatDateTime(staff.createdAt)}</div>
            </div>
            <div className="info-item">
              <label>建立者</label>
              <div>{staff.createdBy}</div>
            </div>
            <div className="info-item">
              <label>最後更新</label>
              <div>{formatDateTime(staff.updatedAt)} 由 {staff.updatedBy}</div>
            </div>
          </div>

          {staff.note && (
            <div className="info-note">
              <label>備註</label>
              <div>{staff.note}</div>
            </div>
          )}

          {/* 權限列表 */}
          <div className="permission-section">
            <h4>擁有權限</h4>
            <div className="permission-list">
              {staff.permissions.includes('all') ? (
                <span className="permission-tag all">所有功能完整權限</span>
              ) : (
                staff.permissions.map(perm => (
                  <span key={perm} className="permission-tag">
                    {getPermissionLabel(perm)}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="detail-section">
          <div className="logs-header">
            <h4>操作紀錄</h4>
            <span className="logs-count">共 {logs.length} 筆</span>
          </div>

          <div className="activity-timeline">
            {logs.map(log => (
              <div key={log.id} className="timeline-item">
                <div className="timeline-icon">
                  {getActionIcon(log.action)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-action">{log.actionLabel}</span>
                    {log.target && (
                      <span className="timeline-target">
                        {log.targetLink ? (
                          <a href={log.targetLink}>{log.target}</a>
                        ) : (
                          log.target
                        )}
                      </span>
                    )}
                  </div>
                  {log.detail && (
                    <div className="timeline-detail">{log.detail}</div>
                  )}
                  <div className="timeline-meta">
                    <span className="timeline-time">
                      {formatDateTime(log.createdAt)}
                    </span>
                    {log.ip && (
                      <span className="timeline-ip">IP: {log.ip}</span>
                    )}
                    {log.userAgent && (
                      <span className="timeline-ua">{log.userAgent}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 權限標籤對應
const getPermissionLabel = (perm) => {
  const map = {
    checkins: '打卡管理',
    orders: '訂單管理',
    products: '商品管理',
    devotees: '信眾管理',
    events: '活動管理',
    pilgrimage: '進香管理',
    lamps: '點燈管理',
    revenue: '收入報表',
    notifications: '推播通知',
    certificates: '感謝狀',
    analytics: '數據分析',
    business: '經營診斷',
    settings: '廟宇設定',
    staff: '人員管理',
  };
  return map[perm] || perm;
};

export default StaffDetail;
