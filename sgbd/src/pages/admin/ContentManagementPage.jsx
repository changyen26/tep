import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { Building, FileText, DollarSign, AlertCircle, Car, Save, Plus, Trash2 } from 'lucide-react'

const tabs = [
  { id: 'basic', label: '基本資訊', icon: Building },
  { id: 'history', label: '廟宇沿革', icon: FileText },
  { id: 'services', label: '服務項目與價格', icon: DollarSign },
  { id: 'notices', label: '服務須知', icon: AlertCircle },
  { id: 'transport', label: '交通指南', icon: Car },
]

function ContentManagementPage() {
  const { siteContent, updateSiteContent } = useData()
  const [activeTab, setActiveTab] = useState('basic')
  const [saved, setSaved] = useState(false)

  const [basicInfo, setBasicInfo] = useState(siteContent.basicInfo)
  const [history, setHistory] = useState(siteContent.history)
  const [services, setServices] = useState(siteContent.services)
  const [notices, setNotices] = useState(siteContent.serviceNotices)
  const [transport, setTransport] = useState(siteContent.transportGuide)

  const handleSave = () => {
    updateSiteContent({
      basicInfo,
      history,
      services,
      serviceNotices: notices,
      transportGuide: transport,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addService = () => {
    setServices(prev => [...prev, { id: 'new_' + Date.now(), name: '', price: 0, unit: '每盞/年', description: '' }])
  }
  const updateService = (idx, field, value) => {
    setServices(prev => prev.map((s, i) => i === idx ? { ...s, [field]: field === 'price' ? Number(value) : value } : s))
  }
  const removeService = (idx) => setServices(prev => prev.filter((_, i) => i !== idx))

  const addNotice = () => setNotices(prev => [...prev, ''])
  const updateNotice = (idx, value) => setNotices(prev => prev.map((n, i) => i === idx ? value : n))
  const removeNotice = (idx) => setNotices(prev => prev.filter((_, i) => i !== idx))

  const inputCls = "w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-temple-gold">網站內容管理</h1>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-green-600 text-white' : 'bg-temple-gold text-admin-dark hover:bg-temple-gold-light'}`}>
          <Save size={16} /> {saved ? '已儲存！' : '儲存變更'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-temple-gold text-admin-dark font-medium' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
              <Icon size={16} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Basic Info */}
      {activeTab === 'basic' && (
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">基本資訊</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-400 mb-1">地址</label><input type="text" value={basicInfo.address} onChange={e => setBasicInfo(p => ({ ...p, address: e.target.value }))} className={inputCls} /></div>
            <div><label className="block text-sm text-gray-400 mb-1">電話</label><input type="text" value={basicInfo.phone} onChange={e => setBasicInfo(p => ({ ...p, phone: e.target.value }))} className={inputCls} /></div>
            <div><label className="block text-sm text-gray-400 mb-1">電子信箱</label><input type="email" value={basicInfo.email} onChange={e => setBasicInfo(p => ({ ...p, email: e.target.value }))} className={inputCls} /></div>
            <div><label className="block text-sm text-gray-400 mb-1">開放時間</label><input type="text" value={basicInfo.openingHours} onChange={e => setBasicInfo(p => ({ ...p, openingHours: e.target.value }))} className={inputCls} /></div>
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">廟宇沿革</h2>
          <textarea value={history} onChange={e => setHistory(e.target.value)} rows="15" className={`${inputCls} resize-y`} placeholder="請輸入廟宇沿革內容..." />
          <p className="text-xs text-gray-500 mt-2">此內容將顯示在「關於寶殿」頁面</p>
        </div>
      )}

      {/* Services & Prices */}
      {activeTab === 'services' && (
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">服務項目與價格</h2>
            <button onClick={addService} className="flex items-center gap-1 px-3 py-1.5 bg-temple-gold/10 text-temple-gold rounded-lg text-sm hover:bg-temple-gold/20">
              <Plus size={14} /> 新增項目
            </button>
          </div>
          <div className="space-y-3">
            {services.map((svc, idx) => (
              <div key={svc.id || idx} className="flex items-start gap-3 bg-admin-dark rounded-lg p-4 border border-admin-dark-lighter">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><label className="block text-xs text-gray-500 mb-1">名稱</label><input type="text" value={svc.name} onChange={e => updateService(idx, 'name', e.target.value)} className={inputCls} /></div>
                  <div><label className="block text-xs text-gray-500 mb-1">價格</label><input type="number" value={svc.price} onChange={e => updateService(idx, 'price', e.target.value)} className={inputCls} /></div>
                  <div><label className="block text-xs text-gray-500 mb-1">單位</label><input type="text" value={svc.unit} onChange={e => updateService(idx, 'unit', e.target.value)} className={inputCls} /></div>
                  <div><label className="block text-xs text-gray-500 mb-1">說明</label><input type="text" value={svc.description} onChange={e => updateService(idx, 'description', e.target.value)} className={inputCls} /></div>
                </div>
                <button onClick={() => removeService(idx)} className="mt-6 p-1.5 text-gray-500 hover:text-red-400 rounded hover:bg-admin-dark-lighter"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">這些價格將同步顯示在前台「服務項目」與「點燈登記」頁面</p>
        </div>
      )}

      {/* Notices */}
      {activeTab === 'notices' && (
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">服務須知</h2>
            <button onClick={addNotice} className="flex items-center gap-1 px-3 py-1.5 bg-temple-gold/10 text-temple-gold rounded-lg text-sm hover:bg-temple-gold/20">
              <Plus size={14} /> 新增項目
            </button>
          </div>
          <div className="space-y-2">
            {notices.map((notice, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-gray-500 text-sm w-6">{idx + 1}.</span>
                <input type="text" value={notice} onChange={e => updateNotice(idx, e.target.value)} className={`flex-1 ${inputCls}`} />
                <button onClick={() => removeNotice(idx)} className="p-1.5 text-gray-500 hover:text-red-400 rounded hover:bg-admin-dark-lighter"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transport */}
      {activeTab === 'transport' && (
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">交通指南</h2>
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-400 mb-1">自行開車</label><textarea value={transport.driving} onChange={e => setTransport(p => ({ ...p, driving: e.target.value }))} rows="3" className={`${inputCls} resize-none`} /></div>
            <div><label className="block text-sm text-gray-400 mb-1">大眾運輸</label><textarea value={transport.publicTransport} onChange={e => setTransport(p => ({ ...p, publicTransport: e.target.value }))} rows="3" className={`${inputCls} resize-none`} /></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentManagementPage
