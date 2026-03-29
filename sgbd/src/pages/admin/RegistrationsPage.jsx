import { useState, useMemo } from 'react'
import { useData } from '../../contexts/DataContext'
import { formatDateTime, exportToCSV } from '../../utils/adminUtils'
import StatusBadge from '../../components/admin/StatusBadge'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Search, Download, Eye, Users, ClipboardList } from 'lucide-react'
import { evaluateAutoTrigger } from '../../services/notificationService'

const regStatusLabels = { pending: '待確認', confirmed: '已確認', attended: '已出席', cancelled: '已取消' }

function RegistrationsPage() {
  const { registrations, events, updateRegistrationStatus, deleteRegistration, siteContent,
    notificationRules, notificationTemplates, notificationSettings, addNotifications } = useData()
  const [filter, setFilter] = useState('all')
  const [eventFilter, setEventFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    let result = registrations
    if (filter !== 'all') result = result.filter(r => r.status === filter)
    if (eventFilter !== 'all') result = result.filter(r => r.eventId === parseInt(eventFilter))
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(r => r.name?.toLowerCase().includes(q) || r.phone?.includes(q))
    }
    return result
  }, [registrations, filter, eventFilter, search])

  const totalPeople = filtered.reduce((sum, r) => sum + r.peopleCount, 0)
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const handleStatusChange = (id, newStatus) => {
    updateRegistrationStatus(id, newStatus)
    if (selectedItem?.id === id) setSelectedItem(prev => ({ ...prev, status: newStatus }))
    // Auto trigger notification
    if (notificationSettings?.autoEnabled) {
      const eventName = `registration_status_${newStatus}`
      const sourceData = registrations.find(r => r.id === id)
      if (sourceData) {
        const drafts = evaluateAutoTrigger(eventName, 'registration', id, sourceData, siteContent, notificationRules, notificationTemplates)
        if (drafts && drafts.length > 0) {
          addNotifications(drafts)
        }
      }
    }
  }

  const handleExport = () => {
    exportToCSV(
      ['報名日期', '活動名稱', '活動日期', '姓名', '電話', '人數', '狀態'],
      filtered.map(item => [formatDateTime(item.createdAt), item.eventTitle, item.eventDate, item.name, item.phone, item.peopleCount, regStatusLabels[item.status] || item.status]),
      '活動報名'
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-temple-gold">活動報名管理</h1>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg hover:text-white transition-colors text-sm">
          <Download size={16} /> 匯出 CSV
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-3 bg-admin-dark-light border border-admin-dark-lighter rounded-xl px-5 py-3">
          <ClipboardList size={20} className="text-temple-gold" />
          <div><div className="text-lg font-bold text-temple-gold">{filtered.length}</div><div className="text-xs text-gray-500">報名筆數</div></div>
        </div>
        <div className="flex items-center gap-3 bg-admin-dark-light border border-admin-dark-lighter rounded-xl px-5 py-3">
          <Users size={20} className="text-blue-400" />
          <div><div className="text-lg font-bold text-blue-400">{totalPeople}</div><div className="text-xs text-gray-500">總人數</div></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={eventFilter} onChange={e => { setEventFilter(e.target.value); setPage(0) }}
          className="bg-admin-dark-lighter border border-admin-dark-lighter rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-temple-gold/50">
          <option value="all">全部活動</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: '全部', count: registrations.length },
            { value: 'pending', label: '待確認', count: registrations.filter(r => r.status === 'pending').length },
            { value: 'confirmed', label: '已確認', count: registrations.filter(r => r.status === 'confirmed').length },
          ].map(f => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(0) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.value ? 'bg-temple-gold text-admin-dark' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} placeholder="搜尋姓名/電話..."
            className="w-full sm:w-56 pl-9 pr-4 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-temple-gold/50" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-admin-dark-lighter">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-admin-dark-light border-b border-admin-dark-lighter">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">報名日期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">活動名稱</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">姓名</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">電話</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">人數</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">狀態</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-dark-lighter">
            {paged.length > 0 ? paged.map(item => (
              <tr key={item.id} className="bg-admin-dark hover:bg-admin-dark-light transition-colors">
                <td className="px-4 py-3 text-gray-400 text-xs">{formatDateTime(item.createdAt)}</td>
                <td className="px-4 py-3"><div className="text-gray-200">{item.eventTitle}</div><div className="text-xs text-gray-500">{item.eventDate}</div></td>
                <td className="px-4 py-3 text-gray-300">{item.name}</td>
                <td className="px-4 py-3 text-gray-400">{item.phone}</td>
                <td className="px-4 py-3 text-gray-300">{item.peopleCount} 人</td>
                <td className="px-4 py-3">
                  <select value={item.status} onChange={e => handleStatusChange(item.id, e.target.value)}
                    className="bg-admin-dark-lighter border border-admin-dark-lighter rounded px-2 py-1 text-xs text-gray-300 focus:outline-none">
                    {Object.entries(regStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelectedItem(item)} className="p-1.5 text-gray-400 hover:text-temple-gold rounded hover:bg-admin-dark-lighter"><Eye size={16} /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-500">暫無資料</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            每頁
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0) }}
              className="bg-admin-dark-lighter border border-admin-dark-lighter rounded px-2 py-1 text-gray-300">
              <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
            </select>
            筆，共 {filtered.length} 筆
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 rounded bg-admin-dark-lighter disabled:opacity-30">上一頁</button>
            <span>{page + 1} / {totalPages || 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 rounded bg-admin-dark-lighter disabled:opacity-30">下一頁</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AdminModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="報名詳情"
        footer={<>
          <button onClick={() => setDeleteTarget(selectedItem?.id)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm">刪除</button>
          <button onClick={() => setSelectedItem(null)} className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm">關閉</button>
        </>}>
        {selectedItem && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">活動資訊</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><span className="text-xs text-gray-500">活動名稱</span><p className="text-gray-200">{selectedItem.eventTitle}</p></div>
                <div><span className="text-xs text-gray-500">活動日期</span><p className="text-gray-200">{selectedItem.eventDate}</p></div>
                <div><span className="text-xs text-gray-500">報名時間</span><p className="text-gray-200">{formatDateTime(selectedItem.createdAt)}</p></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">報名資訊</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-xs text-gray-500">姓名</span><p className="text-gray-200">{selectedItem.name}</p></div>
                <div><span className="text-xs text-gray-500">人數</span><p className="text-gray-200">{selectedItem.peopleCount} 人</p></div>
                <div><span className="text-xs text-gray-500">電話</span><p className="text-gray-200">{selectedItem.phone}</p></div>
                <div><span className="text-xs text-gray-500">信箱</span><p className="text-gray-200">{selectedItem.email || '-'}</p></div>
                {selectedItem.notes && <div className="col-span-2"><span className="text-xs text-gray-500">備註</span><p className="text-gray-200">{selectedItem.notes}</p></div>}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">更改狀態</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(regStatusLabels).map(([k, v]) => (
                  <button key={k} onClick={() => handleStatusChange(selectedItem.id, k)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedItem.status === k ? 'bg-temple-gold text-admin-dark' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>{v}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteRegistration(deleteTarget); setSelectedItem(null); setDeleteTarget(null) }} title="確認刪除" message="確定要刪除此筆報名資料嗎？" />
    </div>
  )
}

export default RegistrationsPage
