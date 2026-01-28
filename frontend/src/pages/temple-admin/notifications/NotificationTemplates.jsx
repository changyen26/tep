/**
 * 推播通知管理 - 範本管理
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Notifications.css';

// 預設範本
const defaultTemplates = [
  {
    id: 1,
    name: '活動通知',
    category: 'event',
    title: '【活動通知】{eventName}',
    content: '親愛的信眾您好：\n\n本殿將於 {eventDate} 舉辦「{eventName}」，誠摯邀請您蒞臨參與。\n\n活動地點：{location}\n活動時間：{eventTime}\n\n歡迎攜家帶眷同來參拜，三官大帝庇佑闔家平安！\n\n{templeName} 敬上',
    isDefault: true,
    usageCount: 12,
  },
  {
    id: 2,
    name: '點燈到期提醒',
    category: 'reminder',
    title: '【溫馨提醒】您的{lampType}即將到期',
    content: '親愛的 {userName} 信眾您好：\n\n您於本殿點的「{lampType}」將於 {expireDate} 到期。\n\n如欲續點，請於到期前至本殿服務處辦理，或透過線上系統申請。\n\n感謝您長期護持，三官大帝保佑您平安順遂！\n\n{templeName} 敬上',
    isDefault: true,
    usageCount: 8,
  },
  {
    id: 3,
    name: '新春祝福',
    category: 'festival',
    title: '【新春祝福】{templeName}恭賀新禧',
    content: '親愛的信眾：\n\n新春佳節，{templeName}全體同仁敬祝您：\n\n龍年行大運、福氣滿門庭！\n闔家平安、事業順遂、福慧增長！\n\n新春期間（除夕至初五）本殿照常開放，歡迎蒞臨參拜。\n\n{templeName} 敬上',
    isDefault: true,
    usageCount: 3,
  },
  {
    id: 4,
    name: '法會通知',
    category: 'event',
    title: '【法會通知】{eventName}',
    content: '各位信眾平安：\n\n本殿訂於 {eventDate} 啟建「{eventName}」，屆時恭請諸佛菩薩、三官大帝降臨壇場，為眾生消災祈福。\n\n法會時間：{eventTime}\n法會地點：本殿正殿\n\n歡迎十方信眾隨喜參加，同霑法益。\n\n{templeName} 敬啟',
    isDefault: false,
    usageCount: 5,
  },
  {
    id: 5,
    name: '營業時間調整',
    category: 'announcement',
    title: '【公告】營業時間調整通知',
    content: '各位信眾您好：\n\n因應{reason}，本殿營業時間調整如下：\n\n調整期間：{period}\n開放時間：{hours}\n\n造成不便，敬請見諒。如有任何疑問，歡迎來電洽詢。\n\n{templeName} 敬上',
    isDefault: false,
    usageCount: 2,
  },
];

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

  const [templates, setTemplates] = useState(defaultTemplates);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'custom',
    title: '',
    content: '',
  });

  const handleBack = () => {
    navigate(`/temple-admin/${templeId}/notifications`);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      category: 'custom',
      title: '',
      content: '',
    });
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

  const handleDelete = (id) => {
    if (window.confirm('確定要刪除此範本嗎？')) {
      setTemplates(templates.filter((t) => t.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.title.trim() || !formData.content.trim()) {
      alert('請填寫完整資料');
      return;
    }

    if (editingTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id ? { ...t, ...formData } : t
        )
      );
    } else {
      setTemplates([
        ...templates,
        {
          id: Date.now(),
          ...formData,
          isDefault: false,
          usageCount: 0,
        },
      ]);
    }
    setShowModal(false);
  };

  const handleUseTemplate = (template) => {
    // 跳轉到建立推播頁面並帶入範本
    navigate(`/temple-admin/${templeId}/notifications/new?template=${template.id}`);
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>訊息範本管理</h2>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleBack}>
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
              {template.content.substring(0, 100)}...
            </div>
            <div className="template-card-footer">
              <span className="usage-count">使用 {template.usageCount} 次</span>
              <div className="template-actions">
                <button
                  className="btn-sm btn-primary"
                  onClick={() => handleUseTemplate(template)}
                >
                  使用
                </button>
                {!template.isDefault && (
                  <>
                    <button
                      className="btn-sm btn-secondary"
                      onClick={() => handleEdit(template)}
                    >
                      編輯
                    </button>
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => handleDelete(template.id)}
                    >
                      刪除
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 編輯 Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTemplate ? '編輯範本' : '新增範本'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
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
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                取消
              </button>
              <button className="btn-primary" onClick={handleSave}>
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTemplates;
