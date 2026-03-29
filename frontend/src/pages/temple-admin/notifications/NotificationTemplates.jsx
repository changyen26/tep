/**
 * 推播通知管理 - 範本管理
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/templeAdminApi';
import './Notifications.css';

const categoryLabels = {
  event: '活動',
  reminder: '提醒',
  festival: '節慶',
  announcement: '公告',
  custom: '自訂',
};

const NotificationTemplates = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'custom',
    title: '',
    content: '',
  });

  useEffect(() => {
    loadTemplates();
  }, [templeId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.notifications.listTemplates(templeId);
      if (res.data?.success) {
        setTemplates(res.data.data || []);
      }
    } catch (err) {
      console.error('載入模板失敗', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({ name: '', category: 'custom', title: '', content: '' });
    setShowModal(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      title: template.title,
      content: template.content,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除此範本嗎？')) return;
    try {
      await api.notifications.deleteTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err) {
      alert('刪除失敗');
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.title.trim() || !formData.content.trim()) {
      alert('請填寫完整資料');
      return;
    }
    setSaving(true);
    try {
      if (editingTemplate) {
        const res = await api.notifications.updateTemplate(editingTemplate.id, formData);
        if (res.data?.success) {
          setTemplates(templates.map((t) => t.id === editingTemplate.id ? res.data.data : t));
        }
      } else {
        const res = await api.notifications.createTemplate({ ...formData, templeId: Number(templeId) });
        if (res.data?.success) {
          setTemplates([...templates, res.data.data]);
        }
      }
      setShowModal(false);
    } catch (err) {
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleUseTemplate = (template) => {
    navigate(`/temple-admin/${templeId}/notifications/new?template=${template.id}`);
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>訊息範本管理</h2>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate(`/temple-admin/${templeId}/notifications`)}>
            返回列表
          </button>
          <button className="btn-primary" onClick={handleCreate}>
            新增範本
          </button>
        </div>
      </div>

      <div className="templates-hint">
        <p>可使用的變數：</p>
        <div className="variable-tags">
          <span className="var-tag">{'{userName}'} 信眾姓名</span>
          <span className="var-tag">{'{templeName}'} 廟宇名稱</span>
          <span className="var-tag">{'{eventName}'} 活動名稱</span>
          <span className="var-tag">{'{eventDate}'} 活動日期</span>
          <span className="var-tag">{'{eventTime}'} 活動時間</span>
          <span className="var-tag">{'{location}'} 地點</span>
          <span className="var-tag">{'{lampType}'} 燈種</span>
          <span className="var-tag">{'{expireDate}'} 到期日</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">載入中...</div>
      ) : templates.length === 0 ? (
        <div className="empty-state">尚無範本，點擊「新增範本」建立</div>
      ) : (
        <div className="templates-grid">
          {templates.map((template) => (
            <div key={template.id} className="template-card">
              <div className="template-card-header">
                <div className="template-name">{template.name}</div>
                <span className={`category-badge ${template.category}`}>
                  {categoryLabels[template.category]}
                </span>
              </div>
              <div className="template-title">{template.title}</div>
              <div className="template-content-preview">
                {(template.content || '').substring(0, 100)}...
              </div>
              <div className="template-card-footer">
                <span className="usage-count">使用 {template.usageCount || 0} 次</span>
                <div className="template-actions">
                  <button className="btn-sm btn-primary" onClick={() => handleUseTemplate(template)}>
                    使用
                  </button>
                  {!template.isDefault && (
                    <>
                      <button className="btn-sm btn-secondary" onClick={() => handleEdit(template)}>
                        編輯
                      </button>
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(template.id)}>
                        刪除
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 編輯 Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTemplate ? '編輯範本' : '新增範本'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label required">範本名稱</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例：活動通知"
                />
              </div>
              <div className="form-group">
                <label className="form-label">分類</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="event">活動</option>
                  <option value="reminder">提醒</option>
                  <option value="festival">節慶</option>
                  <option value="announcement">公告</option>
                  <option value="custom">自訂</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label required">標題範本</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例：【活動通知】{eventName}"
                />
              </div>
              <div className="form-group">
                <label className="form-label required">內容範本</label>
                <textarea
                  className="form-textarea"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="輸入範本內容，可使用變數如 {userName}、{templeName} 等"
                  rows={10}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTemplates;
