/**
 * StaffNew - 新增服務人員帳號
 *
 * 填寫人員資料並指派權限角色
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Staff.css';

// Mock 角色資料
const mockRoles = [
  {
    id: 'manager',
    name: '廟務主管',
    description: '擁有完整管理權限，可管理所有功能及人員',
    permissions: ['all'],
    color: '#e74c3c',
  },
  {
    id: 'staff',
    name: '一般服務員',
    description: '可處理日常業務，包含打卡、訂單、信眾管理',
    permissions: ['checkins', 'orders', 'devotees', 'products'],
    color: '#3498db',
  },
  {
    id: 'cashier',
    name: '收銀員',
    description: '專責訂單與收入管理',
    permissions: ['orders', 'revenue', 'products'],
    color: '#27ae60',
  },
  {
    id: 'event_manager',
    name: '活動管理員',
    description: '專責活動與進香管理',
    permissions: ['events', 'pilgrimage', 'notifications'],
    color: '#9b59b6',
  },
  {
    id: 'lamp_manager',
    name: '點燈管理員',
    description: '專責點燈業務管理',
    permissions: ['lamps', 'certificates'],
    color: '#f39c12',
  },
  {
    id: 'viewer',
    name: '唯讀人員',
    description: '僅能查看資料，無法進行任何修改',
    permissions: ['view_only'],
    color: '#95a5a6',
  },
];

const StaffNew = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    sendWelcomeEmail: true,
    note: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  // 載入角色列表
  useEffect(() => {
    // TODO: 替換為實際 API
    setRoles(mockRoles);
  }, []);

  // 欄位變更
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // 清除該欄位的錯誤
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // 驗證表單
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '請輸入姓名';
    }

    if (!formData.email.trim()) {
      newErrors.email = '請輸入 Email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email 格式不正確';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '請輸入手機號碼';
    } else if (!/^09\d{8}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '手機號碼格式不正確';
    }

    if (!formData.password) {
      newErrors.password = '請輸入密碼';
    } else if (formData.password.length < 8) {
      newErrors.password = '密碼至少需要 8 個字元';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '兩次密碼輸入不一致';
    }

    if (!formData.role) {
      newErrors.role = '請選擇角色';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      // TODO: 替換為實際 API
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('服務人員帳號建立成功！');
      navigate(`/temple-admin/${templeId}/staff`);
    } catch (err) {
      alert('建立失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 取消
  const handleCancel = () => {
    if (formData.name || formData.email || formData.phone) {
      if (!window.confirm('確定要放棄目前的編輯內容嗎？')) return;
    }
    navigate(`/temple-admin/${templeId}/staff`);
  };

  // 產生隨機密碼
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      password,
      confirmPassword: password,
    }));
  };

  const selectedRole = roles.find(r => r.id === formData.role);

  return (
    <div className="staff-container">
      {/* 頁面標題 */}
      <div className="staff-header">
        <div className="header-left">
          <button className="btn-back" onClick={handleCancel}>
            ← 返回
          </button>
          <h2>新增服務人員</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="staff-form">
        {/* 基本資料區塊 */}
        <div className="form-section">
          <h3>基本資料</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                姓名 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="請輸入姓名"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                手機號碼 <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912-345-678"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-msg">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email（登入帳號）<span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@temple.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                密碼 <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type="text"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="至少 8 個字元"
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="btn-generate"
                  onClick={generatePassword}
                >
                  🔄 產生
                </button>
              </div>
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                確認密碼 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="再次輸入密碼"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && (
                <span className="error-msg">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="sendWelcomeEmail"
                checked={formData.sendWelcomeEmail}
                onChange={handleChange}
              />
              <span>發送帳號開通通知 Email 給此人員</span>
            </label>
          </div>
        </div>

        {/* 角色選擇區塊 */}
        <div className="form-section">
          <h3>
            權限角色 <span className="required">*</span>
          </h3>
          {errors.role && <span className="error-msg">{errors.role}</span>}

          <div className="role-grid">
            {roles.map(role => (
              <label
                key={role.id}
                className={`role-card ${formData.role === role.id ? 'selected' : ''}`}
                style={{ '--role-color': role.color }}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.id}
                  checked={formData.role === role.id}
                  onChange={handleChange}
                />
                <div className="role-card-content">
                  <div className="role-name">{role.name}</div>
                  <div className="role-desc">{role.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* 權限預覽 */}
          {selectedRole && (
            <div className="permission-preview">
              <h4>權限預覽</h4>
              <div className="permission-list">
                {selectedRole.permissions.includes('all') ? (
                  <span className="permission-tag all">所有功能</span>
                ) : selectedRole.permissions.includes('view_only') ? (
                  <span className="permission-tag readonly">僅供查看</span>
                ) : (
                  selectedRole.permissions.map(perm => (
                    <span key={perm} className="permission-tag">
                      {getPermissionLabel(perm)}
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 備註區塊 */}
        <div className="form-section">
          <h3>備註</h3>
          <div className="form-group">
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="可記錄此人員的職責說明或其他備註..."
              rows={3}
            />
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            取消
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '建立中...' : '建立帳號'}
          </button>
        </div>
      </form>
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

export default StaffNew;
