import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { formatDateTime, lightTypeNames, statusLabels } from '../../utils/adminUtils'
import AdminModal from '../../components/admin/AdminModal'
import StatusBadge from '../../components/admin/StatusBadge'
import StatCard from '../../components/admin/StatCard'
import {
  Users, Search, Mail, Smartphone, Send, Eye,
  Flame, Bus, ClipboardList, MessageSquare, User,
  ChevronLeft, ChevronRight, Download, Tag
} from 'lucide-react'

// 從所有資料源彙整信眾
function aggregateMembers(lightings, pilgrimages, registrations, contactMessages) {
  const map = new Map()

  const getOrCreate = (phone, email) => {
    // 以 phone 或 email 為 key 做合併
    const key = phone?.replace(/[-\s]/g, '') || email?.toLowerCase() || null
    if (!key) return null
    if (map.has(key)) return map.get(key)
    const member = {
      id: key,
      names: new Set(),
      phones: new Set(),
      emails: new Set(),
      tags: new Set(),
      interactions: [],
      firstSeen: null,
      lastSeen: null,
    }
    map.set(key, member)
    return member
  }

  const updateTime = (member, dateStr) => {
    if (!dateStr) return
    const d = new Date(dateStr)
    if (!member.firstSeen || d < new Date(member.firstSeen)) member.firstSeen = dateStr
    if (!member.lastSeen || d > new Date(member.lastSeen)) member.lastSeen = dateStr
  }

  // 點燈
  lightings?.forEach(l => {
    const m = getOrCreate(l.phone, l.email)
    if (!m) return
    l.members?.forEach(mem => { if (mem.name) m.names.add(mem.name) })
    if (l.phone) m.phones.add(l.phone)
    if (l.email) m.emails.add(l.email)
    m.tags.add('lighting')
    m.interactions.push({
      type: 'lighting',
      label: l.lightName || lightTypeNames[l.lightType] || '點燈',
      status: l.status,
      amount: l.totalAmount,
      date: l.createdAt,
      id: l.id,
    })
    updateTime(m, l.createdAt)
  })

  // 進香
  pilgrimages?.forEach(p => {
    const m = getOrCreate(p.phone, p.email)
    if (!m) return
    if (p.contactName) m.names.add(p.contactName)
    if (p.phone) m.phones.add(p.phone)
    if (p.email) m.emails.add(p.email)
    m.tags.add('pilgrimage')
    m.interactions.push({
      type: 'pilgrimage',
      label: p.templeName,
      status: p.status,
      date: p.createdAt,
      id: p.id,
    })
    updateTime(m, p.createdAt)
  })

  // 活動報名
  registrations?.forEach(r => {
    const m = getOrCreate(r.phone, r.email)
    if (!m) return
    if (r.name) m.names.add(r.name)
    if (r.phone) m.phones.add(r.phone)
    if (r.email) m.emails.add(r.email)
    m.tags.add('registration')
    m.interactions.push({
      type: 'registration',
      label: r.eventTitle,
      status: r.status,
      date: r.createdAt,
      id: r.id,
    })
    updateTime(m, r.createdAt)
  })

  // 聯絡留言
  contactMessages?.forEach(c => {
    const m = getOrCreate(c.phone, c.email)
    if (!m) return
    if (c.name) m.names.add(c.name)
    if (c.phone) m.phones.add(c.phone)
    if (c.email) m.emails.add(c.email)
    m.tags.add('contact')
    m.interactions.push({
      type: 'contact',
      label: '聯絡留言',
      status: c.status,
      date: c.createdAt,
      id: c.id,
    })
    updateTime(m, c.createdAt)
  })

  // Convert to array
  return Array.from(map.values()).map(m => ({
    ...m,
    name: Array.from(m.names).join('、') || '未知',
    phone: Array.from(m.phones)[0] || '',
    email: Array.from(m.emails)[0] || '',
    allPhones: Array.from(m.phones),
    allEmails: Array.from(m.emails),
    tags: Array.from(m.tags),
    interactionCount: m.interactions.length,
    interactions: m.interactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
  })).sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
}

const tagConfig = {
  lighting: { label: '點燈', icon: Flame, color: 'text-red-400 bg-red-900/20' },
  pilgrimage: { label: '進香', icon: Bus, color: 'text-amber-400 bg-amber-900/20' },
  registration: { label: '活動報名', icon: ClipboardList, color: 'text-blue-400 bg-blue-900/20' },
  contact: { label: '留言', icon: MessageSquare, color: 'text-purple-400 bg-purple-900/20' },
}

function MembersPage() {
  const navigate = useNavigate()
  const { lightings, pilgrimages, registrations, contactMessages } = useData()

  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(15)
  const [selectedMember, setSelectedMember] = useState(null)

  // Aggregate members
  const allMembers = useMemo(() =>
    aggregateMembers(lightings, pilgrimages, registrations, contactMessages),
    [lightings, pilgrimages, registrations, contactMessages]
  )

  // Stats
  const totalMembers = allMembers.length
  const withEmail = allMembers.filter(m => m.email).length
  const withPhone = allMembers.filter(m => m.phone).length
  const totalInteractions = allMembers.reduce((sum, m) => sum + m.interactionCount, 0)

  // Filter
  const filtered = useMemo(() => {
    let result = allMembers
    if (tagFilter !== 'all') {
      result = result.filter(m => m.tags.includes(tagFilter))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.email.toLowerCase().includes(q) ||
        Array.from(m.names).some(n => n.toLowerCase().includes(q))
      )
    }
    return result
  }, [allMembers, tagFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  // Navigate to notifications with pre-selected recipient
  const handleSendNotification = (member) => {
    // Store in sessionStorage for the notification page to pick up
    const recipient = {
      name: member.name,
      email: member.email,
      phone: member.phone,
      sourceType: member.tags[0] || 'general',
      sourceId: member.interactions[0]?.id || null,
    }
    sessionStorage.setItem('sgbd_notif_recipient', JSON.stringify(recipient))
    navigate('/admin/notifications')
  }

  // CSV export
  const handleExport = () => {
    const headers = ['姓名', '電話', 'Email', '互動類型', '互動次數', '首次互動', '最近互動']
    const rows = filtered.map(m => [
      m.name,
      m.phone,
      m.email,
      m.tags.map(t => tagConfig[t]?.label || t).join('、'),
      m.interactionCount,
      m.firstSeen ? formatDateTime(m.firstSeen) : '',
      m.lastSeen ? formatDateTime(m.lastSeen) : '',
    ])
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `信眾名單_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-temple-gold flex items-center gap-2">
          <Users size={24} />
          信眾管理
        </h1>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg hover:text-white transition-colors text-sm">
          <Download size={16} /> 匯出名單
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="信眾總數" value={totalMembers} color="text-temple-gold" />
        <StatCard icon={Mail} label="有 Email" value={withEmail} subtitle={`${totalMembers ? Math.round(withEmail / totalMembers * 100) : 0}%`} color="text-blue-400" />
        <StatCard icon={Smartphone} label="有電話" value={withPhone} subtitle={`${totalMembers ? Math.round(withPhone / totalMembers * 100) : 0}%`} color="text-green-400" />
        <StatCard icon={Tag} label="總互動次數" value={totalInteractions} color="text-purple-400" />
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setTagFilter('all'); setPage(0) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tagFilter === 'all' ? 'bg-temple-gold text-admin-dark' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
            全部 ({allMembers.length})
          </button>
          {Object.entries(tagConfig).map(([key, cfg]) => {
            const count = allMembers.filter(m => m.tags.includes(key)).length
            const Icon = cfg.icon
            return (
              <button key={key} onClick={() => { setTagFilter(key); setPage(0) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tagFilter === key ? 'bg-temple-gold text-admin-dark' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
                <Icon size={14} /> {cfg.label} ({count})
              </button>
            )
          })}
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="搜尋姓名、電話、信箱..."
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-temple-gold/50" />
        </div>
      </div>

      {/* Member list */}
      {paged.length > 0 ? (
        <div className="space-y-2">
          {paged.map(member => (
            <div key={member.id}
              className="flex items-center gap-4 px-5 py-4 bg-admin-dark-light border border-admin-dark-lighter rounded-xl hover:border-temple-gold/30 transition-colors group">
              {/* Avatar */}
              <div className="w-10 h-10 bg-temple-gold/10 rounded-full flex items-center justify-center shrink-0">
                <User size={20} className="text-temple-gold" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-200 font-medium truncate">{member.name}</span>
                  <span className="text-xs text-gray-500 shrink-0">{member.interactionCount} 次互動</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {member.phone && (
                    <span className="flex items-center gap-1"><Smartphone size={11} /> {member.phone}</span>
                  )}
                  {member.email && (
                    <span className="flex items-center gap-1"><Mail size={11} /> {member.email}</span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="hidden sm:flex flex-wrap gap-1.5 shrink-0">
                {member.tags.map(tag => {
                  const cfg = tagConfig[tag]
                  if (!cfg) return null
                  const Icon = cfg.icon
                  return (
                    <span key={tag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>
                      <Icon size={10} /> {cfg.label}
                    </span>
                  )
                })}
              </div>

              {/* Last seen */}
              <div className="hidden md:block text-xs text-gray-500 shrink-0 w-24 text-right">
                {member.lastSeen && formatDateTime(member.lastSeen)}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setSelectedMember(member)}
                  className="p-2 text-gray-400 hover:text-temple-gold hover:bg-admin-dark rounded-lg transition-colors" title="查看詳情">
                  <Eye size={16} />
                </button>
                <button onClick={() => handleSendNotification(member)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors" title="發送通知">
                  <Send size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users size={40} className="mx-auto text-gray-600 mb-3" />
          <h3 className="text-lg text-gray-400 mb-1">
            {search || tagFilter !== 'all' ? '找不到符合條件的信眾' : '尚無信眾資料'}
          </h3>
          <p className="text-sm text-gray-500">信眾資料會從點燈、進香、活動報名及聯絡留言中自動彙整</p>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span>每頁</span>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0) }}
              className="bg-admin-dark-lighter border border-admin-dark-lighter rounded px-2 py-1 text-gray-300">
              <option value={15}>15</option><option value={30}>30</option><option value={50}>50</option>
            </select>
            <span>人，共 {filtered.length} 人</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-1.5 rounded bg-admin-dark-lighter disabled:opacity-30 transition-colors hover:text-white">
              <ChevronLeft size={16} />
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="p-1.5 rounded bg-admin-dark-lighter disabled:opacity-30 transition-colors hover:text-white">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ===== Detail Modal ===== */}
      <AdminModal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} title="信眾詳情" size="md"
        footer={
          <div className="flex w-full justify-between">
            <button onClick={() => { setSelectedMember(null); handleSendNotification(selectedMember) }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors">
              <Send size={14} /> 發送通知
            </button>
            <button onClick={() => setSelectedMember(null)}
              className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm hover:text-white transition-colors">
              關閉
            </button>
          </div>
        }>
        {selectedMember && (
          <div className="space-y-6">
            {/* Basic info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-temple-gold/10 rounded-full flex items-center justify-center">
                <User size={28} className="text-temple-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedMember.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedMember.tags.map(tag => {
                    const cfg = tagConfig[tag]
                    if (!cfg) return null
                    const Icon = cfg.icon
                    return (
                      <span key={tag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                        <Icon size={10} /> {cfg.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">聯絡資訊</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-admin-dark rounded-lg">
                  <Smartphone size={16} className="text-green-400 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">電話</div>
                    <div className="text-gray-200 text-sm">{selectedMember.phone || '未提供'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-admin-dark rounded-lg">
                  <Mail size={16} className="text-blue-400 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-gray-200 text-sm truncate">{selectedMember.email || '未提供'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction timeline */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">互動紀錄 ({selectedMember.interactionCount})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedMember.interactions.map((item, idx) => {
                  const cfg = tagConfig[item.type]
                  const Icon = cfg?.icon || MessageSquare
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-admin-dark rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg?.color || 'text-gray-400 bg-gray-800'}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-200 text-sm font-medium truncate">{item.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.date && formatDateTime(item.date)}
                          {item.amount && <span className="ml-2">NT$ {item.amount.toLocaleString()}</span>}
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-admin-dark rounded-lg text-center">
                <div className="text-xs text-gray-500">首次互動</div>
                <div className="text-sm text-gray-300 mt-0.5">{selectedMember.firstSeen ? formatDateTime(selectedMember.firstSeen) : '-'}</div>
              </div>
              <div className="p-3 bg-admin-dark rounded-lg text-center">
                <div className="text-xs text-gray-500">最近互動</div>
                <div className="text-sm text-gray-300 mt-0.5">{selectedMember.lastSeen ? formatDateTime(selectedMember.lastSeen) : '-'}</div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  )
}

export default MembersPage
