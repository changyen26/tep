/**
 * 推播通知管理 - 建立新推播
 * 包含客群篩選、範本選擇、訊息預覽
 */
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Notifications.css';

// 預設範本
const defaultTemplates = [
  {
    id: 'event',
    name: '活動通知',
    title: '【活動通知】{eventName}',
    content: '親愛的信眾您好：\n\n本殿將於 {eventDate} 舉辦「{eventName}」，誠摯邀請您蒞臨參與。\n\n活動地點：{location}\n活動時間：{eventTime}\n\n歡迎攜家帶眷同來參拜，三官大帝庇佑闔家平安！\n\n{templeName} 敬上',
  },
  {
    id: 'reminder',
    name: '點燈提醒',
    title: '【溫馨提醒】您的{lampType}即將到期',
    content: '親愛的 {userName} 信眾您好：\n\n您於本殿點的「{lampType}」將於 {expireDate} 到期。\n\n如欲續點，請於到期前至本殿服務處辦理，或透過線上系統申請。\n\n感謝您長期護持，三官大帝保佑您平安順遂！\n\n{templeName} 敬上',
  },
  {
    id: 'festival',
    name: '節慶祝福',
    title: '【{festivalName}】{templeName}祝您{greeting}',
    content: '親愛的信眾：\n\n值此{festivalName}佳節，{templeName}全體同仁敬祝您：\n\n{greeting}\n闔家平安、事業順遂、福慧增長！\n\n{templeName} 敬上',
  },
  {
    id: 'announcement',
    name: '一般公告',
    title: '【公告】{subject}',
    content: '各位信眾您好：\n\n{content}\n\n如有任何疑問，歡迎來電或親臨本殿服務處洽詢。\n\n{templeName} 敬上',
  },
  {
    id: 'custom',
    name: '自訂訊息',
    title: '',
    content: '',
  },
];

// 客群選項
const audienceOptions = [
  { id: 'all', name: '全部信眾', description: '所有已註冊的信眾', count: 1250 },
  { id: 'active', name: '活躍信眾', description: '30天內有互動（打卡/訂單/報名）', count: 420 },
  { id: 'dormant', name: '休眠信眾', description: '超過90天無互動', count: 380 },
  { id: 'new', name: '新信眾', description: '30天內新註冊', count: 65 },
  { id: 'has_order', name: '有訂單記錄', description: '曾經下單的信眾', count: 280 },
  { id: 'lamp_expiring', name: '點燈即將到期', description: '30天內點燈到期', count: 85 },
  { id: 'birthday_month', name: '本月壽星', description: '本月生日的信眾', count: 42 },
  { id: 'event_registered', name: '特定活動報名者', description: '選擇特定活動的報名者', count: 0 },
  { id: 'custom', name: '自訂條件', description: '依打卡次數、消費金額等篩選', count: 0 },
];

// 活動列表（用於篩選特定活動報名者）
const eventOptions = [
  { id: 1, name: '上元天官賜福法會', registrations: 156 },
  { id: 2, name: '白河蓮花季祈福活動', registrations: 89 },
  { id: 3, name: '中元地官赦罪法會', registrations: 120 },
];

const NotificationNew = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  // 廟宇資訊
  const templeInfo = {
    name: '三官寶殿',
  };

  // 表單狀態
  const [step, setStep] = useState(1); // 1: 客群, 2: 內容, 3: 預覽
  const [channels, setChannels] = useState(['line', 'app']);
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [customFilters, setCustomFilters] = useState({
    minCheckins: '',
    maxCheckins: '',
    minSpend: '',
    maxSpend: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduleType, setScheduleType] = useState('now'); // now, scheduled
  const [scheduledAt, setScheduledAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 計算目標人數
  const targetCount = useMemo(() => {
    if (selectedAudience === 'event_registered' && selectedEvent) {
      const event = eventOptions.find((e) => e.id === Number(selectedEvent));
      return event?.registrations || 0;
    }
    if (selectedAudience === 'custom') {
      // 模擬自訂篩選結果
      return 150;
    }
    const audience = audienceOptions.find((a) => a.id === selectedAudience);
    return audience?.count || 0;
  }, [selectedAudience, selectedEvent]);

  // 套用範本
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    const template = defaultTemplates.find((t) => t.id === templateId);
    if (template && templateId !== 'custom') {
      // 替換變數
      let newTitle = template.title
        .replace('{templeName}', templeInfo.name)
        .replace('{eventName}', '法會活動')
        .replace('{lampType}', '光明燈')
        .replace('{festivalName}', '新春')
        .replace('{greeting}', '新年快樂')
        .replace('{subject}', '');
      let newContent = template.content
        .replace(/{templeName}/g, templeInfo.name)
        .replace('{eventName}', '法會活動')
        .replace('{eventDate}', '農曆正月十五')
        .replace('{eventTime}', '上午9:00')
        .replace('{location}', '本殿正殿')
        .replace('{userName}', '○○○')
        .replace('{lampType}', '光明燈')
        .replace('{expireDate}', '○月○日')
        .replace('{festivalName}', '新春')
        .replace('{greeting}', '新年快樂')
        .replace('{subject}', '')
        .replace('{content}', '');
      setTitle(newTitle);
      setContent(newContent);
    }
  };

  // 切換發送管道
  const toggleChannel = (channel) => {
    if (channels.includes(channel)) {
      if (channels.length > 1) {
        setChannels(channels.filter((c) => c !== channel));
      }
    } else {
      setChannels([...channels, channel]);
    }
  };

  // 下一步
  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  // 上一步
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // 送出
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(scheduleType === 'now' ? '推播已發送！' : '推播已排程！');
      navigate(`/temple-admin/${templeId}/notifications`);
    } catch (err) {
      alert('發送失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  // 儲存草稿
  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert('已儲存草稿');
      navigate(`/temple-admin/${templeId}/notifications`);
    } catch (err) {
      alert('儲存失敗');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>建立推播通知</h2>
        <button
          className="btn-secondary"
          onClick={() => navigate(`/temple-admin/${templeId}/notifications`)}
        >
          取消
        </button>
      </div>

      {/* 步驟指示 */}
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">選擇客群</div>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">編輯內容</div>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">預覽發送</div>
        </div>
      </div>

      {/* Step 1: 選擇客群 */}
      {step === 1 && (
        <div className="notification-form">
          <div className="form-section">
            <h3>發送管道</h3>
            <div className="channel-selector">
              <label className={`channel-option ${channels.includes('line') ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={channels.includes('line')}
                  onChange={() => toggleChannel('line')}
                />
                <span className="channel-icon line-icon">LINE</span>
                <span className="channel-name">LINE 推播</span>
              </label>
              <label className={`channel-option ${channels.includes('app') ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={channels.includes('app')}
                  onChange={() => toggleChannel('app')}
                />
                <span className="channel-icon app-icon">APP</span>
                <span className="channel-name">APP 推播</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>選擇發送客群</h3>
            <div className="audience-grid">
              {audienceOptions.map((audience) => (
                <label
                  key={audience.id}
                  className={`audience-option ${selectedAudience === audience.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="audience"
                    value={audience.id}
                    checked={selectedAudience === audience.id}
                    onChange={(e) => setSelectedAudience(e.target.value)}
                  />
                  <div className="audience-info">
                    <div className="audience-name">{audience.name}</div>
                    <div className="audience-desc">{audience.description}</div>
                    {audience.id !== 'event_registered' && audience.id !== 'custom' && (
                      <div className="audience-count">{audience.count} 人</div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* 特定活動選擇 */}
            {selectedAudience === 'event_registered' && (
              <div className="sub-filter">
                <label className="form-label">選擇活動</label>
                <select
                  className="form-select"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                >
                  <option value="">請選擇活動</option>
                  {eventOptions.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} ({event.registrations} 人報名)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 自訂條件 */}
            {selectedAudience === 'custom' && (
              <div className="sub-filter custom-filter">
                <div className="filter-row">
                  <label className="form-label">打卡次數</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="最少"
                      value={customFilters.minCheckins}
                      onChange={(e) =>
                        setCustomFilters({ ...customFilters, minCheckins: e.target.value })
                      }
                    />
                    <span>~</span>
                    <input
                      type="number"
                      placeholder="最多"
                      value={customFilters.maxCheckins}
                      onChange={(e) =>
                        setCustomFilters({ ...customFilters, maxCheckins: e.target.value })
                      }
                    />
                    <span>次</span>
                  </div>
                </div>
                <div className="filter-row">
                  <label className="form-label">累計消費</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="最少"
                      value={customFilters.minSpend}
                      onChange={(e) =>
                        setCustomFilters({ ...customFilters, minSpend: e.target.value })
                      }
                    />
                    <span>~</span>
                    <input
                      type="number"
                      placeholder="最多"
                      value={customFilters.maxSpend}
                      onChange={(e) =>
                        setCustomFilters({ ...customFilters, maxSpend: e.target.value })
                      }
                    />
                    <span>元</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="target-summary">
            <span className="target-label">預估發送人數：</span>
            <span className="target-count">{targetCount.toLocaleString()} 人</span>
          </div>

          <div className="form-actions">
            <button className="btn-primary" onClick={handleNext} disabled={targetCount === 0}>
              下一步：編輯內容
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 編輯內容 */}
      {step === 2 && (
        <div className="notification-form">
          <div className="form-section">
            <h3>選擇範本</h3>
            <div className="template-selector">
              {defaultTemplates.map((template) => (
                <button
                  key={template.id}
                  className={`template-btn ${selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>訊息內容</h3>
            <div className="form-group">
              <label className="form-label required">標題</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="輸入推播標題"
              />
            </div>
            <div className="form-group">
              <label className="form-label required">內容</label>
              <textarea
                className="form-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="輸入推播內容"
                rows={8}
              />
            </div>
            <div className="form-hint">
              可用變數：{'{userName}'} 信眾姓名、{'{templeName}'} 廟宇名稱
            </div>
          </div>

          <div className="form-section">
            <h3>發送時間</h3>
            <div className="schedule-options">
              <label className={`schedule-option ${scheduleType === 'now' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="schedule"
                  value="now"
                  checked={scheduleType === 'now'}
                  onChange={() => setScheduleType('now')}
                />
                <span>立即發送</span>
              </label>
              <label className={`schedule-option ${scheduleType === 'scheduled' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="schedule"
                  value="scheduled"
                  checked={scheduleType === 'scheduled'}
                  onChange={() => setScheduleType('scheduled')}
                />
                <span>排程發送</span>
              </label>
            </div>
            {scheduleType === 'scheduled' && (
              <div className="form-group">
                <input
                  type="datetime-local"
                  className="form-input"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={handleBack}>
              上一步
            </button>
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={!title.trim() || !content.trim()}
            >
              下一步：預覽
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 預覽發送 */}
      {step === 3 && (
        <div className="notification-form">
          <div className="preview-section">
            <div className="preview-column">
              <h3>LINE 訊息預覽</h3>
              <div className="line-preview">
                <div className="line-chat-bubble">
                  <div className="line-sender">
                    <div className="line-avatar">{templeInfo.name.charAt(0)}</div>
                    <span className="line-name">{templeInfo.name}</span>
                  </div>
                  <div className="line-message">
                    <div className="line-title">{title}</div>
                    <div className="line-content">{content}</div>
                  </div>
                  <div className="line-time">現在</div>
                </div>
              </div>
            </div>
            <div className="preview-column">
              <h3>APP 推播預覽</h3>
              <div className="app-preview">
                <div className="app-notification">
                  <div className="app-notif-header">
                    <div className="app-icon">{templeInfo.name.charAt(0)}</div>
                    <div className="app-notif-meta">
                      <span className="app-name">{templeInfo.name}</span>
                      <span className="app-time">現在</span>
                    </div>
                  </div>
                  <div className="app-notif-title">{title}</div>
                  <div className="app-notif-content">
                    {content.length > 100 ? content.substring(0, 100) + '...' : content}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="send-summary">
            <h3>發送摘要</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">發送管道</span>
                <span className="summary-value">
                  {channels.map((ch) => (ch === 'line' ? 'LINE' : 'APP')).join('、')}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">目標客群</span>
                <span className="summary-value">
                  {audienceOptions.find((a) => a.id === selectedAudience)?.name}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">預估人數</span>
                <span className="summary-value">{targetCount.toLocaleString()} 人</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">發送時間</span>
                <span className="summary-value">
                  {scheduleType === 'now' ? '立即發送' : scheduledAt || '未設定'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={handleBack}>
              上一步
            </button>
            <button className="btn-ghost" onClick={handleSaveDraft} disabled={submitting}>
              儲存草稿
            </button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? '處理中...'
                : scheduleType === 'now'
                ? '確認發送'
                : '確認排程'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationNew;
