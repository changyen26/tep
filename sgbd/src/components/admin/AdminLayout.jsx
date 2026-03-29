import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import {
  LayoutDashboard, Flame, Bus, ClipboardList, Receipt, Send, Users,
  CalendarDays, Megaphone, FileText, Image, BarChart3,
  CalendarRange, MessageSquare, Settings, ChevronRight,
  Menu, X, Bell, LogOut, ExternalLink, User, ChevronDown, Shield
} from 'lucide-react'

const menuGroups = [
  {
    title: '營運管理',
    items: [
      { path: '/admin', label: '儀表板', icon: LayoutDashboard },
      { path: '/admin/lightings', label: '點燈管理', icon: Flame },
      { path: '/admin/pilgrimages', label: '進香管理', icon: Bus },
      { path: '/admin/registrations', label: '活動報名', icon: ClipboardList },
      { path: '/admin/receipts', label: '收據管理', icon: Receipt },
      { path: '/admin/members', label: '信眾管理', icon: Users },
      { path: '/admin/notifications', label: '通知管理', icon: Send },
    ],
  },
  {
    title: '內容管理',
    items: [
      { path: '/admin/events', label: '活動管理', icon: CalendarDays },
      { path: '/admin/news', label: '最新消息', icon: Megaphone },
      { path: '/admin/content', label: '網站內容', icon: FileText },
      { path: '/admin/gallery', label: '相簿管理', icon: Image },
    ],
  },
  {
    title: '系統',
    items: [
      { path: '/admin/stats', label: '統計報表', icon: BarChart3 },
      { path: '/admin/calendar', label: '農民曆', icon: CalendarRange },
      { path: '/admin/contacts', label: '聯絡留言', icon: MessageSquare },
      { path: '/admin/roles', label: '權限管理', icon: Shield },
      { path: '/admin/settings', label: '系統設定', icon: Settings },
    ],
  },
]

// Breadcrumb label map
const pathLabels = {}
menuGroups.forEach(g => g.items.forEach(i => { pathLabels[i.path] = i.label }))

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { contactMessages, notifications } = useData()
  const location = useLocation()
  const navigate = useNavigate()
  const userMenuRef = useRef(null)

  const unreadCount = contactMessages?.filter(m => m.status === 'unread').length || 0
  const draftNotifCount = notifications?.filter(n => n.status === 'draft').length || 0
  const currentLabel = pathLabels[location.pathname] || '後台管理'

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="flex min-h-screen bg-admin-dark text-gray-200">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[250px] bg-admin-sidebar border-r border-admin-sidebar-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-admin-sidebar-border">
          <Link to="/" className="flex items-center gap-2.5 text-temple-gold hover:text-temple-gold-light transition-colors">
            <span className="text-2xl">☯</span>
            <span className="text-lg font-semibold">三官寶殿</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {menuGroups.map((group) => (
            <div key={group.title} className="mb-2">
              <div className="px-5 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                const isContacts = item.path === '/admin/contacts'
                const isNotifications = item.path === '/admin/notifications'
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors border-l-[3px] ${
                      isActive
                        ? 'bg-admin-sidebar-light border-temple-gold text-temple-gold'
                        : 'border-transparent text-gray-400 hover:bg-admin-sidebar-light hover:text-temple-gold'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{item.label}</span>
                    {isContacts && unreadCount > 0 && (
                      <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5 bg-red-600 text-white text-xs rounded-full">
                        {unreadCount}
                      </span>
                    )}
                    {isNotifications && draftNotifCount > 0 && (
                      <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5 bg-amber-500 text-white text-xs rounded-full">
                        {draftNotifCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-admin-sidebar-border">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-temple-gold transition-colors">
            <ExternalLink size={14} />
            <span>返回前台</span>
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-[250px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-admin-dark-light border-b border-admin-dark-lighter px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-temple-gold">
                <Menu size={22} />
              </button>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-gray-500">後台管理</span>
                <ChevronRight size={14} className="text-gray-600" />
                <span className="text-temple-gold font-medium">{currentLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification bell */}
              <Link
                to="/admin/contacts"
                className="relative p-2 text-gray-400 hover:text-temple-gold rounded-lg hover:bg-admin-dark transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-red-600 text-white text-[10px] rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User dropdown */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-admin-dark transition-colors"
                >
                  <div className="w-7 h-7 bg-temple-gold/20 rounded-full flex items-center justify-center">
                    <User size={14} className="text-temple-gold" />
                  </div>
                  <span className="hidden sm:inline text-sm text-gray-300">{user?.name}</span>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-admin-dark-light border border-admin-dark-lighter rounded-lg shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-admin-dark-lighter">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500">管理員</p>
                    </div>
                    <Link
                      to="/admin/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-admin-dark hover:text-white transition-colors"
                    >
                      <Settings size={14} />
                      系統設定
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-admin-dark hover:text-red-300 transition-colors"
                    >
                      <LogOut size={14} />
                      登出
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
