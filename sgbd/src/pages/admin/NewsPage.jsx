import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const emptyNews = { title: '', content: '', date: new Date().toISOString().slice(0, 10), imageUrl: '', isActive: true }

function NewsPage() {
  const { news, addNews, updateNews, deleteNews } = useData()
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(emptyNews)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleAdd = () => { setEditingItem(null); setFormData({ ...emptyNews, date: new Date().toISOString().slice(0, 10) }); setIsEditing(true) }
  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({ title: item.title, content: item.content, date: item.date, imageUrl: item.imageUrl || '', isActive: item.isActive })
    setIsEditing(true)
  }
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  const handleSave = () => {
    if (!formData.title || !formData.content) return
    if (editingItem) updateNews(editingItem.id, formData)
    else addNews(formData)
    setIsEditing(false)
  }
  const handleCancel = () => { setIsEditing(false); setEditingItem(null) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-temple-gold">最新消息</h1>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-temple-gold text-admin-dark rounded-lg hover:bg-temple-gold-light transition-colors text-sm font-medium">
          <Plus size={16} /> 新增消息
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-admin-dark-lighter">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-admin-dark-light border-b border-admin-dark-lighter">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">日期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">標題</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">內容摘要</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">狀態</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-dark-lighter">
            {news.length > 0 ? news.map(item => (
              <tr key={item.id} className="bg-admin-dark hover:bg-admin-dark-light transition-colors">
                <td className="px-4 py-3 text-gray-400">{item.date}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.imageUrl && <img src={item.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />}
                    <span className="text-gray-200 font-medium">{item.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{item.content.length > 50 ? item.content.slice(0, 50) + '...' : item.content}</td>
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
            )) : (
              <tr><td colSpan="5" className="px-4 py-12 text-center text-gray-500">暫無消息</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <AdminModal isOpen={isEditing} onClose={handleCancel} title={editingItem ? '編輯消息' : '新增消息'}
        footer={<>
          <button onClick={handleCancel} className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm">取消</button>
          <button onClick={handleSave} className="px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light">儲存</button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">日期</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange}
              className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">標題 *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="請輸入標題"
              className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">圖片 URL</label>
            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..."
              className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">內容 *</label>
            <textarea name="content" value={formData.content} onChange={handleChange} rows="6" placeholder="請輸入消息內容"
              className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50 resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-temple-gold' : 'bg-admin-dark-lighter'}`}>
              <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                style={{ left: formData.isActive ? '22px' : '2px' }} />
            </button>
            <span className="text-sm text-gray-300">{formData.isActive ? '顯示中' : '已隱藏'}</span>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteNews(deleteTarget); setDeleteTarget(null) }} title="確認刪除" message="確定要刪除此消息嗎？" />
    </div>
  )
}

export default NewsPage
