import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Plus, Pencil, Trash2, Eye, EyeOff, Image, GripVertical } from 'lucide-react'

function GalleryManagementPage() {
  const { galleryPhotos, galleryCategories, addGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto, updateGalleryCategories } = useData()
  const [activeCategory, setActiveCategory] = useState('all')
  const [isEditing, setIsEditing] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', image: '', category: 'temple' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  const filteredPhotos = activeCategory === 'all'
    ? galleryPhotos
    : galleryPhotos.filter(p => p.category === activeCategory)

  const handleAdd = () => {
    setEditingPhoto(null)
    setFormData({ title: '', description: '', image: '', category: galleryCategories[0]?.id || 'temple' })
    setIsEditing(true)
  }

  const handleEdit = (photo) => {
    setEditingPhoto(photo)
    setFormData({ title: photo.title, description: photo.description, image: photo.image, category: photo.category })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!formData.image || !formData.title) return
    if (editingPhoto) updateGalleryPhoto(editingPhoto.id, formData)
    else addGalleryPhoto(formData)
    setIsEditing(false)
  }

  const toggleVisibility = (photo) => {
    updateGalleryPhoto(photo.id, { visible: !photo.visible })
  }

  const addCategory = () => {
    if (!newCatName.trim()) return
    const id = newCatName.trim().toLowerCase().replace(/\s+/g, '_')
    updateGalleryCategories([...galleryCategories, { id, name: newCatName.trim() }])
    setNewCatName('')
  }

  const removeCategory = (id) => {
    updateGalleryCategories(galleryCategories.filter(c => c.id !== id))
  }

  const inputCls = "w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-temple-gold">相簿管理</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg hover:text-white text-sm">
            分類管理
          </button>
          <button onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-temple-gold text-admin-dark rounded-lg hover:bg-temple-gold-light text-sm font-medium">
            <Plus size={16} /> 新增照片
          </button>
        </div>
      </div>

      {/* Category Manager */}
      {showCategoryManager && (
        <div className="mb-6 bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">分類管理</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {galleryCategories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 bg-admin-dark rounded-lg px-3 py-1.5">
                <span className="text-sm text-gray-300">{cat.name}</span>
                <button onClick={() => removeCategory(cat.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="新分類名稱"
              className="flex-1 px-3 py-1.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-sm text-gray-200 focus:outline-none focus:border-temple-gold/50" />
            <button onClick={addCategory} className="px-3 py-1.5 bg-temple-gold text-admin-dark rounded-lg text-sm">新增</button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeCategory === 'all' ? 'bg-temple-gold text-admin-dark font-medium' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
          全部 ({galleryPhotos.length})
        </button>
        {galleryCategories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeCategory === cat.id ? 'bg-temple-gold text-admin-dark font-medium' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
            {cat.name} ({galleryPhotos.filter(p => p.category === cat.id).length})
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map(photo => (
          <div key={photo.id} className={`group relative bg-admin-dark-light border rounded-xl overflow-hidden ${photo.visible ? 'border-admin-dark-lighter' : 'border-red-900/50 opacity-60'}`}>
            <div className="aspect-square bg-admin-dark">
              <img src={photo.image} alt={photo.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-200 truncate">{photo.title}</h4>
              <p className="text-xs text-gray-500 truncate">{photo.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-600">{galleryCategories.find(c => c.id === photo.category)?.name}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleVisibility(photo)} className={`p-1 rounded ${photo.visible ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`}>
                    {photo.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => handleEdit(photo)} className="p-1 text-gray-400 hover:text-temple-gold rounded"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteTarget(photo.id)} className="p-1 text-gray-400 hover:text-red-400 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredPhotos.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-500">
            <Image size={40} className="mx-auto mb-3 text-gray-600" />
            <p>此分類暫無照片</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AdminModal isOpen={isEditing} onClose={() => setIsEditing(false)} title={editingPhoto ? '編輯照片' : '新增照片'} size="sm"
        footer={<>
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm">取消</button>
          <button onClick={handleSave} className="px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light">儲存</button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">圖片 URL *</label>
            <input type="url" value={formData.image} onChange={e => setFormData(p => ({ ...p, image: e.target.value }))} placeholder="https://..." className={inputCls} />
            {formData.image && <img src={formData.image} alt="" className="mt-2 w-full h-40 object-cover rounded-lg" />}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">標題 *</label>
            <input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">說明</label>
            <input type="text" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">分類</label>
            <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className={inputCls}>
              {galleryCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteGalleryPhoto(deleteTarget); setDeleteTarget(null) }} title="確認刪除" message="確定要刪除此照片嗎？" />
    </div>
  )
}

export default GalleryManagementPage
