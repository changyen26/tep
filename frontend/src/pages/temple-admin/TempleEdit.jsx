import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { templeAPI, uploadAPI } from '../../api';
import './TempleEdit.css';

const TempleEdit = () => {
  const { templeId } = useParams();

  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    main_deity: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    opening_hours: '',
    checkin_radius: 100,
    checkin_merit_points: 10,
    nfc_uid: '',
    images: [],
  });

  // 載入與錯誤狀態
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // 載入廟宇資料
  useEffect(() => {
    const loadTempleData = async () => {
      if (!templeId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await templeAPI.detail(templeId);
        if (response.data) {
          const temple = response.data;
          setFormData({
            name: temple.name || '',
            address: temple.address || '',
            latitude: temple.latitude || '',
            longitude: temple.longitude || '',
            main_deity: temple.main_deity || '',
            description: temple.description || '',
            phone: temple.phone || '',
            email: temple.email || '',
            website: temple.website || '',
            opening_hours: temple.opening_hours || '',
            checkin_radius: temple.checkin_radius || 100,
            checkin_merit_points: temple.checkin_merit_points || 10,
            nfc_uid: temple.nfc_uid || '',
            images: temple.images || [],
          });
        }
      } catch (err) {
        console.error('載入廟宇資料失敗:', err);
        setError('載入資料失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    loadTempleData();
  }, [templeId]);

  // 處理表單欄位變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccess(false);
  };

  // 處理圖片上傳
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'temple');

        const response = await uploadAPI.uploadFile(formData);
        return response.data?.url || null;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url) => url !== null);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...validUrls],
      }));
    } catch (err) {
      console.error('圖片上傳失敗:', err);
      alert('圖片上傳失敗');
    } finally {
      setUploadingImage(false);
    }
  };

  // 移除圖片
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // 準備提交的資料
      const submitData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        checkin_radius: parseInt(formData.checkin_radius) || 100,
        checkin_merit_points: parseInt(formData.checkin_merit_points) || 10,
      };

      await templeAPI.updateAsTempleAdmin(templeId, submitData);
      setSuccess(true);

      // 3秒後清除成功訊息
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('儲存失敗:', err);
      setError(err.message || '儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="temple-edit">
        <div className="loading-message">載入中...</div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="temple-edit">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="temple-edit">
      {/* 頁面標題 */}
      <div className="page-header">
        <h1 className="page-title">廟宇資訊編輯</h1>
        <p className="page-subtitle">編輯廟宇基本資訊、照片、位置、聯絡方式與打卡設定</p>
      </div>

      {/* 成功訊息 */}
      {success && (
        <div className="success-banner">
          <span>✓ 儲存成功！</span>
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="error-banner">
          <span>✗ {error}</span>
        </div>
      )}

      {/* 表單 */}
      <form onSubmit={handleSubmit} className="edit-form">
        {/* 基本資訊 */}
        <div className="form-section">
          <h2 className="section-title">基本資訊</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="name">廟宇名稱 *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="main_deity">主祀神明</label>
              <input
                type="text"
                id="main_deity"
                name="main_deity"
                className="form-input"
                value={formData.main_deity}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">廟宇簡介</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                rows="4"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* 照片 */}
        <div className="form-section">
          <h2 className="section-title">廟宇照片</h2>
          <div className="image-upload-section">
            <div className="image-grid">
              {formData.images.map((url, index) => (
                <div key={index} className="image-preview">
                  <img src={url} alt={`廟宇照片 ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="upload-control">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="file-input"
              />
              <label htmlFor="image-upload" className="btn-upload">
                {uploadingImage ? '上傳中...' : '+ 上傳照片'}
              </label>
            </div>
          </div>
        </div>

        {/* 位置資訊 */}
        <div className="form-section">
          <h2 className="section-title">位置資訊</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="address">地址</label>
              <input
                type="text"
                id="address"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="latitude">緯度</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                className="form-input"
                step="0.000001"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">經度</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                className="form-input"
                step="0.000001"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* 聯絡方式 */}
        <div className="form-section">
          <h2 className="section-title">聯絡方式</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="phone">電話</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="website">網站</label>
              <input
                type="url"
                id="website"
                name="website"
                className="form-input"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* 開放時間 */}
        <div className="form-section">
          <h2 className="section-title">開放時間</h2>
          <div className="form-group">
            <label htmlFor="opening_hours">開放時間說明</label>
            <textarea
              id="opening_hours"
              name="opening_hours"
              className="form-textarea"
              rows="3"
              placeholder="例：每日 06:00 - 21:00"
              value={formData.opening_hours}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* 打卡設定 */}
        <div className="form-section">
          <h2 className="section-title">打卡設定</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="checkin_radius">打卡範圍（公尺）</label>
              <input
                type="number"
                id="checkin_radius"
                name="checkin_radius"
                className="form-input"
                min="10"
                max="1000"
                value={formData.checkin_radius}
                onChange={handleChange}
              />
              <span className="field-hint">用戶需在此範圍內才能打卡</span>
            </div>

            <div className="form-group">
              <label htmlFor="checkin_merit_points">打卡獎勵點數</label>
              <input
                type="number"
                id="checkin_merit_points"
                name="checkin_merit_points"
                className="form-input"
                min="1"
                max="100"
                value={formData.checkin_merit_points}
                onChange={handleChange}
              />
              <span className="field-hint">每次打卡獲得的功德點數</span>
            </div>

            <div className="form-group full-width">
              <label htmlFor="nfc_uid">NFC UID</label>
              <input
                type="text"
                id="nfc_uid"
                name="nfc_uid"
                className="form-input"
                value={formData.nfc_uid}
                onChange={handleChange}
              />
              <span className="field-hint">NFC 標籤的唯一識別碼</span>
            </div>
          </div>
        </div>

        {/* 提交按鈕 */}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TempleEdit;
