import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { loadFromStorage, saveToStorage } from '../../utils/storage'
import { Lock, Download, Upload, RotateCcw, FileText, AlertTriangle, Bell, Mail, Smartphone, Send } from 'lucide-react'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

function SettingsPage() {
  const { user } = useAuth()
  const { notificationSettings, notificationRules, updateNotificationSettings, updateNotificationRule } = useData()
  const [activeTab, setActiveTab] = useState('password')
  const [resetConfirm, setResetConfirm] = useState(false)

  // Password
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')

  // Receipt settings
  const [receiptPrefix, setReceiptPrefix] = useState(loadFromStorage('receipt_prefix', 'SGBD'))
  const [receiptStart, setReceiptStart] = useState(loadFromStorage('receipt_counter', 0))
  const [templeInfo, setTempleInfo] = useState(loadFromStorage('receipt_temple_info', {
    name: '白河三官寶殿',
    address: '臺南市白河區外角里4鄰外角41號',
    phone: '06-685-2428',
  }))
  const [settingSaved, setSettingSaved] = useState(false)

  const handlePasswordChange = () => {
    if (currentPw !== 'sgbd2024') { setPwMsg('目前密碼不正確'); return }
    if (newPw.length < 4) { setPwMsg('新密碼至少 4 個字元'); return }
    if (newPw !== confirmPw) { setPwMsg('兩次密碼不一致'); return }
    setPwMsg('密碼修改成功（提示：本系統為展示用，密碼僅存在本次工作階段）')
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
  }

  const handleExportData = () => {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('sgbd_')) {
        data[key] = localStorage.getItem(key)
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `sgbd_backup_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handleImportData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith('sgbd_')) localStorage.setItem(key, value)
        })
        window.location.reload()
      } catch {
        alert('匯入失敗：檔案格式不正確')
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key.startsWith('sgbd_')) localStorage.removeItem(key)
    }
    window.location.reload()
  }

  const saveReceiptSettings = () => {
    saveToStorage('receipt_prefix', receiptPrefix)
    saveToStorage('receipt_counter', receiptStart)
    saveToStorage('receipt_temple_info', templeInfo)
    setSettingSaved(true)
    setTimeout(() => setSettingSaved(false), 2000)
  }

  const inputCls = "w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50"

  return (
    <div>
      <h1 className="text-2xl font-bold text-temple-gold mb-6">系統設定</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'password', label: '修改密碼', icon: Lock },
          { id: 'data', label: '資料管理', icon: Download },
          { id: 'receipt', label: '收據設定', icon: FileText },
          { id: 'notification', label: '通知設定', icon: Bell },
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-temple-gold text-admin-dark font-medium' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
              <Icon size={16} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Password */}
      {activeTab === 'password' && (
        <div className="max-w-md bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">修改管理員密碼</h2>
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-400 mb-1">目前密碼</label><input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className={inputCls} /></div>
            <div><label className="block text-sm text-gray-400 mb-1">新密碼</label><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className={inputCls} /></div>
            <div><label className="block text-sm text-gray-400 mb-1">確認新密碼</label><input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className={inputCls} /></div>
            {pwMsg && <p className={`text-sm ${pwMsg.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>{pwMsg}</p>}
            <button onClick={handlePasswordChange} className="px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light">修改密碼</button>
          </div>
        </div>
      )}

      {/* Data Management */}
      {activeTab === 'data' && (
        <div className="max-w-lg space-y-4">
          <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">資料備份</h2>
            <p className="text-sm text-gray-400 mb-4">匯出所有後台資料為 JSON 檔案</p>
            <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light">
              <Download size={16} /> 匯出備份
            </button>
          </div>

          <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">匯入資料</h2>
            <p className="text-sm text-gray-400 mb-4">從 JSON 備份檔匯入資料（將覆蓋現有資料）</p>
            <label className="flex items-center gap-2 px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm cursor-pointer hover:text-white w-fit">
              <Upload size={16} /> 選擇檔案
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>
          </div>

          <div className="bg-admin-dark-light border border-red-900/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-red-400" />
              <h2 className="text-lg font-semibold text-red-400">重置資料</h2>
            </div>
            <p className="text-sm text-gray-400 mb-4">清除所有後台資料並恢復預設值，此操作無法復原</p>
            <button onClick={() => setResetConfirm(true)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm">重置所有資料</button>
          </div>
        </div>
      )}

      {/* Receipt Settings */}
      {activeTab === 'receipt' && (
        <div className="max-w-md bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">收據設定</h2>
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-400 mb-1">收據前綴</label><input type="text" value={receiptPrefix} onChange={e => setReceiptPrefix(e.target.value)} className={inputCls} /></div>
            <div><label className="block text-sm text-gray-400 mb-1">目前序號</label><input type="number" value={receiptStart} onChange={e => setReceiptStart(Number(e.target.value))} className={inputCls} /></div>
            <div className="border-t border-admin-dark-lighter pt-4">
              <h3 className="text-sm text-gray-400 mb-3">廟方資訊（列印於收據上）</h3>
              <div className="space-y-3">
                <div><label className="block text-xs text-gray-500 mb-1">廟名</label><input type="text" value={templeInfo.name} onChange={e => setTempleInfo(p => ({ ...p, name: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">地址</label><input type="text" value={templeInfo.address} onChange={e => setTempleInfo(p => ({ ...p, address: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">電話</label><input type="text" value={templeInfo.phone} onChange={e => setTempleInfo(p => ({ ...p, phone: e.target.value }))} className={inputCls} /></div>
              </div>
            </div>
            <button onClick={saveReceiptSettings}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${settingSaved ? 'bg-green-600 text-white' : 'bg-temple-gold text-admin-dark hover:bg-temple-gold-light'}`}>
              {settingSaved ? '已儲存！' : '儲存設定'}
            </button>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notification' && (
        <div className="max-w-2xl space-y-4">
          {/* Auto trigger toggle */}
          <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">自動通知</h2>
                <p className="text-sm text-gray-400 mt-1">啟用後，訂單狀態變更時將自動建立通知草稿或發送</p>
              </div>
              <button
                onClick={() => updateNotificationSettings({ autoEnabled: !notificationSettings.autoEnabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${notificationSettings.autoEnabled ? 'bg-temple-gold' : 'bg-admin-dark-lighter'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${notificationSettings.autoEnabled ? 'left-[26px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Email settings */}
          <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={18} className="text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Email 設定</h2>
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                模擬模式
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">API Key</label>
                <input type="password" value={notificationSettings.emailProvider?.apiKey || ''} onChange={e => updateNotificationSettings({ emailProvider: { ...notificationSettings.emailProvider, apiKey: e.target.value } })} placeholder="目前為模擬模式，無需填寫" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">寄件人 Email</label>
                  <input type="email" value={notificationSettings.emailProvider?.senderEmail || ''} onChange={e => updateNotificationSettings({ emailProvider: { ...notificationSettings.emailProvider, senderEmail: e.target.value } })} placeholder="noreply@temple.org.tw" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">寄件人名稱</label>
                  <input type="text" value={notificationSettings.emailProvider?.senderName || ''} onChange={e => updateNotificationSettings({ emailProvider: { ...notificationSettings.emailProvider, senderName: e.target.value } })} placeholder="白河三官寶殿" className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* SMS settings */}
          <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone size={18} className="text-green-400" />
              <h2 className="text-lg font-semibold text-white">SMS 設定</h2>
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                模擬模式
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Account SID</label>
                <input type="text" value={notificationSettings.smsProvider?.accountSid || ''} onChange={e => updateNotificationSettings({ smsProvider: { ...notificationSettings.smsProvider, accountSid: e.target.value } })} placeholder="目前為模擬模式，無需填寫" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Auth Token</label>
                  <input type="password" value={notificationSettings.smsProvider?.authToken || ''} onChange={e => updateNotificationSettings({ smsProvider: { ...notificationSettings.smsProvider, authToken: e.target.value } })} placeholder="••••••••" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">發送號碼</label>
                  <input type="text" value={notificationSettings.smsProvider?.fromNumber || ''} onChange={e => updateNotificationSettings({ smsProvider: { ...notificationSettings.smsProvider, fromNumber: e.target.value } })} placeholder="+886..." className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* Auto trigger rules */}
          <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">自動觸發規則</h2>
              <Link to="/admin/notifications" className="text-sm text-temple-gold hover:text-temple-gold-light transition-colors flex items-center gap-1">
                <Send size={14} /> 前往通知管理
              </Link>
            </div>
            <div className="space-y-3">
              {notificationRules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-3 bg-admin-dark rounded-lg">
                  <div>
                    <div className="text-sm text-gray-200 font-medium">{rule.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      模式：{rule.mode === 'auto_send' ? '自動發送' : '建立草稿'} | 頻道：{rule.channel === 'email' ? 'Email' : rule.channel === 'sms' ? 'SMS' : 'Email + SMS'}
                    </div>
                  </div>
                  <button
                    onClick={() => updateNotificationRule(rule.id, { enabled: !rule.enabled })}
                    disabled={!notificationSettings.autoEnabled}
                    className={`relative w-10 h-5 rounded-full transition-colors ${rule.enabled && notificationSettings.autoEnabled ? 'bg-temple-gold' : 'bg-admin-dark-lighter'} ${!notificationSettings.autoEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${rule.enabled && notificationSettings.autoEnabled ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
              {notificationRules.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">尚無自動觸發規則</p>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={resetConfirm} onClose={() => setResetConfirm(false)}
        onConfirm={handleReset} title="確認重置" message="確定要清除所有資料嗎？此操作無法復原。" confirmText="重置全部" />
    </div>
  )
}

export default SettingsPage
