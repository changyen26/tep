/**
 * RoleManagement - 角色權限管理
 *
 * 管理廟方自訂角色與權限設定
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Staff.css';

// 系統預設權限模組
const permissionModules = [
  {
    id: 'dashboard',
    name: '儀表板',
    icon: '📊',
    permissions: [
      { id: 'dashboard_view', name: '查看儀表板' },
    ],
  },
  {
    id: 'business',
    name: '經營診斷',
    icon: '🏢',
    permissions: [
      { id: 'business_view', name: '查看經營診斷' },
    ],
  },
  {
    id: 'analytics',
    name: '數據分析',
    icon: '📈',
    permissions: [
      { id: 'analytics_view', name: '查看數據分析' },
    ],
  },
  {
    id: 'events',
    name: '活動管理',
    icon: '📅',
    permissions: [
      { id: 'events_view', name: '查看活動' },
      { id: 'events_create', name: '新增活動' },
      { id: 'events_edit', name: '編輯活動' },
      { id: 'events_delete', name: '刪除活動' },
      { id: 'events_checkin', name: '報到簽到' },
    ],
  },
  {
    id: 'pilgrimage',
    name: '進香管理',
    icon: '🚌',
    permissions: [
      { id: 'pilgrimage_view', name: '查看進香登記' },
      { id: 'pilgrimage_manage', name: '管理進香登記' },
    ],
  },
  {
    id: 'lamps',
    name: '點燈管理',
    icon: '🏮',
    permissions: [
      { id: 'lamps_view', name: '查看點燈' },
      { id: 'lamps_manage', name: '管理點燈類型' },
      { id: 'lamps_applications', name: '處理點燈申請' },
    ],
  },
  {
    id: 'products',
    name: '商品管理',
    icon: '🛍️',
    permissions: [
      { id: 'products_view', name: '查看商品' },
      { id: 'products_create', name: '新增商品' },
      { id: 'products_edit', name: '編輯商品' },
      { id: 'products_delete', name: '刪除商品' },
    ],
  },
  {
    id: 'orders',
    name: '訂單管理',
    icon: '📦',
    permissions: [
      { id: 'orders_view', name: '查看訂單' },
      { id: 'orders_manage', name: '處理訂單' },
    ],
  },
  {
    id: 'checkins',
    name: '打卡管理',
    icon: '📍',
    permissions: [
      { id: 'checkins_view', name: '查看打卡紀錄' },
    ],
  },
  {
    id: 'revenue',
    name: '收入報表',
    icon: '💰',
    permissions: [
      { id: 'revenue_view', name: '查看收入報表' },
    ],
  },
  {
    id: 'devotees',
    name: '信眾管理',
    icon: '👥',
    permissions: [
      { id: 'devotees_view', name: '查看信眾資料' },
      { id: 'devotees_export', name: '匯出信眾資料' },
    ],
  },
  {
    id: 'notifications',
    name: '推播通知',
    icon: '📢',
    permissions: [
      { id: 'notifications_view', name: '查看推播紀錄' },
      { id: 'notifications_send', name: '發送推播' },
      { id: 'notifications_templates', name: '管理範本' },
    ],
  },
  {
    id: 'certificates',
    name: '感謝狀管理',
    icon: '📜',
    permissions: [
      { id: 'certificates_view', name: '查看感謝狀' },
      { id: 'certificates_create', name: '建立感謝狀' },
    ],
  },
  {
    id: 'settings',
    name: '廟宇設定',
    icon: '⚙️',
    permissions: [
      { id: 'settings_view', name: '查看設定' },
      { id: 'settings_edit', name: '編輯設定' },
    ],
  },
  {
    id: 'staff',
    name: '人員管理',
    icon: '👤',
    permissions: [
      { id: 'staff_view', name: '查看人員' },
      { id: 'staff_create', name: '新增人員' },
      { id: 'staff_edit', name: '編輯人員' },
      { id: 'staff_delete', name: '停用人員' },
      { id: 'staff_logs', name: '查看操作日誌' },
    ],
  },
];

// Mock 角色資料
const mockRoles = [
  {
    id: 'manager',
    name: '廟務主管',
    description: '擁有完整管理權限，可管理所有功能及人員',
    isSystem: true,
    color: '#e74c3c',
    permissions: ['all'],
    staffCount: 1,
  },
  {
    id: 'staff',
    name: '一般服務員',
    description: '可處理日常業務，包含打卡、訂單、信眾管理',
    isSystem: true,
    color: '#3498db',
    permissions: ['dashboard_view', 'checkins_view', 'orders_view', 'orders_manage', 'devotees_view', 'products_view'],
    staffCount: 2,
  },
  {
    id: 'cashier',
    name: '收銀員',
    description: '專責訂單與收入管理',
    isSystem: true,
    color: '#27ae60',
    permissions: ['dashboard_view', 'orders_view', 'orders_manage', 'revenue_view', 'products_view'],
    staffCount: 1,
  },
  {
    id: 'event_manager',
    name: '活動管理員',
    description: '專責活動與進香管理',
    isSystem: true,
    color: '#9b59b6',
    permissions: ['dashboard_view', 'events_view', 'events_create', 'events_edit', 'events_checkin', 'pilgrimage_view', 'pilgrimage_manage', 'notifications_view', 'notifications_send'],
    staffCount: 1,
  },
  {
    id: 'lamp_manager',
    name: '點燈管理員',
    description: '專責點燈業務管理',
    isSystem: false,
    color: '#f39c12',
    permissions: ['dashboard_view', 'lamps_view', 'lamps_manage', 'lamps_applications', 'certificates_view', 'certificates_create'],
    staffCount: 0,
  },
  {
    id: 'viewer',
    name: '唯讀人員',
    description: '僅能查看資料，無法進行任何修改',
    isSystem: true,
    color: '#95a5a6',
    permissions: ['dashboard_view', 'checkins_view', 'orders_view', 'devotees_view', 'events_view', 'lamps_view', 'products_view', 'revenue_view'],
    staffCount: 1,
  },
];

const RoleManagement = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', permissions: [] });

  // 載入資料
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setRoles(mockRoles);
        if (mockRoles.length > 0) {
          setSelectedRole(mockRoles[0]);
        }
      } catch (err) {
        console.error('載入失敗:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [templeId]);

  // 選擇角色
  const handleSelectRole = (role) => {
    if (isEditing) {
      if (!window.confirm('確定要放棄目前的編輯嗎？')) return;
    }
    setSelectedRole(role);
    setIsEditing(false);
  };

  // 開始編輯
  const handleStartEdit = () => {
    setEditForm({
      name: selectedRole.name,
      description: selectedRole.description,
      permissions: [...selectedRole.permissions],
    });
    setIsEditing(true);
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // 儲存編輯
  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      alert('請輸入角色名稱');
      return;
    }

    // TODO: 呼叫 API
    await new Promise(resolve => setTimeout(resolve, 500));

    setRoles(prev =>
      prev.map(r =>
        r.id === selectedRole.id
          ? { ...r, name: editForm.name, description: editForm.description, permissions: editForm.permissions }
          : r
      )
    );
    setSelectedRole(prev => ({
      ...prev,
      name: editForm.name,
      description: editForm.description,
      permissions: editForm.permissions,
    }));
    setIsEditing(false);
    alert('角色權限已更新');
  };

  // 切換權限
  const togglePermission = (permId) => {
    setEditForm(prev => {
      const has = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter(p => p !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  // 切換模組所有權限
  const toggleModule = (module) => {
    const modulePermIds = module.permissions.map(p => p.id);
    const allSelected = modulePermIds.every(id => editForm.permissions.includes(id));

    setEditForm(prev => {
      if (allSelected) {
        return {
          ...prev,
          permissions: prev.permissions.filter(p => !modulePermIds.includes(p)),
        };
      } else {
        const newPerms = new Set([...prev.permissions, ...modulePermIds]);
        return {
          ...prev,
          permissions: Array.from(newPerms),
        };
      }
    });
  };

  // 新增自訂角色
  const handleCreateRole = () => {
    const newRole = {
      id: `custom_${Date.now()}`,
      name: '新角色',
      description: '請編輯角色描述',
      isSystem: false,
      color: '#34495e',
      permissions: ['dashboard_view'],
      staffCount: 0,
    };
    setRoles(prev => [...prev, newRole]);
    setSelectedRole(newRole);
    setEditForm({
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
    });
    setIsEditing(true);
  };

  // 刪除角色
  const handleDeleteRole = async () => {
    if (selectedRole.isSystem) {
      alert('系統預設角色無法刪除');
      return;
    }
    if (selectedRole.staffCount > 0) {
      alert('此角色仍有人員使用中，請先移除相關人員');
      return;
    }
    if (!window.confirm(`確定要刪除「${selectedRole.name}」角色嗎？`)) return;

    setRoles(prev => prev.filter(r => r.id !== selectedRole.id));
    setSelectedRole(roles[0]);
    setIsEditing(false);
  };

  const handleBack = () => navigate(`/temple-admin/${templeId}/staff`);

  if (loading) {
    return (
      <div className="staff-container">
        <div className="loading-state">載入中...</div>
      </div>
    );
  }

  const currentPermissions = isEditing ? editForm.permissions : (selectedRole?.permissions || []);
  const isAllPermissions = currentPermissions.includes('all');

  return (
    <div className="staff-container">
      {/* 頁面標題 */}
      <div className="staff-header">
        <div className="header-left">
          <button className="btn-back" onClick={handleBack}>
            ← 返回
          </button>
          <h2>角色權限管理</h2>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleCreateRole}>
            ➕ 新增角色
          </button>
        </div>
      </div>

      <div className="role-management-layout">
        {/* 左側：角色列表 */}
        <div className="role-list-panel">
          <h3>角色列表</h3>
          <div className="role-list">
            {roles.map(role => (
              <div
                key={role.id}
                className={`role-list-item ${selectedRole?.id === role.id ? 'active' : ''}`}
                onClick={() => handleSelectRole(role)}
              >
                <div
                  className="role-color-dot"
                  style={{ backgroundColor: role.color }}
                />
                <div className="role-list-info">
                  <div className="role-list-name">
                    {role.name}
                    {role.isSystem && <span className="system-badge">系統</span>}
                  </div>
                  <div className="role-list-count">{role.staffCount} 人使用</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側：權限設定 */}
        <div className="role-detail-panel">
          {selectedRole && (
            <>
              <div className="role-detail-header">
                <div className="role-detail-title">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="role-name-input"
                    />
                  ) : (
                    <h3 style={{ color: selectedRole.color }}>{selectedRole.name}</h3>
                  )}
                  {selectedRole.isSystem && !isEditing && (
                    <span className="system-badge">系統預設</span>
                  )}
                </div>
                <div className="role-detail-actions">
                  {isEditing ? (
                    <>
                      <button className="btn-secondary" onClick={handleCancelEdit}>
                        取消
                      </button>
                      <button className="btn-primary" onClick={handleSaveEdit}>
                        儲存
                      </button>
                    </>
                  ) : (
                    <>
                      {!selectedRole.isSystem && (
                        <button className="btn-danger" onClick={handleDeleteRole}>
                          刪除
                        </button>
                      )}
                      <button className="btn-primary" onClick={handleStartEdit}>
                        編輯權限
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="role-description">
                {isEditing ? (
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="角色描述..."
                    rows={2}
                  />
                ) : (
                  <p>{selectedRole.description}</p>
                )}
              </div>

              {/* 權限矩陣 */}
              <div className="permission-matrix">
                <h4>功能權限</h4>
                {isAllPermissions && !isEditing ? (
                  <div className="all-permissions-notice">
                    此角色擁有所有功能的完整權限
                  </div>
                ) : (
                  <div className="permission-modules">
                    {permissionModules.map(module => {
                      const modulePermIds = module.permissions.map(p => p.id);
                      const selectedCount = modulePermIds.filter(id =>
                        currentPermissions.includes(id)
                      ).length;
                      const allSelected = selectedCount === modulePermIds.length;
                      const someSelected = selectedCount > 0 && !allSelected;

                      return (
                        <div key={module.id} className="permission-module">
                          <div className="module-header">
                            {isEditing && (
                              <input
                                type="checkbox"
                                checked={allSelected}
                                ref={el => {
                                  if (el) el.indeterminate = someSelected;
                                }}
                                onChange={() => toggleModule(module)}
                              />
                            )}
                            <span className="module-icon">{module.icon}</span>
                            <span className="module-name">{module.name}</span>
                            {!isEditing && (
                              <span className="module-count">
                                {selectedCount}/{modulePermIds.length}
                              </span>
                            )}
                          </div>
                          <div className="module-permissions">
                            {module.permissions.map(perm => {
                              const isChecked = currentPermissions.includes(perm.id);
                              return (
                                <label
                                  key={perm.id}
                                  className={`permission-item ${isChecked ? 'checked' : ''}`}
                                >
                                  {isEditing ? (
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => togglePermission(perm.id)}
                                    />
                                  ) : (
                                    <span className={`permission-dot ${isChecked ? 'active' : ''}`} />
                                  )}
                                  <span>{perm.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
