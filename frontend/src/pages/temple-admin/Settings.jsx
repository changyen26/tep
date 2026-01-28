import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockSettings as initialMockSettings } from '../../mocks/templeAdminMockData';
import './Settings.css';

const USE_MOCK = true; // 設為 false 使用真實 API

// 本地 mock 資料（可修改）
let mockSettingsData = JSON.parse(JSON.stringify(initialMockSettings));

const Settings = () => {
  const { templeId } = useParams();

  // Tab 狀態
  const [activeTab, setActiveTab] = useState('general');

  // 載入狀態
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // 設定資料
  const [settings, setSettings] = useState(null);

  // 管理員操作
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminModalMode, setAdminModalMode] = useState('create'); // create or edit
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'viewer',
  });

  // 載入設定
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setSettings(mockSettingsData);
      } else {
        const templeAdminApi = await import('../../services/templeAdminApi').then(m => m.default);
        const response = await templeAdminApi.settings.get(templeId);
        if (response.success) {
          setSettings(response.data);
        }
      }
    } catch (err) {
      console.error('載入設定失敗:', err);
      setError('載入設定失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (templeId) {
      fetchSettings();
    }
  }, [templeId]);

  // 更新設定欄位
  const handleSettingChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setSuccess(false);
  };

  // 儲存設定
  const handleSave = async (section) => {
    try {
      setSaving(true);
      setError(null);

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        mockSettingsData[section] = { ...settings[section] };
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const templeAdminApi = await import('../../services/templeAdminApi').then(m => m.default);
        const response = await templeAdminApi.settings.update(templeId, section, settings[section]);
        if (response.success) {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }
      }
    } catch (err) {
      console.error('儲存設定失敗:', err);
      setError('儲存設定失敗');
    } finally {
      setSaving(false);
    }
  };

  // 開啟新增管理員 Modal
  const handleAddAdmin = () => {
    setAdminModalMode('create');
    setCurrentAdmin(null);
    setAdminForm({
      username: '',
      name: '',
      email: '',
      password: '',
      role: 'viewer',
    });
    setShowAdminModal(true);
  };

  // 開啟編輯管理員 Modal
  const handleEditAdmin = (admin) => {
    setAdminModalMode('edit');
    setCurrentAdmin(admin);
    setAdminForm({
      username: admin.username,
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
    });
    setShowAdminModal(true);
  };

  // 關閉 Modal
  const handleCloseAdminModal = () => {
    setShowAdminModal(false);
    setCurrentAdmin(null);
    setAdminForm({
      username: '',
      name: '',
      email: '',
      password: '',
      role: 'viewer',
    });
  };

  // 儲存管理員
  const handleSaveAdmin = async () => {
    if (!adminForm.username || !adminForm.name || !adminForm.email) {
      alert('請填寫所有必填欄位');
      return;
    }

    if (adminModalMode === 'create' && !adminForm.password) {
      alert('請設定密碼');
      return;
    }

    try {
      setSaving(true);

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));

        if (adminModalMode === 'create') {
          const newAdmin = {
            id: Math.max(...mockSettingsData.admins.map(a => a.id), 0) + 1,
            username: adminForm.username,
            name: adminForm.name,
            email: adminForm.email,
            role: adminForm.role,
            created_at: new Date().toISOString(),
          };
          mockSettingsData.admins.push(newAdmin);
        } else {
          const index = mockSettingsData.admins.findIndex(a => a.id === currentAdmin.id);
          if (index !== -1) {
            mockSettingsData.admins[index] = {
              ...mockSettingsData.admins[index],
              username: adminForm.username,
              name: adminForm.name,
              email: adminForm.email,
              role: adminForm.role,
            };
          }
        }

        setSettings({ ...mockSettingsData });
        handleCloseAdminModal();
        alert(adminModalMode === 'create' ? '管理員新增成功' : '管理員更新成功');
      }
    } catch (err) {
      console.error('儲存管理員失敗:', err);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  // 刪除管理員
  const handleDeleteAdmin = async (admin) => {
    if (!window.confirm(`確定要刪除管理員「${admin.name}」嗎？`)) {
      return;
    }

    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        mockSettingsData.admins = mockSettingsData.admins.filter(a => a.id !== admin.id);
        setSettings({ ...mockSettingsData });
        alert('管理員已刪除');
      }
    } catch (err) {
      console.error('刪除管理員失敗:', err);
      alert('刪除失敗');
    }
  };

  // 角色標籤
  const getRoleLabel = (role) => {
    const roleMap = {
      admin: '管理員',
      editor: '編輯者',
      viewer: '檢視者',
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-message">載入中...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">系統設定</h1>
      </div>

      {/* 成功訊息 */}
      {success && (
        <div className="success-banner">設定已儲存</div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="error-banner">{error}</div>
      )}

      {/* Tab 導航 */}
      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          基本設定
        </button>
        <button
          className={`tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          商城設定
        </button>
        <button
          className={`tab-btn ${activeTab === 'checkin' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkin')}
        >
          打卡設定
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          通知設定
        </button>
        <button
          className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          管理員
        </button>
      </div>

      {/* Tab 內容 */}
      <div className="settings-content">
        {/* 基本設定 */}
        {activeTab === 'general' && settings?.general && (
          <div className="settings-section">
            <h2 className="section-title">基本設定</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>廟宇名稱</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.general.temple_name}
                  onChange={(e) => handleSettingChange('general', 'temple_name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>廟宇 ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.general.temple_id}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>聯絡電話</label>
                <input
                  type="tel"
                  className="form-input"
                  value={settings.general.contact_phone}
                  onChange={(e) => handleSettingChange('general', 'contact_phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>聯絡 Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={settings.general.contact_email}
                  onChange={(e) => handleSettingChange('general', 'contact_email', e.target.value)}
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.general.notification_enabled}
                    onChange={(e) => handleSettingChange('general', 'notification_enabled', e.target.checked)}
                  />
                  啟用系統通知
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={() => handleSave('general')} disabled={saving}>
                {saving ? '儲存中...' : '儲存設定'}
              </button>
            </div>
          </div>
        )}

        {/* 商城設定 */}
        {activeTab === 'shop' && settings?.shop && (
          <div className="settings-section">
            <h2 className="section-title">商城設定</h2>
            <div className="form-grid">
              <div className="form-group checkbox-group full-width">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.shop.shop_enabled}
                    onChange={(e) => handleSettingChange('shop', 'shop_enabled', e.target.checked)}
                  />
                  啟用商城功能
                </label>
              </div>
              <div className="form-group">
                <label>最低兌換點數</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.shop.min_points_for_redemption}
                  onChange={(e) => handleSettingChange('shop', 'min_points_for_redemption', parseInt(e.target.value) || 0)}
                  min="0"
                />
                <span className="form-hint">信眾需達到此點數才能開始兌換</span>
              </div>
              <div className="form-group">
                <label>運費（功德點）</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.shop.shipping_fee}
                  onChange={(e) => handleSettingChange('shop', 'shipping_fee', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>免運門檻（功德點）</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.shop.free_shipping_threshold}
                  onChange={(e) => handleSettingChange('shop', 'free_shipping_threshold', parseInt(e.target.value) || 0)}
                  min="0"
                />
                <span className="form-hint">訂單金額達到此點數可免運費</span>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={() => handleSave('shop')} disabled={saving}>
                {saving ? '儲存中...' : '儲存設定'}
              </button>
            </div>
          </div>
        )}

        {/* 打卡設定 */}
        {activeTab === 'checkin' && settings?.checkin && (
          <div className="settings-section">
            <h2 className="section-title">打卡設定</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>每日打卡次數限制</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.checkin.daily_limit}
                  onChange={(e) => handleSettingChange('checkin', 'daily_limit', parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                />
              </div>
              <div className="form-group">
                <label>每次打卡獲得點數</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.checkin.merit_points_per_checkin}
                  onChange={(e) => handleSettingChange('checkin', 'merit_points_per_checkin', parseInt(e.target.value) || 1)}
                  min="1"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>打卡範圍（公尺）</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.checkin.checkin_radius}
                  onChange={(e) => handleSettingChange('checkin', 'checkin_radius', parseInt(e.target.value) || 100)}
                  min="10"
                  max="1000"
                />
                <span className="form-hint">使用者需在此範圍內才能打卡</span>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={() => handleSave('checkin')} disabled={saving}>
                {saving ? '儲存中...' : '儲存設定'}
              </button>
            </div>
          </div>
        )}

        {/* 通知設定 */}
        {activeTab === 'notifications' && settings?.notifications && (
          <div className="settings-section">
            <h2 className="section-title">通知設定</h2>
            <div className="form-grid">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.email_notification}
                    onChange={(e) => handleSettingChange('notifications', 'email_notification', e.target.checked)}
                  />
                  Email 通知
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms_notification}
                    onChange={(e) => handleSettingChange('notifications', 'sms_notification', e.target.checked)}
                  />
                  簡訊通知
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.push_notification}
                    onChange={(e) => handleSettingChange('notifications', 'push_notification', e.target.checked)}
                  />
                  推播通知
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.order_notification}
                    onChange={(e) => handleSettingChange('notifications', 'order_notification', e.target.checked)}
                  />
                  新訂單通知
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.event_reminder}
                    onChange={(e) => handleSettingChange('notifications', 'event_reminder', e.target.checked)}
                  />
                  活動提醒
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={() => handleSave('notifications')} disabled={saving}>
                {saving ? '儲存中...' : '儲存設定'}
              </button>
            </div>
          </div>
        )}

        {/* 管理員 */}
        {activeTab === 'admins' && settings?.admins && (
          <div className="settings-section">
            <div className="section-header">
              <h2 className="section-title">管理員列表</h2>
              <button className="btn-primary" onClick={handleAddAdmin}>
                新增管理員
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>帳號</th>
                    <th>姓名</th>
                    <th>Email</th>
                    <th>角色</th>
                    <th>建立時間</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.admins.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.username}</td>
                      <td>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>
                        <span className={`role-badge role-${admin.role}`}>
                          {getRoleLabel(admin.role)}
                        </span>
                      </td>
                      <td>{new Date(admin.created_at).toLocaleDateString('zh-TW')}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-link"
                            onClick={() => handleEditAdmin(admin)}
                          >
                            編輯
                          </button>
                          <button
                            className="btn-link btn-danger"
                            onClick={() => handleDeleteAdmin(admin)}
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 管理員 Modal */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={handleCloseAdminModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {adminModalMode === 'create' ? '新增管理員' : '編輯管理員'}
              </h2>
              <button className="modal-close" onClick={handleCloseAdminModal}>
                關閉
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>帳號 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={adminForm.username}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="請輸入帳號"
                />
              </div>
              <div className="form-group">
                <label>姓名 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="請輸入姓名"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="請輸入 Email"
                />
              </div>
              <div className="form-group">
                <label>{adminModalMode === 'create' ? '密碼 *' : '密碼（留空不修改）'}</label>
                <input
                  type="password"
                  className="form-input"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="請輸入密碼"
                />
              </div>
              <div className="form-group">
                <label>角色 *</label>
                <select
                  className="form-select"
                  value={adminForm.role}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="admin">管理員（完整權限）</option>
                  <option value="editor">編輯者（可編輯資料）</option>
                  <option value="viewer">檢視者（僅檢視）</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={handleCloseAdminModal} disabled={saving}>
                取消
              </button>
              <button className="btn-primary" onClick={handleSaveAdmin} disabled={saving}>
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
