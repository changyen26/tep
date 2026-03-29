import { useState, useMemo } from 'react'
import { useData } from '../../contexts/DataContext'
import { formatDate, formatDateTime, exportToCSV } from '../../utils/adminUtils'
import StatusBadge from '../../components/admin/StatusBadge'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Search, Download, Trash2, Eye, ChevronDown } from 'lucide-react'
import { evaluateAutoTrigger } from '../../services/notificationService'

const pilgrimageStatusLabels = {
  pending: '待確認',
  confirmed: '已確認',
  completed: '已完成',
  cancelled: '已取消',
}

function PilgrimagesPage() {
  const { pilgrimages, updatePilgrimageStatus, deletePilgrimage, siteContent,
    notificationRules, notificationTemplates, notificationSettings, addNotifications } = useData()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    let result = pilgrimages
    if (filter !== 'all') result = result.filter(p => p.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.templeName?.toLowerCase().includes(q) ||
        p.contactName?.toLowerCase().includes(q) ||
        p.phone?.includes(q)
      )
    }
    return result
  }, [pilgrimages, filter, search])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const handleStatusChange = (id, newStatus) => {
    updatePilgrimageStatus(id, newStatus)
    if (selectedItem?.id === id) setSelectedItem(prev => ({ ...prev, status: newStatus }))
    // Auto trigger notification
    if (notificationSettings?.autoEnabled) {
      const eventName = `pilgrimage_status_${newStatus}`
      const sourceData = pilgrimages.find(p => p.id === id)
      if (sourceData) {
        const drafts = evaluateAutoTrigger(eventName, 'pilgrimage', id, sourceData, siteContent, notificationRules, notificationTemplates)
        if (drafts && drafts.length > 0) {
          addNotifications(drafts)
        }
      }
    }
  }

  const handleDelete = (id) => {
    deletePilgrimage(id)
    setSelectedItem(null)
    setDeleteTarget(null)
  }

  const handleBatchStatus = (status) => {
    selectedIds.forEach(id => updatePilgrimageStatus(id, status))
    setSelectedIds([])
  }

  const handleExport = () => {
    exportToCSV(
      ['登記日期', '進香團名稱', '聯絡人', '電話', '人數', '車輛', '預計日期', '狀態'],
      filtered.map(item => [
        formatDateTime(item.createdAt), item.templeName, item.contactName,
        item.phone, item.peopleCount, item.busCount, item.visitDate,
        pilgrimageStatusLabels[item.status] || item.status,
      ]),
      '進香登記'
    )
  }

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  const toggleAll = () => {
    if (selectedIds.length === paged.length) setSelectedIds([])
    else setSelectedIds(paged.map(i => i.id))
  }

  const filters = [
    { value: 'all', label: '全部', count: pilgrimages.length },
    { value: 'pending', label: '待確認', count: pilgrimages.filter(p => p.status === 'pending').length },
    { value: 'confirmed', label: '已確認', count: pilgrimages.filter(p => p.status === 'confirmed').length },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-temple-gold">進香管理</h1>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg hover:text-white transition-colors text-sm">
          <Download size={16} /> 匯出 CSV
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(0) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.value ? 'bg-temple-gold text-admin-dark' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="搜尋團名/聯絡人/電話..."
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-temple-gold/50" />
        </div>
      </div>

      {/* Batch actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-admin-dark-light border border-admin-dark-lighter rounded-lg">
          <span className="text-sm text-gray-400">已選 {selectedIds.length} 筆</span>
          <button onClick={() => handleBatchStatus('confirmed')} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500">批次確認</button>
          <button onClick={() => handleBatchStatus('completed')} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-500">批次完成</button>
          <button onClick={() => { selectedIds.forEach(id => deletePilgrimage(id)); setSelectedIds([]) }} className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500">批次刪除</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-admin-dark-lighter">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-admin-dark-light border-b border-admin-dark-lighter">
              <th className="px-4 py-3 text-left"><input type="checkbox" checked={paged.length > 0 && selectedIds.length === paged.length} onChange={toggleAll} className="rounded" /></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">登記日期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">進香團名稱</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">聯絡人</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">人數/車輛</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">預計日期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">狀態</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-dark-lighter">
            {paged.length > 0 ? paged.map(item => (
              <tr key={item.id} className="bg-admin-dark hover:bg-admin-dark-light transition-colors">
                <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatDateTime(item.createdAt)}</td>
                <td className="px-4 py-3 text-gray-200 font-medium">{item.templeName}</td>
                <td className="px-4 py-3 text-gray-300">{item.contactName}</td>
                <td className="px-4 py-3 text-gray-300">{item.peopleCount} 人 <span className="text-gray-500">/ {item.busCount} 車</span></td>
                <td className="px-4 py-3 text-gray-300">{item.visitDate} <span className="text-gray-500 text-xs">{item.visitTime}</span></td>
                <td className="px-4 py-3">
                  <select value={item.status} onChange={e => handleStatusChange(item.id, e.target.value)}
                    className="bg-admin-dark-lighter border border-admin-dark-lighter rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-temple-gold/50">
                    {Object.entries(pilgrimageStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelectedItem(item)} className="p-1.5 text-gray-400 hover:text-temple-gold rounded hover:bg-admin-dark-lighter transition-colors">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" className="px-4 py-12 text-center text-gray-500">暫無資料</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span>每頁</span>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0) }}
              className="bg-admin-dark-lighter border border-admin-dark-lighter rounded px-2 py-1 text-gray-300">
              <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
            </select>
            <span>筆，共 {filtered.length} 筆</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 rounded bg-admin-dark-lighter disabled:opacity-30">上一頁</button>
            <span>{page + 1} / {totalPages || 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 rounded bg-admin-dark-lighter disabled:opacity-30">下一頁</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AdminModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="進香詳情"
        footer={<>
          <button onClick={() => setDeleteTarget(selectedItem?.id)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm">刪除</button>
          <button onClick={() => setSelectedItem(null)} className="px-4 py-2 bg-admin-dark-lighter text-gray-300 hover:text-white rounded-lg text-sm">關閉</button>
        </>}>
        {selectedItem && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">進香團資訊</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><span className="text-xs text-gray-500">進香團名稱</span><p className="text-gray-200">{selectedItem.templeName}</p></div>
                <div><span className="text-xs text-gray-500">預計日期</span><p className="text-gray-200">{selectedItem.visitDate}</p></div>
                <div><span className="text-xs text-gray-500">預計時間</span><p className="text-gray-200">{selectedItem.visitTime}</p></div>
                <div><span className="text-xs text-gray-500">人數</span><p className="text-gray-200">{selectedItem.peopleCount} 人</p></div>
                <div><span className="text-xs text-gray-500">車輛數</span><p className="text-gray-200">{selectedItem.busCount} 車</p></div>
                <div><span className="text-xs text-gray-500">登記時間</span><p className="text-gray-200">{formatDateTime(selectedItem.createdAt)}</p></div>
                <div><span className="text-xs text-gray-500">狀態</span><div className="mt-1"><StatusBadge status={selectedItem.status} label={pilgrimageStatusLabels[selectedItem.status]} /></div></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">聯絡資訊</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-xs text-gray-500">聯絡人</span><p className="text-gray-200">{selectedItem.contactName}</p></div>
                <div><span className="text-xs text-gray-500">聯絡電話</span><p className="text-gray-200">{selectedItem.phone}</p></div>
                <div className="col-span-2"><span className="text-xs text-gray-500">電子信箱</span><p className="text-gray-200">{selectedItem.email || '-'}</p></div>
              </div>
            </div>
            {selectedItem.notes && (
              <div><h3 className="text-sm font-medium text-gray-400 mb-2">備註事項</h3><p className="text-gray-300 text-sm">{selectedItem.notes}</p></div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">更改狀態</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(pilgrimageStatusLabels).map(([k, v]) => (
                  <button key={k} onClick={() => handleStatusChange(selectedItem.id, k)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedItem.status === k ? 'bg-temple-gold text-admin-dark' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)} title="確認刪除" message="確定要刪除此筆進香資料嗎？此操作無法復原。" />
    </div>
  )
}

export default PilgrimagesPage
