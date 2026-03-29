import { useState, useMemo } from 'react'
import { useData } from '../../contexts/DataContext'
import { formatDateTime } from '../../utils/adminUtils'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Mail, MailOpen, Reply, Trash2, Eye, Search } from 'lucide-react'

const subjectLabels = { general: '一般詢問', service: '服務諮詢', pilgrimage: '進香登記', event: '活動詢問', other: '其他' }
const statusLabels = { unread: '未讀', read: '已讀', replied: '已回覆' }

function ContactMessagesPage() {
  const { contactMessages, updateContactMessage, deleteContactMessage } = useData()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    let result = contactMessages
    if (filter !== 'all') result = result.filter(m => m.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(m => m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.message?.toLowerCase().includes(q))
    }
    return result
  }, [contactMessages, filter, search])

  const openMessage = (item) => {
    if (item.status === 'unread') updateContactMessage(item.id, { status: 'read' })
    setSelectedItem({ ...item, status: item.status === 'unread' ? 'read' : item.status })
  }

  const handleNoteChange = (note) => {
    updateContactMessage(selectedItem.id, { note })
    setSelectedItem(prev => ({ ...prev, note }))
  }

  const markReplied = () => {
    updateContactMessage(selectedItem.id, { status: 'replied' })
    setSelectedItem(prev => ({ ...prev, status: 'replied' }))
  }

  const unreadCount = contactMessages.filter(m => m.status === 'unread').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-temple-gold">聯絡留言</h1>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 bg-red-600 text-white text-xs rounded-full">{unreadCount} 封未讀</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: '全部', count: contactMessages.length },
            { value: 'unread', label: '未讀', count: contactMessages.filter(m => m.status === 'unread').length },
            { value: 'read', label: '已讀', count: contactMessages.filter(m => m.status === 'read').length },
            { value: 'replied', label: '已回覆', count: contactMessages.filter(m => m.status === 'replied').length },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.value ? 'bg-temple-gold text-admin-dark' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋姓名/信箱/內容..."
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-temple-gold/50" />
        </div>
      </div>

      {/* Messages list */}
      <div className="space-y-2">
        {filtered.length > 0 ? filtered.map(item => (
          <div key={item.id} onClick={() => openMessage(item)}
            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
              item.status === 'unread'
                ? 'bg-admin-dark-light border-temple-gold/30 hover:border-temple-gold/50'
                : 'bg-admin-dark border-admin-dark-lighter hover:border-admin-dark-lighter'
            }`}>
            <div className={`mt-1 ${item.status === 'unread' ? 'text-temple-gold' : 'text-gray-500'}`}>
              {item.status === 'unread' ? <Mail size={20} /> : item.status === 'replied' ? <Reply size={20} /> : <MailOpen size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-medium ${item.status === 'unread' ? 'text-white' : 'text-gray-300'}`}>{item.name}</span>
                <span className="px-2 py-0.5 bg-admin-dark-lighter rounded text-xs text-gray-500">{subjectLabels[item.subject] || item.subject}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  item.status === 'unread' ? 'bg-red-900/50 text-red-400' :
                  item.status === 'replied' ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'
                }`}>{statusLabels[item.status]}</span>
              </div>
              <p className="text-sm text-gray-400 truncate">{item.message}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                {item.phone && <span>{item.phone}</span>}
                {item.email && <span>{item.email}</span>}
                <span>{formatDateTime(item.createdAt)}</span>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(item.id) }}
              className="p-1.5 text-gray-600 hover:text-red-400 rounded hover:bg-admin-dark-lighter transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        )) : (
          <div className="text-center py-16 text-gray-500">
            <Mail size={40} className="mx-auto mb-3 text-gray-600" />
            <p>暫無留言</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AdminModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="留言詳情"
        footer={<>
          {selectedItem?.status !== 'replied' && (
            <button onClick={markReplied} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm">
              <Reply size={14} /> 標為已回覆
            </button>
          )}
          <button onClick={() => setSelectedItem(null)} className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm">關閉</button>
        </>}>
        {selectedItem && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-xs text-gray-500">姓名</span><p className="text-gray-200">{selectedItem.name}</p></div>
              <div><span className="text-xs text-gray-500">主旨</span><p className="text-gray-200">{subjectLabels[selectedItem.subject] || selectedItem.subject}</p></div>
              <div><span className="text-xs text-gray-500">電話</span><p className="text-gray-200">{selectedItem.phone || '-'}</p></div>
              <div><span className="text-xs text-gray-500">信箱</span><p className="text-gray-200">{selectedItem.email || '-'}</p></div>
              <div><span className="text-xs text-gray-500">時間</span><p className="text-gray-200">{formatDateTime(selectedItem.createdAt)}</p></div>
              <div><span className="text-xs text-gray-500">狀態</span><p className="text-gray-200">{statusLabels[selectedItem.status]}</p></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">留言內容</h3>
              <div className="bg-admin-dark rounded-lg p-4 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedItem.message}</div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">內部備註</h3>
              <textarea value={selectedItem.note || ''} onChange={e => handleNoteChange(e.target.value)} rows="3" placeholder="新增內部備註..."
                className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50 resize-none" />
            </div>
          </div>
        )}
      </AdminModal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteContactMessage(deleteTarget); setDeleteTarget(null) }} title="確認刪除" message="確定要刪除此留言嗎？" />
    </div>
  )
}

export default ContactMessagesPage
