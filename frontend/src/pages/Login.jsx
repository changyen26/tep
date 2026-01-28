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
    login_type: 'temple_admin', // 固定為廟方管理員
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

      // 此入口僅允許廟方管理員登入
      if (accountType === 'temple_admin' && userData?.temple_id) {
        navigate(`/temple-admin/${userData.temple_id}/dashboard`);
      } else {
        setError('此帳號非廟方管理員，請使用正確入口登入');
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
        <h2>廟方管理員登入</h2>
        <p className="auth-notice">此入口僅供廟方管理員使用</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
