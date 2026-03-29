import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Plus, Pencil, Trash2, Image, Users, AlertCircle } from 'lucide-react'

const emptyEvent = { title: '', date: '', time: '', location: '', description: '', imageUrl: '', capacity: 0, isActive: true }

function EventsPage() {
  const { events, registrations, addEvent, updateEvent, deleteEvent } = useData()
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(emptyEvent)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [dateWarning, setDateWarning] = useState(false)

  const getRegCount = (eventId) => registrations.filter(r => r.eventId === eventId).length

  const handleAdd = () => { setEditingItem(null); setFormData(emptyEvent); setDateWarning(false); setIsEditing(true) }
  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({ title: item.title, date: item.date, time: item.time || '', location: item.location || '', description: item.description || '', imageUrl: item.imageUrl || '', capacity: item.capacity || 0, isActive: item.isActive })
    setDateWarning(false)
    setIsEditing(true)
  }
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'capacity' ? Number(value) : value }))
    if (name === 'date') setDateWarning(value && new Date(value) < new Date(new Date().toDateString()))
  }
  const handleSave = () => {
    if (!formData.title || !formData.date) return
    if (editingItem) updateEvent(editingItem.id, formData)
    else addEvent(formData)
    setIsEditing(false)
  }
  const handleCancel = () => { setIsEditing(false); setEditingItem(null); setFormData(emptyEvent) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-temple-gold">活動管理</h1>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-temple-gold text-admin-dark rounded-lg hover:bg-temple-gold-light transition-colors text-sm font-medium">
          <Plus size={16} /> 新增活動
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-admin-dark-lighter">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-admin-dark-light border-b border-admin-dark-lighter">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">活動名稱</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">日期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">時間</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">地點</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">報名</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">狀態</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-dark-lighter">
            {events.length > 0 ? events.map(item => {
              const regCount = getRegCount(item.id)
              return (
                <tr key={item.id} className="bg-admin-dark hover:bg-admin-dark-light transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && <img src={item.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />}
                      <span className="text-gray-200 font-medium">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{item.date}</td>
                  <td className="px-4 py-3 text-gray-400">{item.time}</td>
                  <td className="px-4 py-3 text-gray-400">{item.location}</td>
                  <td className="px-4 py-3 text-gray-300">
                    <div className="flex items-center gap-1">
                      <Users size={14} className="text-gray-500" />
                      {regCount}{item.capacity > 0 ? `/${item.capacity}` : ''} 人
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.isActive ? '顯示中' : '已隱藏'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-temple-gold rounded hover:bg-admin-dark-lighter"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteTarget(item.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-admin-dark-lighter"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )
            }) : (
              <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-500">暫無活動</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <AdminModal isOpen={isEditing} onClose={handleCancel} title={editingItem ? '編輯活動' : '新增活動'}
        footer={<>
          <button onClick={handleCancel} className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm">取消</button>
          <button onClick={handleSave} className="px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light">儲存</button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">活動名稱 *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="請輸入活動名稱"
              className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">日期 *</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50" />
              {dateWarning && <p className="flex items-center gap-1 text-amber-400 text-xs mt-1"><AlertCircle size={12} />此日期已過</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">時間</label>
              <input type="text" name="time" value={formData.time} onChange={handleChange} placeholder="09:00 - 17:00"
                className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">地點</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="活動地點"
                className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">容量（0=不限）</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="0"
                className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">圖片 URL</label>
            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..."
              className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">活動說明</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="活動內容描述"
              className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50 resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-temple-gold' : 'bg-admin-dark-lighter'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formData.isActive ? 'left-5.5 translate-x-0' : 'left-0.5'}`}
                style={{ left: formData.isActive ? '22px' : '2px' }} />
            </button>
            <span className="text-sm text-gray-300">{formData.isActive ? '顯示中' : '已隱藏'}</span>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteEvent(deleteTarget); setDeleteTarget(null) }} title="確認刪除" message="確定要刪除此活動嗎？" />
    </div>
  )
}

export default EventsPage
