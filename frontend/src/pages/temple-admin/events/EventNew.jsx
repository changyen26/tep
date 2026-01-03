import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createEvent } from '../../../services/templeEventsService';
import './Events.css';

const EventNew = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  // 表單狀態
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startAt: '',
    endAt: '',
    signupEndAt: '',
    capacity: '',
    fee: '0',
    coverImageUrl: '',
    templeId: parseInt(templeId),
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // 處理欄位變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 清除該欄位的錯誤
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 表單驗證
  const validateForm = () => {
    const errors = {};

    // 必填欄位
    if (!formData.title?.trim()) errors.title = '請輸入活動名稱';
    if (!formData.description?.trim()) errors.description = '請輸入活動說明';
    if (!formData.location?.trim()) errors.location = '請輸入地點';
    if (!formData.startAt) errors.startAt = '請選擇活動開始時間';
    if (!formData.endAt) errors.endAt = '請選擇活動結束時間';
    if (!formData.signupEndAt) errors.signupEndAt = '請選擇報名截止時間';
    if (!formData.capacity || formData.capacity < 1) {
      errors.capacity = '名額必須至少為 1';
    }
    if (formData.fee < 0) errors.fee = '費用不可為負數';

    // 時間邏輯驗證
    if (formData.startAt && formData.endAt) {
      const start = new Date(formData.startAt);
      const end = new Date(formData.endAt);
      if (start >= end) {
        errors.endAt = '活動結束時間必須晚於開始時間';
      }
    }

    if (formData.startAt && formData.signupEndAt) {
      const start = new Date(formData.startAt);
      const signupEnd = new Date(formData.signupEndAt);
      if (signupEnd > start) {
        errors.signupEndAt = '報名截止時間不可晚於活動開始時間';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 處理提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('請檢查表單欄位');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity),
        fee: parseFloat(formData.fee),
      };

      const response = await createEvent(payload);

      if (response.success) {
        alert('活動建立成功');
        navigate(`/temple-admin/${templeId}/events`);
      } else {
        alert(response.message || '建立失敗');
      }
    } catch (error) {
      console.error('建立活動失敗:', error);
      alert('建立活動失敗');
    } finally {
      setSubmitting(false);
    }
  };

  // 處理取消
  const handleCancel = () => {
    navigate(`/temple-admin/${templeId}/events`);
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>新增活動</h2>
      </div>

      <form className="event-form" onSubmit={handleSubmit}>
        {/* 活動名稱 */}
        <div className="form-group">
          <label className="form-label required">活動名稱</label>
          <input
            type="text"
            name="title"
            className="form-input"
            value={formData.title}
            onChange={handleChange}
            placeholder="請輸入活動名稱"
          />
          {formErrors.title && <div className="form-error">{formErrors.title}</div>}
        </div>

        {/* 活動說明 */}
        <div className="form-group">
          <label className="form-label required">活動說明</label>
          <textarea
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="請輸入活動說明"
          />
          {formErrors.description && (
            <div className="form-error">{formErrors.description}</div>
          )}
        </div>

        {/* 地點 */}
        <div className="form-group">
          <label className="form-label required">地點</label>
          <input
            type="text"
            name="location"
            className="form-input"
            value={formData.location}
            onChange={handleChange}
            placeholder="請輸入活動地點"
          />
          {formErrors.location && <div className="form-error">{formErrors.location}</div>}
        </div>

        {/* 活動開始時間 */}
        <div className="form-group">
          <label className="form-label required">活動開始時間</label>
          <input
            type="datetime-local"
            name="startAt"
            className="form-input"
            value={formData.startAt}
            onChange={handleChange}
          />
          {formErrors.startAt && <div className="form-error">{formErrors.startAt}</div>}
        </div>

        {/* 活動結束時間 */}
        <div className="form-group">
          <label className="form-label required">活動結束時間</label>
          <input
            type="datetime-local"
            name="endAt"
            className="form-input"
            value={formData.endAt}
            onChange={handleChange}
          />
          {formErrors.endAt && <div className="form-error">{formErrors.endAt}</div>}
        </div>

        {/* 報名截止時間 */}
        <div className="form-group">
          <label className="form-label required">報名截止時間</label>
          <input
            type="datetime-local"
            name="signupEndAt"
            className="form-input"
            value={formData.signupEndAt}
            onChange={handleChange}
          />
          {formErrors.signupEndAt && (
            <div className="form-error">{formErrors.signupEndAt}</div>
          )}
        </div>

        {/* 名額 */}
        <div className="form-group">
          <label className="form-label required">名額</label>
          <input
            type="number"
            name="capacity"
            className="form-input"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            placeholder="請輸入活動名額"
          />
          {formErrors.capacity && <div className="form-error">{formErrors.capacity}</div>}
        </div>

        {/* 費用 */}
        <div className="form-group">
          <label className="form-label">費用</label>
          <input
            type="number"
            name="fee"
            className="form-input"
            value={formData.fee}
            onChange={handleChange}
            min="0"
            placeholder="請輸入活動費用（0 表示免費）"
          />
          {formErrors.fee && <div className="form-error">{formErrors.fee}</div>}
        </div>

        {/* 封面圖連結 */}
        <div className="form-group">
          <label className="form-label">封面圖連結</label>
          <input
            type="url"
            name="coverImageUrl"
            className="form-input"
            value={formData.coverImageUrl}
            onChange={handleChange}
            placeholder="請輸入封面圖 URL（可選）"
          />
          {formErrors.coverImageUrl && (
            <div className="form-error">{formErrors.coverImageUrl}</div>
          )}
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
            {submitting ? '建立中...' : '建立活動'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventNew;
