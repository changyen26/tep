import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLampType, updateLampType } from '../../../services/templeLampsService';
import './Lamps.css';

const LampTypeEdit = () => {
  const { templeId, lampTypeId } = useParams();
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  // 表單資料
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    year: currentYear,
    price: '',
    capacity: '',
    imageUrl: '',
  });

  // 狀態
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // 載入燈種資料
  useEffect(() => {
    const fetchLampType = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getLampType(templeId, lampTypeId);

        if (response.success) {
          const lampType = response.data;
          setFormData({
            name: lampType.name,
            description: lampType.description,
            year: lampType.year,
            price: lampType.price,
            capacity: lampType.capacity || '',
            imageUrl: lampType.imageUrl || '',
          });
        } else {
          setError(response.message || '載入燈種資料失敗');
        }
      } catch (err) {
        console.error('載入燈種資料失敗:', err);
        setError('載入燈種資料失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchLampType();
  }, [templeId, lampTypeId]);

  // 處理輸入變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 清除該欄位的驗證錯誤
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // 前端驗證
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = '請輸入燈種名稱';
    }

    if (!formData.description.trim()) {
      errors.description = '請輸入燈種說明';
    }

    if (!formData.year) {
      errors.year = '請選擇年度';
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      errors.price = '請輸入有效的價格（不可為負數）';
    }

    // capacity 可以為空（代表不限名額）
    if (formData.capacity && parseInt(formData.capacity) < 1) {
      errors.capacity = '名額必須至少為 1（或留空代表不限名額）';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 處理提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 前端驗證
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // 準備送出的資料
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        imageUrl: formData.imageUrl.trim() || null,
      };

      const response = await updateLampType(templeId, lampTypeId, payload);

      if (response.success) {
        alert('燈種更新成功');
        navigate(`/temple-admin/${templeId}/lamps/${lampTypeId}`);
      } else {
        setError(response.message || '更新燈種失敗');
      }
    } catch (err) {
      console.error('更新燈種失敗:', err);
      setError('更新燈種失敗');
    } finally {
      setSubmitting(false);
    }
  };

  // 處理取消
  const handleCancel = () => {
    navigate(`/temple-admin/${templeId}/lamps/${lampTypeId}`);
  };

  if (loading) {
    return (
      <div className="lamps-container">
        <div className="loading-state">載入中...</div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="lamps-container">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="lamps-container">
      <div className="lamps-header">
        <h2>編輯燈種</h2>
      </div>

      <div className="lamps-form-wrapper">
        <form className="lamps-form" onSubmit={handleSubmit}>
          {/* 錯誤訊息 */}
          {error && <div className="error-message">{error}</div>}

          {/* 燈種名稱 */}
          <div className="form-group">
            <label className="form-label required">燈種名稱</label>
            <input
              type="text"
              name="name"
              className={`form-input ${validationErrors.name ? 'error' : ''}`}
              placeholder="例如：光明燈、太歲燈"
              value={formData.name}
              onChange={handleChange}
            />
            {validationErrors.name && (
              <span className="error-text">{validationErrors.name}</span>
            )}
          </div>

          {/* 燈種說明 */}
          <div className="form-group">
            <label className="form-label required">燈種說明</label>
            <textarea
              name="description"
              className={`form-textarea ${validationErrors.description ? 'error' : ''}`}
              placeholder="請輸入燈種的詳細說明，例如功能、適合對象等"
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
            {validationErrors.description && (
              <span className="error-text">{validationErrors.description}</span>
            )}
          </div>

          {/* 年度 */}
          <div className="form-group">
            <label className="form-label required">年度</label>
            <select
              name="year"
              className={`form-select ${validationErrors.year ? 'error' : ''}`}
              value={formData.year}
              onChange={handleChange}
            >
              <option value={currentYear}>{currentYear}年</option>
              <option value={currentYear + 1}>{currentYear + 1}年</option>
            </select>
            {validationErrors.year && (
              <span className="error-text">{validationErrors.year}</span>
            )}
          </div>

          {/* 價格 */}
          <div className="form-group">
            <label className="form-label required">價格（元）</label>
            <input
              type="number"
              name="price"
              className={`form-input ${validationErrors.price ? 'error' : ''}`}
              placeholder="例如：600"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
            />
            {validationErrors.price && (
              <span className="error-text">{validationErrors.price}</span>
            )}
          </div>

          {/* 名額 */}
          <div className="form-group">
            <label className="form-label">名額限制（留空代表不限名額）</label>
            <input
              type="number"
              name="capacity"
              className={`form-input ${validationErrors.capacity ? 'error' : ''}`}
              placeholder="例如：108（留空代表不限名額）"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
            />
            {validationErrors.capacity && (
              <span className="error-text">{validationErrors.capacity}</span>
            )}
          </div>

          {/* 圖片 URL */}
          <div className="form-group">
            <label className="form-label">圖片 URL（選填）</label>
            <input
              type="url"
              name="imageUrl"
              className="form-input"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>

          {/* 操作按鈕 */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={submitting}
            >
              取消
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? '更新中...' : '更新燈種'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LampTypeEdit;
