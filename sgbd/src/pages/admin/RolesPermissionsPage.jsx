import { useState, useMemo } from 'react'
import { usePermission, PERMISSION_MODULES, ALL_PERMISSION_CODES } from '../../contexts/PermissionContext'
import { formatDateTime } from '../../utils/adminUtils'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import StatCard from '../../components/admin/StatCard'
import {
  Shield, Users, UserCog, Plus, Pencil, Trash2, Search,
  ChevronDown, ChevronUp, Check, X, Crown, Lock,
  Eye, ToggleLeft, ToggleRight, Copy, User, Mail, Phone,
  AlertTriangle
} from 'lucide-react'

// ===== Tab: 角色管理 =====
function RolesTab() {
  const { roles, admins, addRole, updateRole, deleteRole } = usePermission()
  const [editingRole, setEditingRole] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [expandedRole, setExpandedRole] = useState(null)

  const [form, setForm] = useState({ name: '', description: '', permissions: [] })

  const openCreate = () => {
    setForm({ name: '', description: '', permissions: [] })
    setEditingRole(null)
    setShowModal(true)
  }

  const openEdit = (role) => {
    setForm({ name: role.name, description: role.description || '', permissions: [...role.permissions] })
    setEditingRole(role)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingRole) {
      updateRole(editingRole.id, {
        name: editingRole.isSystem ? editingRole.name : form.name,
        description: form.description,
        permissions: editingRole.id === 1 ? [...ALL_PERMISSION_CODES] : form.permissions,
      })
    } else {
      addRole({ name: form.name, description: form.description, permissions: form.permissions })
    }
    setShowModal(false)
  }

  const togglePermission = (code) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(code)
        ? prev.permissions.filter(p => p !== code)
        : [...prev.permissions, code],
    }))
  }

  const toggleModule = (moduleCodes) => {
    const allSelected = moduleCodes.every(c => form.permissions.includes(c))
    setForm(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !moduleCodes.includes(p))
        : [...new Set([...prev.permissions, ...moduleCodes])],
    }))
  }

  const handleDuplicate = (role) => {
    addRole({
      name: `${role.name} (複製)`,
      description: role.description,
      permissions: [...role.permissions],
    })
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteRole(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const getAdminCount = (roleId) => admins.filter(a => a.roleId === roleId).length

  // 擁有者角色（id=1）的權限不能編輯
  const isOwnerRole = editingRole?.id === 1

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">角色管理</h2>
          <p className="text-sm text-gray-500 mt-1">建立自訂角色並配置各角色的權限</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light transition-colors">
          <Plus size={16} /> 新增角色
        </button>
      </div>

      {/* 角色卡片列表 */}
      <div className="space-y-3">
        {roles.map(role => {
          const count = getAdminCount(role.id)
          const isExpanded = expandedRole === role.id
          return (
            <div key={role.id} className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl overflow-hidden">
              {/* 角色標題列 */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  role.id === 1 ? 'bg-amber-900/30' : role.isSystem ? 'bg-blue-900/30' : 'bg-purple-900/30'
                }`}>
                  {role.id === 1 ? <Crown size={20} className="text-amber-400" /> :
                   role.isSystem ? <Shield size={20} className="text-blue-400" /> :
                   <UserCog size={20} className="text-purple-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-200 font-medium">{role.name}</span>
                    {role.isSystem && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 font-medium">
                        系統預設
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {role.description || '無描述'}
                    <span className="mx-2">|</span>
                    {role.permissions.length} 項權限
                    <span className="mx-2">|</span>
                    {count} 位人員
                  </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                    className="p-2 text-gray-400 hover:text-temple-gold hover:bg-admin-dark rounded-lg transition-colors" title="查看權限">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button onClick={() => openEdit(role)}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors" title="編輯">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDuplicate(role)}
                    className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-900/20 rounded-lg transition-colors" title="複製">
                    <Copy size={16} />
                  </button>
                  {!role.isSystem && (
                    <button onClick={() => {
                      if (count > 0) return
                      setDeleteTarget(role)
                    }}
                      disabled={count > 0}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title={count > 0 ? '尚有人員使用此角色，無法刪除' : '刪除'}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* 展開的權限預覽 */}
              {isExpanded && (
                <div className="px-5 pb-4 pt-1 border-t border-admin-dark-lighter">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                    {PERMISSION_MODULES.map(mod => {
                      const moduleCodes = mod.permissions.map(p => p.code)
                      const granted = moduleCodes.filter(c => role.permissions.includes(c))
                      if (granted.length === 0) return null
                      return (
                        <div key={mod.module} className="p-3 bg-admin-dark rounded-lg">
                          <div className="text-xs font-medium text-gray-400 mb-2">{mod.label}</div>
                          <div className="space-y-1">
                            {mod.permissions.map(p => (
                              <div key={p.code} className="flex items-center gap-2 text-xs">
                                {role.permissions.includes(p.code) ? (
                                  <Check size={12} className="text-green-400 shrink-0" />
                                ) : (
                                  <X size={12} className="text-gray-600 shrink-0" />
                                )}
                                <span className={role.permissions.includes(p.code) ? 'text-gray-300' : 'text-gray-600'}>
                                  {p.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 新增 / 編輯 Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRole ? `編輯角色 - ${editingRole.name}` : '新增角色'}
        size="lg"
        footer={
          <>
            <button onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm hover:text-white transition-colors">
              取消
            </button>
            <button onClick={handleSave} disabled={!form.name.trim()}
              className="px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light transition-colors disabled:opacity-50">
              {editingRole ? '儲存變更' : '建立角色'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* 基本資訊 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">角色名稱</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                disabled={editingRole?.isSystem}
                placeholder="例如：會計、志工組長"
                className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50 disabled:opacity-50"
              />
              {editingRole?.isSystem && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Lock size={10} /> 系統預設角色名稱不可修改
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">角色描述</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="簡述此角色的用途"
                className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50"
              />
            </div>
          </div>

          {/* 權限配置 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">權限配置</label>
              <span className="text-xs text-gray-500">
                已選 {form.permissions.length} / {ALL_PERMISSION_CODES.length} 項
              </span>
            </div>

            {isOwnerRole && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-amber-900/20 border border-amber-900/30 rounded-lg">
                <Crown size={16} className="text-amber-400 shrink-0" />
                <p className="text-sm text-amber-300">擁有者角色自動擁有全部權限，無法修改</p>
              </div>
            )}

            <div className="space-y-4">
              {PERMISSION_MODULES.map(mod => {
                const moduleCodes = mod.permissions.map(p => p.code)
                const selectedCount = moduleCodes.filter(c => form.permissions.includes(c)).length
                const allSelected = selectedCount === moduleCodes.length
                const someSelected = selectedCount > 0 && !allSelected
                return (
                  <div key={mod.module} className="bg-admin-dark rounded-xl p-4">
                    {/* 模組標題 - 全選 */}
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => !isOwnerRole && toggleModule(moduleCodes)}
                        disabled={isOwnerRole}
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          allSelected
                            ? 'bg-temple-gold border-temple-gold'
                            : someSelected
                            ? 'bg-temple-gold/30 border-temple-gold/50'
                            : 'border-gray-600 hover:border-gray-400'
                        } ${isOwnerRole ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {(allSelected || someSelected) && <Check size={12} className="text-admin-dark" />}
                      </button>
                      <span className="text-sm font-medium text-gray-200">{mod.label}</span>
                      <span className="text-xs text-gray-500">{selectedCount}/{moduleCodes.length}</span>
                    </div>

                    {/* 權限列表 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-8">
                      {mod.permissions.map(p => {
                        const checked = form.permissions.includes(p.code)
                        return (
                          <label
                            key={p.code}
                            className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                              checked ? 'bg-temple-gold/5' : 'hover:bg-admin-dark-light'
                            } ${isOwnerRole ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => !isOwnerRole && togglePermission(p.code)}
                              disabled={isOwnerRole}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              checked ? 'bg-temple-gold border-temple-gold' : 'border-gray-600'
                            }`}>
                              {checked && <Check size={10} className="text-admin-dark" />}
                            </div>
                            <span className={`text-sm ${checked ? 'text-gray-200' : 'text-gray-400'}`}>
                              {p.name}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </AdminModal>

      {/* 刪除確認 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="刪除角色"
        message={`確定要刪除角色「${deleteTarget?.name}」嗎？此操作無法復原。`}
        confirmText="刪除"
      />
    </div>
  )
}


// ===== Tab: 人員管理 =====
function AdminsTab() {
  const { roles, admins, addAdmin, updateAdmin, deleteAdmin } = usePermission()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedAdmin, setSelectedAdmin] = useState(null)

  const [form, setForm] = useState({ name: '', email: '', phone: '', roleId: '' })

  const filtered = useMemo(() => {
    let result = admins
    if (roleFilter !== 'all') {
      result = result.filter(a => a.roleId === Number(roleFilter))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.includes(q)
      )
    }
    return result
  }, [admins, roleFilter, search])

  const activeCount = admins.filter(a => a.isActive).length
  const inactiveCount = admins.filter(a => !a.isActive).length

  const openCreate = () => {
    setForm({ name: '', email: '', phone: '', roleId: roles[roles.length - 1]?.id || '' })
    setEditingAdmin(null)
    setShowModal(true)
  }

  const openEdit = (admin) => {
    setForm({ name: admin.name, email: admin.email, phone: admin.phone, roleId: admin.roleId })
    setEditingAdmin(admin)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim() || !form.roleId) return
    if (editingAdmin) {
      updateAdmin(editingAdmin.id, { name: form.name, email: form.email, phone: form.phone, roleId: Number(form.roleId) })
    } else {
      addAdmin({ name: form.name, email: form.email, phone: form.phone, roleId: Number(form.roleId) })
    }
    setShowModal(false)
  }

  const handleToggleActive = (admin) => {
    // 不能停用擁有者
    if (admin.roleId === 1) return
    updateAdmin(admin.id, { isActive: !admin.isActive })
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteAdmin(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const getRoleBadge = (roleId) => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return <span className="text-xs text-gray-500">未指定</span>
    const colors = roleId === 1
      ? 'bg-amber-900/30 text-amber-400'
      : role.isSystem
      ? 'bg-blue-900/30 text-blue-400'
      : 'bg-purple-900/30 text-purple-400'
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${colors}`}>
        {roleId === 1 && <Crown size={10} />}
        {role.name}
      </span>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">人員管理</h2>
          <p className="text-sm text-gray-500 mt-1">管理廟宇後台管理員帳號與指派角色</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light transition-colors">
          <Plus size={16} /> 新增人員
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="總人數" value={admins.length} color="text-temple-gold" />
        <StatCard icon={ToggleRight} label="啟用中" value={activeCount} color="text-green-400" />
        <StatCard icon={ToggleLeft} label="已停用" value={inactiveCount} color="text-gray-400" />
        <StatCard icon={Shield} label="角色數" value={roles.length} color="text-blue-400" />
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${roleFilter === 'all' ? 'bg-temple-gold text-admin-dark' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
            全部 ({admins.length})
          </button>
          {roles.map(role => {
            const count = admins.filter(a => a.roleId === role.id).length
            return (
              <button key={role.id} onClick={() => setRoleFilter(String(role.id))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${roleFilter === String(role.id) ? 'bg-temple-gold text-admin-dark' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
                {role.name} ({count})
              </button>
            )
          })}
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜尋姓名、信箱..."
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-temple-gold/50" />
        </div>
      </div>

      {/* 人員列表 */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map(admin => (
            <div key={admin.id}
              className={`flex items-center gap-4 px-5 py-4 bg-admin-dark-light border rounded-xl transition-colors group ${
                admin.isActive ? 'border-admin-dark-lighter hover:border-temple-gold/30' : 'border-red-900/20 opacity-60'
              }`}>
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                admin.isActive ? 'bg-temple-gold/10' : 'bg-gray-800'
              }`}>
                <User size={20} className={admin.isActive ? 'text-temple-gold' : 'text-gray-500'} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-200 font-medium truncate">{admin.name}</span>
                  {getRoleBadge(admin.roleId)}
                  {!admin.isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 font-medium">已停用</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Mail size={11} /> {admin.email}</span>
                  {admin.phone && <span className="flex items-center gap-1"><Phone size={11} /> {admin.phone}</span>}
                </div>
              </div>

              {/* Last login */}
              <div className="hidden md:block text-xs text-gray-500 shrink-0 w-28 text-right">
                {admin.lastLoginAt ? (
                  <div>
                    <div className="text-gray-400">最近登入</div>
                    <div>{formatDateTime(admin.lastLoginAt)}</div>
                  </div>
                ) : (
                  <span className="text-gray-600">從未登入</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setSelectedAdmin(admin)}
                  className="p-2 text-gray-400 hover:text-temple-gold hover:bg-admin-dark rounded-lg transition-colors" title="查看詳情">
                  <Eye size={16} />
                </button>
                <button onClick={() => openEdit(admin)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors" title="編輯">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleToggleActive(admin)}
                  disabled={admin.roleId === 1}
                  className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={admin.roleId === 1 ? '不可停用擁有者' : admin.isActive ? '停用帳號' : '啟用帳號'}>
                  {admin.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
                {admin.roleId !== 1 && (
                  <button onClick={() => setDeleteTarget(admin)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors" title="刪除">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users size={40} className="mx-auto text-gray-600 mb-3" />
          <h3 className="text-lg text-gray-400 mb-1">
            {search || roleFilter !== 'all' ? '找不到符合條件的人員' : '尚無管理員'}
          </h3>
          <p className="text-sm text-gray-500">點擊右上角新增人員</p>
        </div>
      )}

      {/* 新增 / 編輯 Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAdmin ? `編輯人員 - ${editingAdmin.name}` : '新增人員'}
        size="sm"
        footer={
          <>
            <button onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm hover:text-white transition-colors">
              取消
            </button>
            <button onClick={handleSave}
              disabled={!form.name.trim() || !form.email.trim() || !form.roleId}
              className="px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light transition-colors disabled:opacity-50">
              {editingAdmin ? '儲存變更' : '新增人員'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">姓名 *</label>
            <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="管理員姓名"
              className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="用於登入的 Email"
              className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">電話</label>
            <input type="text" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="聯絡電話"
              className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">指派角色 *</label>
            <select value={form.roleId} onChange={e => setForm(prev => ({ ...prev, roleId: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 focus:outline-none focus:border-temple-gold/50">
              <option value="">請選擇角色</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name} - {r.description || '無描述'}</option>
              ))}
            </select>
          </div>
          {!editingAdmin && (
            <div className="p-3 bg-blue-900/20 border border-blue-900/30 rounded-lg">
              <p className="text-xs text-blue-300">新增後系統將發送邀請信至管理員信箱，設定密碼後即可登入。（目前為展示模式）</p>
            </div>
          )}
        </div>
      </AdminModal>

      {/* 詳情 Modal */}
      <AdminModal
        isOpen={!!selectedAdmin}
        onClose={() => setSelectedAdmin(null)}
        title="人員詳情"
        size="md"
        footer={
          <div className="flex w-full justify-between">
            <button onClick={() => { setSelectedAdmin(null); openEdit(selectedAdmin) }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors">
              <Pencil size={14} /> 編輯
            </button>
            <button onClick={() => setSelectedAdmin(null)}
              className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm hover:text-white transition-colors">
              關閉
            </button>
          </div>
        }
      >
        {selectedAdmin && (() => {
          const role = roles.find(r => r.id === selectedAdmin.roleId)
          return (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-temple-gold/10 rounded-full flex items-center justify-center">
                  <User size={28} className="text-temple-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedAdmin.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(selectedAdmin.roleId)}
                    {selectedAdmin.isActive
                      ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/30 text-green-400 font-medium">啟用中</span>
                      : <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 font-medium">已停用</span>
                    }
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-admin-dark rounded-lg">
                  <Mail size={16} className="text-blue-400 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-gray-200 text-sm">{selectedAdmin.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-admin-dark rounded-lg">
                  <Phone size={16} className="text-green-400 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">電話</div>
                    <div className="text-gray-200 text-sm">{selectedAdmin.phone || '未提供'}</div>
                  </div>
                </div>
              </div>

              {/* 角色權限一覽 */}
              {role && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">
                    角色權限 - {role.name}（{role.permissions.length} 項）
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {PERMISSION_MODULES.map(mod => {
                      const granted = mod.permissions.filter(p => role.permissions.includes(p.code))
                      if (granted.length === 0) return null
                      return (
                        <div key={mod.module} className="p-3 bg-admin-dark rounded-lg">
                          <div className="text-xs font-medium text-gray-400 mb-2">{mod.label}</div>
                          <div className="space-y-1">
                            {mod.permissions.map(p => (
                              <div key={p.code} className="flex items-center gap-2 text-xs">
                                {role.permissions.includes(p.code) ? (
                                  <Check size={12} className="text-green-400 shrink-0" />
                                ) : (
                                  <X size={12} className="text-gray-600 shrink-0" />
                                )}
                                <span className={role.permissions.includes(p.code) ? 'text-gray-300' : 'text-gray-600'}>
                                  {p.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-admin-dark rounded-lg text-center">
                  <div className="text-xs text-gray-500">建立時間</div>
                  <div className="text-sm text-gray-300 mt-0.5">{formatDateTime(selectedAdmin.createdAt)}</div>
                </div>
                <div className="p-3 bg-admin-dark rounded-lg text-center">
                  <div className="text-xs text-gray-500">最近登入</div>
                  <div className="text-sm text-gray-300 mt-0.5">{selectedAdmin.lastLoginAt ? formatDateTime(selectedAdmin.lastLoginAt) : '從未登入'}</div>
                </div>
              </div>
            </div>
          )
        })()}
      </AdminModal>

      {/* 刪除確認 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="刪除人員"
        message={`確定要刪除「${deleteTarget?.name}」的帳號嗎？此操作無法復原。`}
        confirmText="刪除"
      />
    </div>
  )
}


// ===== 主頁面 =====
function RolesPermissionsPage() {
  const [activeTab, setActiveTab] = useState('roles')

  const tabs = [
    { id: 'roles', label: '角色管理', icon: Shield },
    { id: 'admins', label: '人員管理', icon: UserCog },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-temple-gold flex items-center gap-2 mb-6">
        <Shield size={24} />
        權限管理
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-temple-gold text-admin-dark font-medium'
                  : 'bg-admin-dark-lighter text-gray-300 hover:text-white'
              }`}>
              <Icon size={16} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'roles' && <RolesTab />}
      {activeTab === 'admins' && <AdminsTab />}
    </div>
  )
}

export default RolesPermissionsPage
