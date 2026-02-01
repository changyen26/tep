/**
 * 廟宇設定頁面
 * 現代化 UI/UX 設計
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './TempleEdit.css';

const USE_MOCK = true;

// Mock 廟宇資料 - 白河三官寶殿
const mockTempleData = {
  id: 1,
  name: '三官寶殿',
  subtitle: '天官、地官、水官三官大帝聖殿',
  address: '臺南市白河區外角里4鄰外角41號',
  latitude: 23.3517,
  longitude: 120.4158,
  main_deity: '三官大帝',
  description: '白河三官寶殿主祀三官大帝，為台南白河地區重要信仰中心。三官大帝掌管天、地、水三界，賜福赦罪解厄，護佑信眾平安順遂。',
  history: '本殿創建於清嘉慶年間，至今已有兩百餘年歷史。歷經多次整修擴建，現今廟貌莊嚴宏偉，香火鼎盛。',
  phone: '06-685-1234',
  fax: '06-685-1235',
  email: 'service@sanguantemple.org.tw',
  website: 'https://www.sanguantemple.org.tw',
  opening_hours: '每日 05:00 - 21:00',
  facebook: 'https://www.facebook.com/sanguantemple',
  instagram: '',
  youtube: '',
  line: '',
  checkin_radius: 100,
  checkin_merit_points: 10,
  nfc_uid: 'A1B2C3D4E5F6',
  images: [
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=400&h=300&fit=crop',
  ],
};

const TempleEdit = () => {
  const { templeId } = useParams();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    address: '',
    latitude: '',
    longitude: '',
    main_deity: '',
    description: '',
    history: '',
    phone: '',
    fax: '',
    email: '',
    website: '',
    opening_hours: '',
    facebook: '',
    instagram: '',
    youtube: '',
    line: '',
    checkin_radius: 100,
    checkin_merit_points: 10,
    nfc_uid: '',
    images: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Tab 設定
  const tabs = [
    { id: 'basic', label: '基本資訊', icon: '🏛️' },
    { id: 'media', label: '照片與媒體', icon: '📷' },
    { id: 'location', label: '位置資訊', icon: '📍' },
    { id: 'contact', label: '聯絡方式', icon: '📞' },
    { id: 'social', label: '社群媒體', icon: '🌐' },
    { id: 'checkin', label: '打卡設定', icon: '✅' },
  ];

  // 載入廟宇資料
  useEffect(() => {
    const loadTempleData = async () => {
      if (!templeId) return;

      setLoading(true);
      setError(null);

      try {
        if (USE_MOCK) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const temple = mockTempleData;
          setFormData({
            name: temple.name || '',
            subtitle: temple.subtitle || '',
            address: temple.address || '',
            latitude: temple.latitude || '',
            longitude: temple.longitude || '',
            main_deity: temple.main_deity || '',
            description: temple.description || '',
            history: temple.history || '',
            phone: temple.phone || '',
            fax: temple.fax || '',
            email: temple.email || '',
            website: temple.website || '',
            opening_hours: temple.opening_hours || '',
            facebook: temple.facebook || '',
            instagram: temple.instagram || '',
            youtube: temple.youtube || '',
            line: temple.line || '',
            checkin_radius: temple.checkin_radius || 100,
            checkin_merit_points: temple.checkin_merit_points || 10,
            nfc_uid: temple.nfc_uid || '',
            images: temple.images || [],
          });
        } else {
          const { templeAPI } = await import('../../api');
          const response = await templeAPI.detail(templeId);
          if (response.data) {
            const temple = response.data;
            setFormData({
              name: temple.name || '',
              subtitle: temple.subtitle || '',
              address: temple.address || '',
              latitude: temple.latitude || '',
              longitude: temple.longitude || '',
              main_deity: temple.main_deity || '',
              description: temple.description || '',
              history: temple.history || '',
              phone: temple.phone || '',
              fax: temple.fax || '',
              email: temple.email || '',
              website: temple.website || '',
              opening_hours: temple.opening_hours || '',
              facebook: temple.facebook || '',
              instagram: temple.instagram || '',
              youtube: temple.youtube || '',
              line: temple.line || '',
              checkin_radius: temple.checkin_radius || 100,
              checkin_merit_points: temple.checkin_merit_points || 10,
              nfc_uid: temple.nfc_uid || '',
              images: temple.images || [],
            });
          }
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
    setHasChanges(true);
  };

  // 處理圖片上傳
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockUrls = files.map((_, index) =>
          `https://picsum.photos/400/300?random=${Date.now() + index}`
        );
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...mockUrls],
        }));
        setHasChanges(true);
      } else {
        const { uploadAPI } = await import('../../api');
        const uploadPromises = files.map(async (file) => {
          const formDataObj = new FormData();
          formDataObj.append('file', file);
          formDataObj.append('type', 'temple');
          const response = await uploadAPI.uploadFile(formDataObj);
          return response.data?.url || null;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        const validUrls = uploadedUrls.filter((url) => url !== null);

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...validUrls],
        }));
        setHasChanges(true);
      }
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
    setHasChanges(true);
  };

  // 設為封面圖
  const handleSetCover = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const newImages = [...prev.images];
      const [selected] = newImages.splice(index, 1);
      newImages.unshift(selected);
      return { ...prev, images: newImages };
    });
    setHasChanges(true);
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const submitData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        checkin_radius: parseInt(formData.checkin_radius) || 100,
        checkin_merit_points: parseInt(formData.checkin_merit_points) || 10,
      };

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        Object.assign(mockTempleData, submitData);
        setSuccess(true);
        setHasChanges(false);
      } else {
        const { templeAPI } = await import('../../api');
        await templeAPI.updateAsTempleAdmin(templeId, submitData);
        setSuccess(true);
        setHasChanges(false);
      }

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
      <div className="temple-settings-page">
        <div className="settings-loading">
          <div className="loading-spinner"></div>
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="temple-settings-page">
      {/* 頁面標題 */}
      <div className="settings-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="header-title">廟宇設定</h1>
            <p className="header-subtitle">管理廟宇基本資訊、照片、位置與聯絡方式</p>
          </div>
          <div className="header-actions">
            {hasChanges && (
              <span className="unsaved-badge">有未儲存的變更</span>
            )}
            <button
              type="button"
              className="btn-save"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="btn-spinner"></span>
                  儲存中...
                </>
              ) : (
                <>💾 儲存設定</>
              )}
            </button>
          </div>
        </div>

        {/* 成功訊息 */}
        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            設定已成功儲存！
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">!</span>
            {error}
          </div>
        )}
      </div>

      {/* Tab 導航 */}
      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 內容區域 */}
      <form className="settings-content" onSubmit={handleSubmit}>
        {/* 基本資訊 */}
        {activeTab === 'basic' && (
          <div className="settings-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <span className="panel-icon">🏛️</span>
                基本資訊
              </h2>
              <p className="panel-desc">設定廟宇的基本資訊，這些資訊會顯示在官網和 APP 上</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  廟宇名稱 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="例：三官寶殿"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">副標題</label>
                <input
                  type="text"
                  name="subtitle"
                  className="form-input"
                  placeholder="例：天官、地官、水官三官大帝聖殿"
                  value={formData.subtitle}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">主祀神明</label>
                <input
                  type="text"
                  name="main_deity"
                  className="form-input"
                  placeholder="例：三官大帝、媽祖"
                  value={formData.main_deity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">開放時間</label>
                <input
                  type="text"
                  name="opening_hours"
                  className="form-input"
                  placeholder="例：每日 05:00 - 21:00"
                  value={formData.opening_hours}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">廟宇簡介</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  rows="4"
                  placeholder="請輸入廟宇的簡介，這段文字會顯示在官網首頁..."
                  value={formData.description}
                  onChange={handleChange}
                />
                <span className="form-hint">{formData.description.length} / 500 字</span>
              </div>

              <div className="form-group full-width">
                <label className="form-label">歷史沿革</label>
                <textarea
                  name="history"
                  className="form-textarea"
                  rows="4"
                  placeholder="請輸入廟宇的歷史背景、創建年代、重要事蹟等..."
                  value={formData.history}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* 照片與媒體 */}
        {activeTab === 'media' && (
          <div className="settings-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <span className="panel-icon">📷</span>
                照片與媒體
              </h2>
              <p className="panel-desc">上傳廟宇照片，第一張將作為封面圖片</p>
            </div>

            <div className="image-manager">
              <div className="image-grid">
                {formData.images.map((url, index) => (
                  <div key={index} className={`image-card ${index === 0 ? 'is-cover' : ''}`}>
                    <img src={url} alt={`廟宇照片 ${index + 1}`} />
                    <div className="image-overlay">
                      {index === 0 && (
                        <span className="cover-badge">封面</span>
                      )}
                      <div className="image-actions">
                        {index !== 0 && (
                          <button
                            type="button"
                            className="img-btn"
                            onClick={() => handleSetCover(index)}
                            title="設為封面"
                          >
                            ⭐
                          </button>
                        )}
                        <button
                          type="button"
                          className="img-btn danger"
                          onClick={() => handleRemoveImage(index)}
                          title="刪除"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 上傳按鈕 */}
                <label className="image-upload-card">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <>
                      <span className="upload-spinner"></span>
                      <span>上傳中...</span>
                    </>
                  ) : (
                    <>
                      <span className="upload-icon">📤</span>
                      <span>上傳照片</span>
                      <span className="upload-hint">支援 JPG, PNG</span>
                    </>
                  )}
                </label>
              </div>

              <div className="image-tips">
                <h4>📌 照片建議</h4>
                <ul>
                  <li>建議上傳至少 3-5 張高品質照片</li>
                  <li>照片尺寸建議 1200 x 800 像素以上</li>
                  <li>可拍攝：正殿、神像、建築外觀、特色景觀等</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 位置資訊 */}
        {activeTab === 'location' && (
          <div className="settings-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <span className="panel-icon">📍</span>
                位置資訊
              </h2>
              <p className="panel-desc">設定廟宇的地址和地理座標，用於地圖顯示和打卡定位</p>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">
                  地址 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  placeholder="例：臺南市白河區外角里4鄰外角41號"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">緯度 (Latitude)</label>
                <input
                  type="number"
                  name="latitude"
                  className="form-input"
                  placeholder="例：23.3517"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={handleChange}
                />
                <span className="form-hint">可從 Google Maps 取得</span>
              </div>

              <div className="form-group">
                <label className="form-label">經度 (Longitude)</label>
                <input
                  type="number"
                  name="longitude"
                  className="form-input"
                  placeholder="例：120.4158"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={handleChange}
                />
                <span className="form-hint">可從 Google Maps 取得</span>
              </div>
            </div>

            {/* 地圖預覽區塊 */}
            <div className="map-preview">
              <div className="map-placeholder">
                <span className="map-icon">🗺️</span>
                <p>地圖預覽</p>
                {formData.latitude && formData.longitude ? (
                  <span className="map-coords">
                    {formData.latitude}, {formData.longitude}
                  </span>
                ) : (
                  <span className="map-hint">請輸入經緯度以顯示位置</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 聯絡方式 */}
        {activeTab === 'contact' && (
          <div className="settings-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <span className="panel-icon">📞</span>
                聯絡方式
              </h2>
              <p className="panel-desc">設定廟宇的聯絡資訊，方便信眾聯繫</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">電話</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="例：06-685-1234"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">傳真</label>
                <input
                  type="tel"
                  name="fax"
                  className="form-input"
                  placeholder="例：06-685-1235"
                  value={formData.fax}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="例：service@temple.org.tw"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">官方網站</label>
                <input
                  type="url"
                  name="website"
                  className="form-input"
                  placeholder="例：https://www.temple.org.tw"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* 社群媒體 */}
        {activeTab === 'social' && (
          <div className="settings-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <span className="panel-icon">🌐</span>
                社群媒體
              </h2>
              <p className="panel-desc">連結廟宇的社群媒體帳號，增加曝光度</p>
            </div>

            <div className="social-grid">
              <div className="social-card">
                <div className="social-icon facebook">f</div>
                <div className="social-info">
                  <label className="form-label">Facebook 粉絲專頁</label>
                  <input
                    type="url"
                    name="facebook"
                    className="form-input"
                    placeholder="https://www.facebook.com/..."
                    value={formData.facebook}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="social-card">
                <div className="social-icon instagram">📷</div>
                <div className="social-info">
                  <label className="form-label">Instagram</label>
                  <input
                    type="url"
                    name="instagram"
                    className="form-input"
                    placeholder="https://www.instagram.com/..."
                    value={formData.instagram}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="social-card">
                <div className="social-icon youtube">▶</div>
                <div className="social-info">
                  <label className="form-label">YouTube 頻道</label>
                  <input
                    type="url"
                    name="youtube"
                    className="form-input"
                    placeholder="https://www.youtube.com/..."
                    value={formData.youtube}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="social-card">
                <div className="social-icon line">L</div>
                <div className="social-info">
                  <label className="form-label">LINE 官方帳號</label>
                  <input
                    type="url"
                    name="line"
                    className="form-input"
                    placeholder="https://line.me/..."
                    value={formData.line}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 打卡設定 */}
        {activeTab === 'checkin' && (
          <div className="settings-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <span className="panel-icon">✅</span>
                打卡設定
              </h2>
              <p className="panel-desc">設定信眾打卡的範圍和獎勵點數</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">打卡範圍（公尺）</label>
                <input
                  type="number"
                  name="checkin_radius"
                  className="form-input"
                  placeholder="100"
                  min="10"
                  max="1000"
                  value={formData.checkin_radius}
                  onChange={handleChange}
                />
                <span className="form-hint">信眾需在此範圍內才能成功打卡</span>
              </div>

              <div className="form-group">
                <label className="form-label">打卡獎勵點數</label>
                <input
                  type="number"
                  name="checkin_merit_points"
                  className="form-input"
                  placeholder="10"
                  min="1"
                  max="100"
                  value={formData.checkin_merit_points}
                  onChange={handleChange}
                />
                <span className="form-hint">每次打卡可獲得的功德點數</span>
              </div>

              <div className="form-group full-width">
                <label className="form-label">NFC 標籤 UID</label>
                <input
                  type="text"
                  name="nfc_uid"
                  className="form-input"
                  placeholder="例：A1B2C3D4E5F6（選填）"
                  value={formData.nfc_uid}
                  onChange={handleChange}
                />
                <span className="form-hint">如有設置 NFC 打卡牌，請輸入標籤的唯一識別碼</span>
              </div>
            </div>

            {/* 打卡統計預覽 */}
            <div className="checkin-stats">
              <h4>📊 打卡統計（本月）</h4>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">1,234</span>
                  <span className="stat-label">總打卡次數</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">456</span>
                  <span className="stat-label">獨立訪客</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">12,340</span>
                  <span className="stat-label">發放點數</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default TempleEdit;
