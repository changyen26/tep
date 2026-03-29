import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { loadFromStorage, saveToStorage } from '../utils/storage'

const PermissionContext = createContext(null)

// ===== 系統權限定義（不可修改）=====
export const PERMISSION_MODULES = [
  {
    module: 'temple_info',
    label: '廟宇資訊',
    permissions: [
      { code: 'manage_info', name: '編輯廟宇基本資訊' },
      { code: 'manage_images', name: '管理廟宇圖片' },
    ],
  },
  {
    module: 'member',
    label: '信眾管理',
    permissions: [
      { code: 'view_members', name: '查看信眾列表' },
      { code: 'manage_members', name: '管理信眾資料' },
    ],
  },
  {
    module: 'lighting',
    label: '點燈管理',
    permissions: [
      { code: 'view_lightings', name: '查看點燈紀錄' },
      { code: 'manage_lightings', name: '管理點燈申請' },
    ],
  },
  {
    module: 'pilgrimage',
    label: '進香管理',
    permissions: [
      { code: 'view_pilgrimages', name: '查看進香紀錄' },
      { code: 'manage_pilgrimages', name: '管理進香登記' },
    ],
  },
  {
    module: 'event',
    label: '活動管理',
    permissions: [
      { code: 'view_events', name: '查看活動' },
      { code: 'manage_events', name: '新增/編輯活動' },
      { code: 'manage_registrations', name: '管理活動報名' },
    ],
  },
  {
    module: 'content',
    label: '內容管理',
    permissions: [
      { code: 'manage_news', name: '管理最新消息' },
      { code: 'manage_website_content', name: '編輯網站內容' },
      { code: 'manage_gallery', name: '管理相簿' },
    ],
  },
  {
    module: 'finance',
    label: '財務管理',
    permissions: [
      { code: 'view_receipts', name: '查看收據紀錄' },
      { code: 'manage_receipts', name: '管理收據' },
    ],
  },
  {
    module: 'notification',
    label: '通知管理',
    permissions: [
      { code: 'send_notifications', name: '發送通知' },
      { code: 'manage_notification_settings', name: '管理通知設定' },
    ],
  },
  {
    module: 'stats',
    label: '數據分析',
    permissions: [
      { code: 'view_stats', name: '查看統計報表' },
    ],
  },
  {
    module: 'system',
    label: '系統管理',
    permissions: [
      { code: 'manage_settings', name: '管理系統設定' },
      { code: 'manage_roles', name: '管理角色與權限' },
      { code: 'manage_admins', name: '管理人員帳號' },
    ],
  },
]

// 所有權限碼的扁平列表
export const ALL_PERMISSION_CODES = PERMISSION_MODULES.flatMap(m => m.permissions.map(p => p.code))

// ===== 預設角色 =====
const initialRoles = [
  {
    id: 1,
    name: '擁有者',
    description: '廟宇最高管理者，擁有全部權限',
    isSystem: true,
    permissions: [...ALL_PERMISSION_CODES],
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: 2,
    name: '管理員',
    description: '協助管理廟務，不可管理角色與人員',
    isSystem: true,
    permissions: ALL_PERMISSION_CODES.filter(p => !['manage_roles', 'manage_admins', 'manage_settings'].includes(p)),
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: 3,
    name: '工作人員',
    description: '負責日常業務，僅有查看與基本操作權限',
    isSystem: true,
    permissions: [
      'view_members', 'view_lightings', 'manage_lightings',
      'view_pilgrimages', 'view_events', 'manage_registrations',
      'view_receipts', 'view_stats',
    ],
    createdAt: '2024-01-01T00:00:00',
  },
]

// ===== 預設管理員 =====
const initialAdmins = [
  {
    id: 1,
    name: '王主委',
    email: 'owner@temple.org.tw',
    phone: '0912-000-001',
    roleId: 1,
    isActive: true,
    lastLoginAt: '2024-01-25T10:30:00',
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: 2,
    name: '陳總幹事',
    email: 'manager@temple.org.tw',
    phone: '0912-000-002',
    roleId: 2,
    isActive: true,
    lastLoginAt: '2024-01-24T14:00:00',
    createdAt: '2024-01-05T00:00:00',
  },
  {
    id: 3,
    name: '林小姐',
    email: 'staff@temple.org.tw',
    phone: '0912-000-003',
    roleId: 3,
    isActive: true,
    lastLoginAt: '2024-01-23T09:00:00',
    createdAt: '2024-01-10T00:00:00',
  },
  {
    id: 4,
    name: '張志明',
    email: 'staff2@temple.org.tw',
    phone: '0912-000-004',
    roleId: 3,
    isActive: false,
    lastLoginAt: null,
    createdAt: '2024-01-15T00:00:00',
  },
]

export function PermissionProvider({ children }) {
  const [roles, setRoles] = useState([])
  const [admins, setAdmins] = useState([])
  const isLoaded = useRef(false)

  useEffect(() => {
    setRoles(loadFromStorage('roles', initialRoles))
    setAdmins(loadFromStorage('admins', initialAdmins))
    isLoaded.current = true
  }, [])

  useEffect(() => { if (isLoaded.current) saveToStorage('roles', roles) }, [roles])
  useEffect(() => { if (isLoaded.current) saveToStorage('admins', admins) }, [admins])

  // ===== 角色操作 =====
  const addRole = (data) => {
    const newRole = { ...data, id: Date.now(), isSystem: false, createdAt: new Date().toISOString() }
    setRoles(prev => [...prev, newRole])
    return newRole
  }
  const updateRole = (id, data) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...data } : r))
  }
  const deleteRole = (id) => {
    setRoles(prev => prev.filter(r => r.id !== id))
  }

  // ===== 管理員操作 =====
  const addAdmin = (data) => {
    const newAdmin = { ...data, id: Date.now(), isActive: true, lastLoginAt: null, createdAt: new Date().toISOString() }
    setAdmins(prev => [...prev, newAdmin])
    return newAdmin
  }
  const updateAdmin = (id, data) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, ...data } : a))
  }
  const deleteAdmin = (id) => {
    setAdmins(prev => prev.filter(a => a.id !== id))
  }

  // ===== 工具函式 =====
  const getRoleName = (roleId) => {
    return roles.find(r => r.id === roleId)?.name || '未指定'
  }

  const getRolePermissions = (roleId) => {
    return roles.find(r => r.id === roleId)?.permissions || []
  }

  const getAdminsByRole = (roleId) => {
    return admins.filter(a => a.roleId === roleId)
  }

  return (
    <PermissionContext.Provider value={{
      roles, admins,
      addRole, updateRole, deleteRole,
      addAdmin, updateAdmin, deleteAdmin,
      getRoleName, getRolePermissions, getAdminsByRole,
    }}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermission() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider')
  }
  return context
}
