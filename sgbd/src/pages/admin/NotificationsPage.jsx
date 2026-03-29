import { useState, useMemo, useEffect } from 'react'
import { useData } from '../../contexts/DataContext'
import { formatDateTime } from '../../utils/adminUtils'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import {
  Send, Mail, Smartphone, Users, User, Search, Pencil, Trash2,
  Plus, FileText, CheckCircle, AlertCircle, Clock, Info,
  ArrowRight, Zap, X, ChevronRight, Eye, MessageSquare
} from 'lucide-react'
import {
  resolveTemplate, buildVariables, processNotification, collectAllContacts
} from '../../services/notificationService'

const channelLabels = { email: 'Email', sms: '簡訊 SMS', both: 'Email + 簡訊' }
const channelIcons = { email: Mail, sms: Smartphone, both: Send }
const typeLabels = { manual: '手動', auto: '自動' }
const notifStatusLabels = { draft: '草稿', queued: '排隊中', sent: '已發送', failed: '發送失敗' }
const notifStatusColors = {
  draft: 'bg-gray-600/20 text-gray-400',
  queued: 'bg-amber-600/20 text-amber-400',
  sent: 'bg-green-600/20 text-green-400',
  failed: 'bg-red-600/20 text-red-400',
}

const templateCategories = [
  { value: 'lighting', label: '點燈' },
  { value: 'pilgrimage', label: '進香' },
  { value: 'registration', label: '活動報名' },
  { value: 'general', label: '一般' },
]

// 變數用中文標籤顯示，方便使用者理解
const variableOptions = [
  { code: '{{recipientName}}', label: '收件人姓名' },
  { code: '{{templeName}}', label: '廟名' },
  { code: '{{serviceType}}', label: '服務項目' },
  { code: '{{amount}}', label: '金額' },
  { code: '{{templePhone}}', label: '廟方電話' },
  { code: '{{date}}', label: '今天日期' },
  { code: '{{groupName}}', label: '進香團名' },
  { code: '{{visitDate}}', label: '參訪日期' },
  { code: '{{peopleCount}}', label: '人數' },
  { code: '{{eventTitle}}', label: '活動名稱' },
  { code: '{{eventDate}}', label: '活動日期' },
]

function NotificationsPage() {
  const {
    lightings, pilgrimages, registrations, contactMessages, siteContent,
    notifications, notificationTemplates, notificationRules,
    addNotification, updateNotification, deleteNotification,
    addNotificationTemplate, updateNotificationTemplate, deleteNotificationTemplate,
  } = useData()

  const [activeTab, setActiveTab] = useState('compose')

  // ===== Compose — wizard step =====
  const [composeStep, setComposeStep] = useState(1)
  const [recipientMode, setRecipientMode] = useState('') // '' | individual | group
  const [channel, setChannel] = useState('email')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [selectedRecipients, setSelectedRecipients] = useState([])
  const [sourceSearch, setSourceSearch] = useState('')
  const [sourceType, setSourceType] = useState('lighting')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)

  // ===== Pick up pre-selected recipient from MembersPage =====
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('sgbd_notif_recipient')
      if (stored) {
        sessionStorage.removeItem('sgbd_notif_recipient')
        const recipient = JSON.parse(stored)
        if (recipient && (recipient.email || recipient.phone)) {
          setRecipientMode('individual')
          setSelectedRecipients([recipient])
          setComposeStep(1)
        }
      }
    } catch { /* ignore */ }
  }, [])

  // ===== History Tab State =====
  const [historyFilter, setHistoryFilter] = useState('all')
  const [historySearch, setHistorySearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewingNotification, setViewingNotification] = useState(null)

  // ===== Templates Tab State =====
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [templateForm, setTemplateForm] = useState({ name: '', category: 'general', channel: 'email', subject: '', body: '' })
  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState(null)

  // ===== Computed =====
  const allContacts = useMemo(() =>
    collectAllContacts(lightings, pilgrimages, registrations, contactMessages),
    [lightings, pilgrimages, registrations, contactMessages]
  )
  const emailCount = allContacts.filter(c => c.email).length
  const phoneCount = allContacts.filter(c => c.phone).length
  const draftCount = notifications.filter(n => n.status === 'draft').length

  // Source list for individual mode
  const sourceItems = useMemo(() => {
    const q = sourceSearch.toLowerCase()
    if (sourceType === 'lighting') {
      return lightings.filter(l => {
        const names = l.members?.map(m => m.name).join(' ').toLowerCase() || ''
        return !q || names.includes(q) || l.phone?.includes(q) || l.email?.toLowerCase().includes(q)
      }).slice(0, 20)
    }
    if (sourceType === 'pilgrimage') {
      return pilgrimages.filter(p =>
        !q || p.templeName?.toLowerCase().includes(q) || p.contactName?.toLowerCase().includes(q) || p.phone?.includes(q)
      ).slice(0, 20)
    }
    if (sourceType === 'registration') {
      return registrations.filter(r =>
        !q || r.name?.toLowerCase().includes(q) || r.phone?.includes(q) || r.eventTitle?.toLowerCase().includes(q)
      ).slice(0, 20)
    }
    return []
  }, [sourceType, sourceSearch, lightings, pilgrimages, registrations])

  // ===== Compose handlers =====
  const handleSelectSource = (item) => {
    let recipient
    if (sourceType === 'lighting') {
      recipient = { name: item.members?.map(m => m.name).join('、') || '', email: item.email || '', phone: item.phone || '', sourceType: 'lighting', sourceId: item.id }
    } else if (sourceType === 'pilgrimage') {
      recipient = { name: item.contactName || '', email: item.email || '', phone: item.phone || '', sourceType: 'pilgrimage', sourceId: item.id }
    } else {
      recipient = { name: item.name || '', email: item.email || '', phone: item.phone || '', sourceType: 'registration', sourceId: item.id }
    }
    if (!selectedRecipients.find(r => r.sourceType === recipient.sourceType && r.sourceId === recipient.sourceId)) {
      setSelectedRecipients(prev => [...prev, recipient])
    }
  }

  const handleRemoveRecipient = (index) => {
    setSelectedRecipients(prev => prev.filter((_, i) => i !== index))
  }

  const handleApplyTemplate = (template) => {
    setSelectedTemplateId(String(template.id))
    setSubject(template.subject)
    setBody(template.body)
    if (template.channel) setChannel(template.channel)
  }

  // Quick scenario: jump to correct step with pre-filled mode
  const handleQuickScenario = (mode) => {
    setSendResult(null)
    setRecipientMode(mode)
    setComposeStep(1)
  }

  // Preview with variables resolved
  const previewVariables = useMemo(() => {
    if (selectedRecipients.length > 0) {
      const r = selectedRecipients[0]
      const sourceData = r.sourceType === 'lighting' ? lightings.find(l => l.id === r.sourceId) :
        r.sourceType === 'pilgrimage' ? pilgrimages.find(p => p.id === r.sourceId) :
        registrations.find(reg => reg.id === r.sourceId)
      return buildVariables(r.sourceType, sourceData, siteContent)
    }
    return buildVariables('general', null, siteContent)
  }, [selectedRecipients, lightings, pilgrimages, registrations, siteContent])

  const previewSubject = resolveTemplate(subject, previewVariables)
  const previewBody = resolveTemplate(body, previewVariables)

  const recipientCount = recipientMode === 'group'
    ? (channel === 'sms' ? phoneCount : channel === 'both' ? Math.max(emailCount, phoneCount) : emailCount)
    : selectedRecipients.length

  // Step validation helpers
  const step1Valid = recipientMode && (recipientMode === 'group' || selectedRecipients.length > 0)
  const step2Valid = body.trim().length > 0 && (channel === 'sms' || subject.trim().length > 0)

  const handleSend = async () => {
    const recipients = recipientMode === 'group'
      ? allContacts.filter(c => channel === 'sms' ? c.phone : c.email)
      : selectedRecipients

    if (recipients.length === 0) return
    if (!body.trim()) return

    setSending(true)
    setSendResult(null)

    try {
      const resolvedRecipients = recipients.map(r => {
        const sourceData = r.sourceType === 'lighting' ? lightings.find(l => l.id === r.sourceId) :
          r.sourceType === 'pilgrimage' ? pilgrimages.find(p => p.id === r.sourceId) :
          r.sourceType === 'registration' ? registrations.find(reg => reg.id === r.sourceId) : null
        const vars = buildVariables(r.sourceType || 'general', sourceData, siteContent)
        return { ...r, resolvedBody: resolveTemplate(body, vars), resolvedSubject: resolveTemplate(subject, vars) }
      })

      const notification = {
        channel,
        subject: resolvedRecipients[0]?.resolvedSubject || subject,
        body: resolvedRecipients[0]?.resolvedBody || body,
        recipients: resolvedRecipients,
      }

      const result = await processNotification(notification)

      addNotification({
        type: 'manual',
        channel,
        subject,
        body,
        recipientMode,
        recipientCount: recipients.length,
        recipients: recipients.map(r => ({ name: r.name, email: r.email, phone: r.phone })),
        status: result.status,
        sentAt: result.sentAt,
        templateId: selectedTemplateId ? Number(selectedTemplateId) : null,
      })

      setSendResult({ success: true, count: recipients.length, status: result.status })
    } catch (err) {
      setSendResult({ success: false, error: err.message })
    } finally {
      setSending(false)
    }
  }

  const handleSaveDraft = () => {
    const recipients = recipientMode === 'group'
      ? allContacts.filter(c => channel === 'sms' ? c.phone : c.email)
      : selectedRecipients

    addNotification({
      type: 'manual',
      channel,
      subject,
      body,
      recipientMode,
      recipientCount: recipients.length,
      recipients: recipients.map(r => ({ name: r.name, email: r.email, phone: r.phone })),
      status: 'draft',
      templateId: selectedTemplateId ? Number(selectedTemplateId) : null,
    })

    setSendResult({ success: true, draft: true })
  }

  const handleResetCompose = () => {
    setComposeStep(1)
    setRecipientMode('')
    setChannel('email')
    setSelectedTemplateId('')
    setSubject('')
    setBody('')
    setSelectedRecipients([])
    setSourceSearch('')
    setSendResult(null)
  }

  // ===== History handlers =====
  const filteredHistory = useMemo(() => {
    let result = [...notifications]
    if (historyFilter !== 'all') result = result.filter(n => n.status === historyFilter)
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase()
      result = result.filter(n => n.subject?.toLowerCase().includes(q) || n.body?.toLowerCase().includes(q))
    }
    return result
  }, [notifications, historyFilter, historySearch])

  const handleSendDraft = async (notification) => {
    updateNotification(notification.id, { status: 'queued' })
    try {
      const result = await processNotification({
        channel: notification.channel,
        subject: notification.subject,
        body: notification.body,
        recipients: notification.recipients || [],
      })
      updateNotification(notification.id, { status: result.status, sentAt: result.sentAt })
    } catch {
      updateNotification(notification.id, { status: 'failed' })
    }
  }

  const handleEditDraft = (notification) => {
    setActiveTab('compose')
    setChannel(notification.channel || 'email')
    setSubject(notification.subject || '')
    setBody(notification.body || '')
    setSelectedRecipients(notification.recipients || [])
    setRecipientMode(notification.recipientMode || 'individual')
    setComposeStep(2)
    deleteNotification(notification.id)
  }

  // ===== Template CRUD =====
  const handleOpenAddTemplate = () => {
    setEditingTemplate(null)
    setTemplateForm({ name: '', category: 'general', channel: 'email', subject: '', body: '' })
    setShowTemplateModal(true)
  }
  const handleOpenEditTemplate = (template) => {
    setEditingTemplate(template)
    setTemplateForm({ name: template.name, category: template.category, channel: template.channel, subject: template.subject, body: template.body })
    setShowTemplateModal(true)
  }
  const handleSaveTemplate = () => {
    if (!templateForm.name.trim()) return alert('請輸入模板名稱')
    if (editingTemplate) {
      updateNotificationTemplate(editingTemplate.id, templateForm)
    } else {
      addNotificationTemplate(templateForm)
    }
    setShowTemplateModal(false)
  }
  const handleDeleteTemplate = () => {
    if (deleteTemplateTarget) {
      deleteNotificationTemplate(deleteTemplateTarget)
      setDeleteTemplateTarget(null)
    }
  }

  // Insert variable into body textarea
  const insertVariable = (code, target) => {
    if (target === 'subject') {
      setSubject(prev => prev + code)
    } else if (target === 'templateBody') {
      setTemplateForm(p => ({ ...p, body: p.body + code }))
    } else if (target === 'templateSubject') {
      setTemplateForm(p => ({ ...p, subject: p.subject + code }))
    } else {
      setBody(prev => prev + code)
    }
  }

  const inputCls = "w-full px-3 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50 placeholder-gray-600"

  const tabs = [
    { id: 'compose', label: '發送通知', icon: Send },
    { id: 'history', label: '發送紀錄', icon: Clock, badge: draftCount },
    { id: 'templates', label: '模板管理', icon: FileText },
  ]

  // ===== Step indicator component =====
  const StepIndicator = ({ number, title, description, active, completed, onClick }) => (
    <button onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all w-full ${
        active ? 'bg-temple-gold/10 border-2 border-temple-gold/40' :
        completed ? 'bg-green-900/10 border-2 border-green-800/30 hover:border-green-700/40' :
        'bg-admin-dark border-2 border-admin-dark-lighter hover:border-gray-600'
      }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
        active ? 'bg-temple-gold text-admin-dark' :
        completed ? 'bg-green-600 text-white' :
        'bg-admin-dark-lighter text-gray-500'
      }`}>
        {completed ? <CheckCircle size={16} /> : number}
      </div>
      <div className="min-w-0">
        <div className={`text-sm font-medium ${active ? 'text-temple-gold' : completed ? 'text-green-400' : 'text-gray-400'}`}>{title}</div>
        <div className="text-xs text-gray-500 truncate">{description}</div>
      </div>
    </button>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-temple-gold mb-6 flex items-center gap-2">
        <Send size={24} />
        通知管理
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSendResult(null) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-temple-gold text-admin-dark font-medium' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
              <Icon size={16} />
              {tab.label}
              {tab.badge > 0 && (
                <span className="min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-amber-500 text-white text-[10px] rounded-full">{tab.badge}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ==================== COMPOSE TAB ==================== */}
      {activeTab === 'compose' && (
        <div>
          {/* === Send result (success/error) overlay === */}
          {sendResult ? (
            <div className="max-w-lg mx-auto text-center py-12">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${sendResult.success ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
                {sendResult.success
                  ? <CheckCircle size={32} className="text-green-400" />
                  : <AlertCircle size={32} className="text-red-400" />
                }
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {sendResult.success
                  ? (sendResult.draft ? '已儲存為草稿' : '通知發送成功！')
                  : '發送失敗'
                }
              </h2>
              <p className="text-gray-400 mb-6">
                {sendResult.success
                  ? (sendResult.draft
                      ? '草稿已儲存，您可以在「發送紀錄」中找到它，隨時編輯或發送。'
                      : `已成功發送給 ${sendResult.count} 位收件人，可在「發送紀錄」中查看狀態。`)
                  : `錯誤：${sendResult.error || '未知錯誤'}，請稍後再試。`
                }
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={handleResetCompose}
                  className="flex items-center gap-2 px-5 py-2.5 bg-temple-gold text-admin-dark rounded-lg font-medium hover:bg-temple-gold-light transition-colors">
                  <Plus size={16} /> 再發一則
                </button>
                <button onClick={() => { setActiveTab('history'); setSendResult(null) }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-admin-dark-lighter text-gray-300 rounded-lg hover:text-white transition-colors">
                  <Clock size={16} /> 查看紀錄
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* === Quick scenario cards === */}
              {!recipientMode && (
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-3">請先選擇您要做的事：</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button onClick={() => handleQuickScenario('individual')}
                      className="flex items-center gap-4 p-5 bg-admin-dark-light border-2 border-admin-dark-lighter rounded-xl text-left hover:border-temple-gold/40 transition-all group">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600/30 transition-colors">
                        <User size={24} className="text-blue-400" />
                      </div>
                      <div>
                        <div className="text-gray-200 font-medium">通知特定信眾</div>
                        <div className="text-xs text-gray-500 mt-0.5">選擇一位或多位信眾，發送個別通知</div>
                      </div>
                      <ChevronRight size={16} className="text-gray-600 ml-auto shrink-0 group-hover:text-temple-gold transition-colors" />
                    </button>
                    <button onClick={() => handleQuickScenario('group')}
                      className="flex items-center gap-4 p-5 bg-admin-dark-light border-2 border-admin-dark-lighter rounded-xl text-left hover:border-temple-gold/40 transition-all group">
                      <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600/30 transition-colors">
                        <Users size={24} className="text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-gray-200 font-medium">群發公告</div>
                        <div className="text-xs text-gray-500 mt-0.5">一次通知所有留有聯絡資訊的信眾</div>
                      </div>
                      <ChevronRight size={16} className="text-gray-600 ml-auto shrink-0 group-hover:text-temple-gold transition-colors" />
                    </button>
                    {draftCount > 0 && (
                      <button onClick={() => { setActiveTab('history'); setHistoryFilter('draft') }}
                        className="flex items-center gap-4 p-5 bg-admin-dark-light border-2 border-amber-800/30 rounded-xl text-left hover:border-amber-600/40 transition-all group">
                        <div className="w-12 h-12 bg-amber-600/20 rounded-xl flex items-center justify-center shrink-0">
                          <FileText size={24} className="text-amber-400" />
                        </div>
                        <div>
                          <div className="text-gray-200 font-medium">處理草稿 <span className="text-amber-400">({draftCount})</span></div>
                          <div className="text-xs text-gray-500 mt-0.5">有 {draftCount} 則草稿待處理</div>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 ml-auto shrink-0" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* === Wizard steps (when mode is selected) === */}
              {recipientMode && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Left — Step indicators */}
                  <div className="lg:col-span-1 space-y-2">
                    <StepIndicator number={1} title="選擇收件人" active={composeStep === 1} completed={step1Valid && composeStep > 1}
                      description={step1Valid ? `${recipientCount} 位收件人` : '尚未選擇'}
                      onClick={() => setComposeStep(1)} />
                    <StepIndicator number={2} title="編寫內容" active={composeStep === 2} completed={step2Valid && composeStep > 2}
                      description={step2Valid ? (subject || '(簡訊)') : '尚未填寫'}
                      onClick={() => step1Valid && setComposeStep(2)} />
                    <StepIndicator number={3} title="預覽發送" active={composeStep === 3} completed={false}
                      description="確認後送出"
                      onClick={() => step1Valid && step2Valid && setComposeStep(3)} />
                    <div className="pt-2">
                      <button onClick={handleResetCompose} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                        重新開始
                      </button>
                    </div>
                  </div>

                  {/* Right — Step content */}
                  <div className="lg:col-span-3">
                    {/* ===== Step 1: Recipients ===== */}
                    {composeStep === 1 && (
                      <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-semibold text-white">
                            步驟 1：選擇收件人
                          </h2>
                          <div className="flex gap-2">
                            <button onClick={() => setRecipientMode('individual')}
                              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${recipientMode === 'individual' ? 'bg-temple-gold text-admin-dark font-medium' : 'bg-admin-dark text-gray-400 hover:text-white'}`}>
                              <span className="flex items-center gap-1"><User size={12} /> 個別</span>
                            </button>
                            <button onClick={() => setRecipientMode('group')}
                              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${recipientMode === 'group' ? 'bg-temple-gold text-admin-dark font-medium' : 'bg-admin-dark text-gray-400 hover:text-white'}`}>
                              <span className="flex items-center gap-1"><Users size={12} /> 群發</span>
                            </button>
                          </div>
                        </div>

                        {recipientMode === 'individual' ? (
                          <div>
                            <p className="text-sm text-gray-400 mb-4">從訂單中搜尋信眾，點擊即可加入收件人清單</p>
                            {/* Source type tabs */}
                            <div className="flex gap-2 mb-3">
                              {[
                                { value: 'lighting', label: '點燈訂單', count: lightings.length },
                                { value: 'pilgrimage', label: '進香訂單', count: pilgrimages.length },
                                { value: 'registration', label: '活動報名', count: registrations.length },
                              ].map(s => (
                                <button key={s.value} onClick={() => setSourceType(s.value)}
                                  className={`px-3 py-2 rounded-lg text-xs transition-colors ${sourceType === s.value ? 'bg-temple-gold/20 text-temple-gold border border-temple-gold/30' : 'bg-admin-dark text-gray-400 hover:text-white border border-transparent'}`}>
                                  {s.label} <span className="opacity-60">({s.count})</span>
                                </button>
                              ))}
                            </div>

                            {/* Search */}
                            <div className="relative mb-3">
                              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                              <input type="text" value={sourceSearch} onChange={e => setSourceSearch(e.target.value)}
                                placeholder="輸入姓名、電話或信箱搜尋..."
                                className="w-full pl-9 pr-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-temple-gold/50" />
                            </div>

                            {/* List */}
                            <div className="max-h-48 overflow-y-auto space-y-1 mb-3">
                              {sourceItems.map(item => {
                                const name = sourceType === 'lighting' ? item.members?.map(m => m.name).join('、') :
                                  sourceType === 'pilgrimage' ? item.contactName : item.name
                                const detail = sourceType === 'lighting' ? (item.lightName || '點燈') :
                                  sourceType === 'pilgrimage' ? item.templeName : item.eventTitle
                                const isSelected = !!selectedRecipients.find(r => r.sourceType === sourceType && r.sourceId === item.id)
                                const hasContact = item.email || item.phone
                                return (
                                  <button key={item.id} onClick={() => hasContact && handleSelectSource(item)}
                                    disabled={isSelected || !hasContact}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                                      isSelected ? 'bg-temple-gold/10 border border-temple-gold/30' :
                                      !hasContact ? 'bg-admin-dark/50 opacity-50 cursor-not-allowed' :
                                      'bg-admin-dark hover:bg-admin-dark-lighter border border-transparent'
                                    }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-temple-gold/20' : 'bg-admin-dark-lighter'}`}>
                                      {isSelected ? <CheckCircle size={16} className="text-temple-gold" /> : <User size={14} className="text-gray-500" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-gray-200 font-medium truncate">{name}</div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {detail}
                                        {item.email && <span className="ml-2">{item.email}</span>}
                                        {item.phone && <span className="ml-2">{item.phone}</span>}
                                      </div>
                                    </div>
                                    {!hasContact && <span className="text-xs text-red-400 shrink-0">無聯絡資訊</span>}
                                  </button>
                                )
                              })}
                              {sourceItems.length === 0 && (
                                <div className="text-center py-6 text-gray-500">
                                  <Search size={24} className="mx-auto mb-2 opacity-40" />
                                  <p className="text-sm">{sourceSearch ? '找不到符合的資料' : '目前沒有訂單資料'}</p>
                                </div>
                              )}
                            </div>

                            {/* Selected list */}
                            {selectedRecipients.length > 0 && (
                              <div className="p-3 bg-admin-dark rounded-lg">
                                <div className="text-xs text-gray-400 mb-2">已選取 {selectedRecipients.length} 位收件人：</div>
                                <div className="flex flex-wrap gap-2">
                                  {selectedRecipients.map((r, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-temple-gold/10 text-temple-gold rounded-lg text-xs">
                                      <User size={12} />
                                      {r.name || r.email || r.phone}
                                      <button onClick={() => handleRemoveRecipient(i)} className="hover:text-red-400 transition-colors">
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-400 mb-4">將一次通知所有留有聯絡資訊的信眾</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-admin-dark rounded-lg text-center">
                                <Mail size={24} className="mx-auto text-blue-400 mb-2" />
                                <div className="text-2xl font-bold text-blue-400">{emailCount}</div>
                                <div className="text-xs text-gray-500 mt-1">可收 Email 信眾</div>
                              </div>
                              <div className="p-4 bg-admin-dark rounded-lg text-center">
                                <Smartphone size={24} className="mx-auto text-green-400 mb-2" />
                                <div className="text-2xl font-bold text-green-400">{phoneCount}</div>
                                <div className="text-xs text-gray-500 mt-1">可收簡訊信眾</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 mt-4 p-3 bg-blue-900/10 border border-blue-800/20 rounded-lg">
                              <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-blue-300">聯絡資訊來自點燈、進香、活動報名及聯絡留言，系統已自動去除重複</p>
                            </div>
                          </div>
                        )}

                        {/* Next button */}
                        <div className="mt-5 flex justify-end">
                          <button onClick={() => setComposeStep(2)} disabled={!step1Valid}
                            className="flex items-center gap-2 px-5 py-2.5 bg-temple-gold text-admin-dark rounded-lg font-medium hover:bg-temple-gold-light disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            下一步：編寫內容 <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ===== Step 2: Content ===== */}
                    {composeStep === 2 && (
                      <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-1">步驟 2：編寫通知內容</h2>
                        <p className="text-sm text-gray-400 mb-5">選擇頻道、套用模板或手動撰寫內容</p>

                        {/* Channel selection */}
                        <div className="mb-5">
                          <label className="block text-xs font-medium text-gray-400 mb-2">發送方式</label>
                          <div className="flex gap-2">
                            {Object.entries(channelLabels).map(([k, v]) => {
                              const Icon = channelIcons[k]
                              return (
                                <button key={k} onClick={() => setChannel(k)}
                                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors ${channel === k ? 'bg-temple-gold text-admin-dark font-medium' : 'bg-admin-dark text-gray-300 hover:text-white border border-admin-dark-lighter'}`}>
                                  <Icon size={16} /> {v}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Quick template cards */}
                        {notificationTemplates.length > 0 && (
                          <div className="mb-5">
                            <label className="block text-xs font-medium text-gray-400 mb-2">快速套用模板（點擊即填入內容）</label>
                            <div className="flex flex-wrap gap-2">
                              {notificationTemplates.map(t => (
                                <button key={t.id} onClick={() => handleApplyTemplate(t)}
                                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all ${
                                    selectedTemplateId === String(t.id)
                                      ? 'bg-temple-gold/20 text-temple-gold border border-temple-gold/30'
                                      : 'bg-admin-dark text-gray-400 hover:text-white border border-admin-dark-lighter hover:border-gray-600'
                                  }`}>
                                  <Zap size={12} />
                                  {t.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Subject */}
                        {channel !== 'sms' && (
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">主旨 *</label>
                            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                              placeholder="例：您的點燈已確認"
                              className={inputCls} />
                          </div>
                        )}

                        {/* Body */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">內容 *</label>
                          <textarea value={body} onChange={e => setBody(e.target.value)}
                            placeholder="在這裡輸入通知內容...&#10;&#10;小提示：使用下方的變數按鈕，可以自動帶入信眾姓名、金額等資訊"
                            rows={7}
                            className={`${inputCls} resize-none`} />
                        </div>

                        {/* Variables — friendly labels */}
                        <div className="p-3 bg-admin-dark rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <Info size={12} />
                            <span>點擊下方標籤可插入自動替換的變數（發送時會自動帶入對應資料）</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {variableOptions.map(v => (
                              <button key={v.code} onClick={() => insertVariable(v.code)}
                                className="px-2.5 py-1 bg-admin-dark-lighter text-gray-300 hover:text-temple-gold hover:bg-temple-gold/10 rounded-md text-xs transition-colors border border-transparent hover:border-temple-gold/20"
                                title={`插入 ${v.code}`}>
                                {v.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Nav buttons */}
                        <div className="mt-5 flex justify-between">
                          <button onClick={() => setComposeStep(1)}
                            className="text-sm text-gray-400 hover:text-white transition-colors">
                            &larr; 上一步
                          </button>
                          <button onClick={() => setComposeStep(3)} disabled={!step2Valid}
                            className="flex items-center gap-2 px-5 py-2.5 bg-temple-gold text-admin-dark rounded-lg font-medium hover:bg-temple-gold-light disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            下一步：預覽確認 <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ===== Step 3: Preview & Send ===== */}
                    {composeStep === 3 && (
                      <div className="space-y-5">
                        {/* Summary cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-4 text-center">
                            <Users size={20} className="mx-auto text-blue-400 mb-1" />
                            <div className="text-xl font-bold text-white">{recipientCount}</div>
                            <div className="text-xs text-gray-500">位收件人</div>
                          </div>
                          <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-4 text-center">
                            {channel === 'email' ? <Mail size={20} className="mx-auto text-blue-400 mb-1" /> :
                             channel === 'sms' ? <Smartphone size={20} className="mx-auto text-green-400 mb-1" /> :
                             <Send size={20} className="mx-auto text-purple-400 mb-1" />}
                            <div className="text-sm font-medium text-white mt-1">{channelLabels[channel]}</div>
                            <div className="text-xs text-gray-500">發送方式</div>
                          </div>
                          <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-4 text-center">
                            <MessageSquare size={20} className="mx-auto text-temple-gold mb-1" />
                            <div className="text-sm font-medium text-white mt-1">{recipientMode === 'group' ? '群發' : '個別'}</div>
                            <div className="text-xs text-gray-500">發送模式</div>
                          </div>
                        </div>

                        {/* Preview card — looks like an email */}
                        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl overflow-hidden">
                          <div className="px-5 py-3 bg-admin-dark border-b border-admin-dark-lighter flex items-center gap-2">
                            <Eye size={14} className="text-gray-500" />
                            <span className="text-xs text-gray-400">內容預覽（以第一位收件人為例）</span>
                          </div>
                          <div className="p-5">
                            <div className="bg-white rounded-lg p-5 text-gray-800">
                              {channel !== 'sms' && previewSubject && (
                                <div className="font-bold mb-3 pb-3 border-b border-gray-200 text-base">{previewSubject}</div>
                              )}
                              <div className="text-sm whitespace-pre-wrap leading-relaxed">{previewBody || '（尚未輸入內容）'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Recipient list summary */}
                        {recipientMode === 'individual' && selectedRecipients.length > 0 && (
                          <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-4">
                            <div className="text-xs text-gray-400 mb-2">收件人清單：</div>
                            <div className="flex flex-wrap gap-2">
                              {selectedRecipients.map((r, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-admin-dark text-gray-300 rounded text-xs">
                                  <User size={10} /> {r.name || r.email || r.phone}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button onClick={() => setComposeStep(2)}
                            className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors text-sm">
                            &larr; 回上一步修改
                          </button>
                          <div className="flex-1" />
                          <button onClick={handleSaveDraft}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm hover:text-white transition-colors">
                            <FileText size={16} />
                            先存草稿
                          </button>
                          <button onClick={handleSend} disabled={sending}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-temple-gold text-admin-dark rounded-lg font-medium hover:bg-temple-gold-light disabled:opacity-50 transition-all text-base">
                            <Send size={18} />
                            {sending ? '發送中...' : '確認發送'}
                          </button>
                        </div>

                        {/* Simulation notice */}
                        <div className="flex items-start gap-2 p-3 bg-amber-900/10 border border-amber-800/20 rounded-lg">
                          <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-300">目前為模擬模式，發送動作僅會記錄到系統中，不會真正寄出 Email 或簡訊。待串接 API 後即可正式發送。</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ==================== HISTORY TAB ==================== */}
      {activeTab === 'history' && (
        <div>
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: '全部' },
                { value: 'draft', label: '草稿' },
                { value: 'sent', label: '已發送' },
                { value: 'failed', label: '失敗' },
              ].map(f => (
                <button key={f.value} onClick={() => setHistoryFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${historyFilter === f.value ? 'bg-temple-gold text-admin-dark' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
                  {f.label}
                  <span className="ml-1 text-xs opacity-70">
                    ({f.value === 'all' ? notifications.length : notifications.filter(n => n.status === f.value).length})
                  </span>
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" value={historySearch} onChange={e => setHistorySearch(e.target.value)}
                placeholder="搜尋主旨或內容..."
                className="w-full sm:w-56 pl-9 pr-4 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-temple-gold/50" />
            </div>
          </div>

          {/* Empty state */}
          {filteredHistory.length === 0 ? (
            <div className="text-center py-16">
              <Send size={40} className="mx-auto text-gray-600 mb-3" />
              <h3 className="text-lg text-gray-400 mb-1">
                {historyFilter === 'all' ? '尚無通知紀錄' : `沒有「${notifStatusLabels[historyFilter] || historyFilter}」的通知`}
              </h3>
              <p className="text-sm text-gray-500 mb-4">發送通知後，紀錄會顯示在這裡</p>
              <button onClick={() => setActiveTab('compose')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light transition-colors">
                <Plus size={16} /> 發送第一則通知
              </button>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto rounded-xl border border-admin-dark-lighter">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-admin-dark-light border-b border-admin-dark-lighter">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">日期</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">類型</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">頻道</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">主旨</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">收件人</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">狀態</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-dark-lighter">
                  {filteredHistory.map(item => {
                    const ChIcon = channelIcons[item.channel] || Send
                    return (
                      <tr key={item.id} className="bg-admin-dark hover:bg-admin-dark-light transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDateTime(item.createdAt)}</td>
                        <td className="px-4 py-3 text-gray-300 text-xs">{typeLabels[item.type] || item.type}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-300">
                            <ChIcon size={12} /> {channelLabels[item.channel] || item.channel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-200 max-w-[200px] truncate">{item.subject || '(簡訊)'}</td>
                        <td className="px-4 py-3 text-gray-300 text-xs">{item.recipientCount || item.recipients?.length || 0} 人</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${notifStatusColors[item.status] || ''}`}>
                            {notifStatusLabels[item.status] || item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewingNotification(item)} className="p-1.5 text-gray-400 hover:text-temple-gold rounded hover:bg-admin-dark-lighter transition-colors" title="查看">
                              <Eye size={14} />
                            </button>
                            {item.status === 'draft' && (
                              <>
                                <button onClick={() => handleEditDraft(item)} className="p-1.5 text-gray-400 hover:text-blue-400 rounded hover:bg-blue-900/20 transition-colors" title="編輯並發送">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => handleSendDraft(item)} className="p-1.5 text-gray-400 hover:text-green-400 rounded hover:bg-green-900/20 transition-colors" title="立即發送">
                                  <Send size={14} />
                                </button>
                              </>
                            )}
                            <button onClick={() => setDeleteTarget(item.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-red-900/20 transition-colors" title="刪除">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== TEMPLATES TAB ==================== */}
      {activeTab === 'templates' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400">模板可以預先設定好通知內容，發送時一鍵套用，不需要每次重打</p>
            </div>
            <button onClick={handleOpenAddTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light transition-colors shrink-0">
              <Plus size={16} /> 新增模板
            </button>
          </div>

          {notificationTemplates.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={40} className="mx-auto text-gray-600 mb-3" />
              <h3 className="text-lg text-gray-400 mb-1">尚無通知模板</h3>
              <p className="text-sm text-gray-500 mb-4">建立模板後，發送通知時就能一鍵套用，大幅節省時間</p>
              <button onClick={handleOpenAddTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light transition-colors">
                <Plus size={16} /> 建立第一個模板
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notificationTemplates.map(template => {
                const catLabel = templateCategories.find(c => c.value === template.category)?.label || template.category
                const ChIcon = channelIcons[template.channel] || Send
                return (
                  <div key={template.id} className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5 hover:border-temple-gold/30 transition-colors group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-gray-200 font-medium text-sm">{template.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs px-2 py-0.5 rounded bg-admin-dark text-gray-400">{catLabel}</span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500"><ChIcon size={12} /> {channelLabels[template.channel]}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEditTemplate(template)} className="p-1.5 text-gray-400 hover:text-blue-400 rounded hover:bg-blue-900/20 transition-colors" title="編輯">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteTemplateTarget(template.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-red-900/20 transition-colors" title="刪除">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {template.subject && (
                      <div className="text-xs text-gray-400 mb-1.5">
                        <span className="text-gray-500">主旨：</span>{template.subject}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 line-clamp-3 whitespace-pre-wrap leading-relaxed">{template.body}</div>
                    <button onClick={() => { setActiveTab('compose'); handleQuickScenario('individual'); handleApplyTemplate(template) }}
                      className="mt-3 flex items-center gap-1 text-xs text-temple-gold/70 hover:text-temple-gold transition-colors">
                      <Send size={11} /> 使用此模板發送
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== View Notification Detail Modal ===== */}
      <AdminModal isOpen={!!viewingNotification} onClose={() => setViewingNotification(null)} title="通知詳情"
        footer={<button onClick={() => setViewingNotification(null)} className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm hover:text-white">關閉</button>}>
        {viewingNotification && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">狀態</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${notifStatusColors[viewingNotification.status] || ''}`}>
                    {notifStatusLabels[viewingNotification.status]}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">頻道</span>
                <p className="text-gray-200 text-sm">{channelLabels[viewingNotification.channel]}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">建立時間</span>
                <p className="text-gray-200 text-sm">{formatDateTime(viewingNotification.createdAt)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">收件人數</span>
                <p className="text-gray-200 text-sm">{viewingNotification.recipientCount || viewingNotification.recipients?.length || 0} 人</p>
              </div>
            </div>
            {viewingNotification.subject && (
              <div>
                <span className="text-xs text-gray-500">主旨</span>
                <p className="text-gray-200">{viewingNotification.subject}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-gray-500">內容</span>
              <div className="mt-1 p-3 bg-admin-dark rounded-lg text-gray-300 text-sm whitespace-pre-wrap">{viewingNotification.body || '(無內容)'}</div>
            </div>
            {viewingNotification.recipients?.length > 0 && (
              <div>
                <span className="text-xs text-gray-500">收件人</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {viewingNotification.recipients.slice(0, 20).map((r, i) => (
                    <span key={i} className="px-2 py-1 bg-admin-dark rounded text-xs text-gray-400">{r.name || r.email || r.phone}</span>
                  ))}
                  {viewingNotification.recipients.length > 20 && (
                    <span className="px-2 py-1 text-xs text-gray-500">...還有 {viewingNotification.recipients.length - 20} 人</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* ===== Template Modal ===== */}
      <AdminModal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)}
        title={editingTemplate ? '編輯模板' : '新增模板'} size="md"
        footer={<>
          <button onClick={() => setShowTemplateModal(false)} className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm hover:text-white">取消</button>
          <button onClick={handleSaveTemplate} className="px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light">{editingTemplate ? '儲存變更' : '建立模板'}</button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">模板名稱 *</label>
            <input type="text" value={templateForm.name} onChange={e => setTemplateForm(p => ({ ...p, name: e.target.value }))} placeholder="例：點燈確認通知" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">分類</label>
              <select value={templateForm.category} onChange={e => setTemplateForm(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                {templateCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">頻道</label>
              <select value={templateForm.channel} onChange={e => setTemplateForm(p => ({ ...p, channel: e.target.value }))} className={inputCls}>
                <option value="email">Email</option>
                <option value="sms">簡訊 SMS</option>
                <option value="both">Email + 簡訊</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">主旨</label>
            <input type="text" value={templateForm.subject} onChange={e => setTemplateForm(p => ({ ...p, subject: e.target.value }))} placeholder="通知主旨" className={inputCls} />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {variableOptions.slice(0, 4).map(v => (
                <button key={v.code} onClick={() => insertVariable(v.code, 'templateSubject')}
                  className="px-2 py-0.5 bg-admin-dark text-gray-500 hover:text-temple-gold rounded text-[10px] transition-colors">{v.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">內容</label>
            <textarea value={templateForm.body} onChange={e => setTemplateForm(p => ({ ...p, body: e.target.value }))} placeholder="通知內容" rows={6} className={`${inputCls} resize-none`} />
          </div>
          <div className="p-3 bg-admin-dark rounded-lg">
            <div className="text-xs text-gray-500 mb-1.5">點擊插入變數到內容中：</div>
            <div className="flex flex-wrap gap-1.5">
              {variableOptions.map(v => (
                <button key={v.code} onClick={() => insertVariable(v.code, 'templateBody')}
                  className="px-2.5 py-1 bg-admin-dark-lighter text-gray-300 hover:text-temple-gold hover:bg-temple-gold/10 rounded-md text-xs transition-colors">{v.label}</button>
              ))}
            </div>
          </div>
        </div>
      </AdminModal>

      {/* Delete notification confirm */}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteNotification(deleteTarget); setDeleteTarget(null) }}
        title="確認刪除" message="確定要刪除此筆通知紀錄嗎？" />

      {/* Delete template confirm */}
      <ConfirmDialog isOpen={!!deleteTemplateTarget} onClose={() => setDeleteTemplateTarget(null)}
        onConfirm={handleDeleteTemplate}
        title="確認刪除" message="確定要刪除此模板嗎？" />
    </div>
  )
}

export default NotificationsPage
