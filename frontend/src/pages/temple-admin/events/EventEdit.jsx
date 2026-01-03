import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getEvent,
  updateEvent,
} from '../../../services/templeEventsService';
import './Events.css';

const EventEdit = () => {
  const { templeId, eventId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startAt: '',
    endAt: '',
    signupEndAt: '',
    capacity: '',
    fee: '',
    coverImageUrl: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // 載入活動資料
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await getEvent(eventId);

        if (response.success) {
          const event = response.data;
          setFormData({
            title: event.title || '',
            description: event.description || '',
            location: event.location || '',
            startAt: event.startAt || '',
            endAt: event.endAt || '',
            signupEndAt: event.signupEndAt || '',
            capacity: event.capacity || '',
            fee: event.fee || '',
            coverImageUrl: event.coverImageUrl || '',
          });
        } else {
          alert(response.message || '載入活動失敗');
          navigate(`/temple-admin/${templeId}/events`);
        }
      } catch (error) {
        console.error('載入活動失敗:', error);
        alert('載入活動失敗');
        navigate(`/temple-admin/${templeId}/events`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, templeId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

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

      const response = await updateEvent(eventId, payload);

      if (response.success) {
        alert('活動更新成功');
        navigate(`/temple-admin/${templeId}/events/${eventId}`);
      } else {
        alert(response.message || '更新失敗');
      }
    } catch (error) {
      console.error('更新活動失敗:', error);
      alert('更新活動失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/temple-admin/${templeId}/events/${eventId}`);
  };

  if (loading) {
    return <div className="loading-state">載入中...</div>;
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>編輯活動</h2>
      </div>

      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label required">活動名稱</label>
          <input
            type="text"
            name="title"
            className="form-input"
            value={formData.title}
            onChange={handleChange}
          />
          {formErrors.title && <div className="form-error">{formErrors.title}</div>}
        </div>

        <div className="form-group">
          <label className="form-label required">活動說明</label>
          <textarea
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
          />
          {formErrors.description && (
            <div className="form-error">{formErrors.description}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label required">地點</label>
          <input
            type="text"
            name="location"
            className="form-input"
            value={formData.location}
            onChange={handleChange}
          />
          {formErrors.location && <div className="form-error">{formErrors.location}</div>}
        </div>

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

        <div className="form-group">
          <label className="form-label required">名額</label>
          <input
            type="number"
            name="capacity"
            className="form-input"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
          />
          {formErrors.capacity && <div className="form-error">{formErrors.capacity}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">費用</label>
          <input
            type="number"
            name="fee"
            className="form-input"
            value={formData.fee}
            onChange={handleChange}
            min="0"
          />
          {formErrors.fee && <div className="form-error">{formErrors.fee}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">封面圖連結</label>
          <input
            type="url"
            name="coverImageUrl"
            className="form-input"
            value={formData.coverImageUrl}
            onChange={handleChange}
          />
        </div>

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
            {submitting ? '更新中...' : '更新活動'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventEdit;
