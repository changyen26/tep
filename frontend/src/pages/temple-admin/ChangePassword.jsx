import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../services/httpClient';
import './ChangePassword.css';

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // 驗證新密碼與確認密碼一致
    if (formData.newPassword !== formData.confirmPassword) {
      setError('新密碼與確認密碼不一致');
      setLoading(false);
      return;
    }

    // 驗證新密碼長度
    if (formData.newPassword.length < 6) {
      setError('新密碼至少需要 6 個字元');
      setLoading(false);
      return;
    }

    // 驗證新舊密碼不同
    if (formData.oldPassword === formData.newPassword) {
      setError('新密碼不能與舊密碼相同');
      setLoading(false);
      return;
    }

    try {
      await http.put('/auth/change-password', {
        old_password: formData.oldPassword,
        new_password: formData.newPassword,
      });

      setSuccess('密碼修改成功！');

      // 清空表單
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // 3秒後返回
      setTimeout(() => {
        navigate(-1);
      }, 2000);

    } catch (err) {
      setError(err.message || '密碼修改失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="page-header">
        <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <h1 className="page-title">修改密碼</h1>
      </div>

      <div className="change-password-card">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="oldPassword">
              舊密碼 <span className="required">*</span>
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              required
              placeholder="請輸入舊密碼"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">
              新密碼 <span className="required">*</span>
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="請輸入新密碼（至少 6 個字元）"
              autoComplete="new-password"
              minLength={6}
              disabled={loading}
            />
            <small className="form-hint">密碼至少需要 6 個字元</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              確認新密碼 <span className="required">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="請再次輸入新密碼"
              autoComplete="new-password"
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '修改中...' : '確認修改'}
            </button>
          </div>
        </form>

        <div className="password-tips">
          <h3>密碼安全建議</h3>
          <ul>
            <li>密碼長度至少 6 個字元（建議 8 個以上）</li>
            <li>使用英文大小寫、數字與符號的組合</li>
            <li>避免使用容易猜測的密碼（如生日、電話號碼）</li>
            <li>定期更換密碼以保護帳號安全</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
