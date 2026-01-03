import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    login_type: 'public', // 預設為一般使用者
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);

    if (result.success) {
      const userData = result.data?.user;
      const accountType = result.data?.account_type;

      // 根據 account_type 導向不同頁面
      if (accountType === 'super_admin') {
        // super_admin → 導向 system-admin-web
        const systemAdminUrl = import.meta.env.VITE_SYSTEM_ADMIN_URL || 'http://localhost:5174';
        window.location.href = systemAdminUrl;
      } else if (accountType === 'temple_admin' && userData?.temple_id) {
        // temple_admin → 導向廟方管理後台
        navigate(`/temple-admin/${userData.temple_id}/dashboard`);
      } else {
        // public → 導向預設頁面
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>護身符系統</h1>
        <h2>登入</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login_type">登入身分</label>
            <select
              id="login_type"
              name="login_type"
              value={formData.login_type}
              onChange={handleChange}
              required
            >
              <option value="public">一般使用者</option>
              <option value="temple_admin">廟方管理員</option>
              <option value="super_admin">系統管理員</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="請輸入 Email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="請輸入密碼"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <p className="auth-link">
          還沒有帳號？ <Link to="/register">立即註冊</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
