import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const TempleAdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    // 固定為廟方管理員登入
    const result = await login({
      ...formData,
      login_type: 'temple_admin',
    });

    if (result.success) {
      const userData = result.data?.user;
      const accountType = result.data?.account_type;

      if (accountType === 'temple_admin' && userData?.temple_id) {
        // 導向廟方管理後台
        navigate(`/temple-admin/${userData.temple_id}/dashboard`);
      } else {
        setError('此帳號不是廟方管理員');
      }
    } else {
      setError(result.error || '登入失敗，請檢查您的帳號密碼');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>廟方管理後台</h1>
        <h2>管理員登入</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">帳號 (Email)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="請輸入管理員 Email"
              autoComplete="username"
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
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <p className="auth-link" style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          廟方管理員專用登入
        </p>
      </div>
    </div>
  );
};

export default TempleAdminLogin;
