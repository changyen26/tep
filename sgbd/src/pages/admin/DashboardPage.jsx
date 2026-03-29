import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Bus, CalendarDays, Megaphone, MessageSquare, Send, Plus, Download, ArrowRight } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { statusLabels, statusColors, lightTypeNames, formatDateTime, exportToCSV } from '../../utils/adminUtils'
import StatusBadge from '../../components/admin/StatusBadge'
import StatCard from '../../components/admin/StatCard'

function DashboardPage() {
  const navigate = useNavigate()
  const { lightings, pilgrimages, events, news, registrations, contactMessages, notifications } = useData()

  // --- Computed stats ---
  const pendingLightings = lightings.filter(l => l.status === 'pending').length
  const pendingPilgrimages = pilgrimages.filter(p => p.status === 'pending').length
  const activeEvents = events.filter(e => e.isActive).length
  const activeNews = news.filter(n => n.isActive).length
  const unreadMessages = contactMessages.filter(m => m.status === 'unread').length
  const draftNotifications = notifications.filter(n => n.status === 'draft').length

  const stats = [
    {
      label: '待處理點燈',
      value: pendingLightings,
      total: lightings.length,
      icon: Flame,
      link: '/admin/lightings',
      color: 'text-red-400',
    },
    {
      label: '待確認進香',
      value: pendingPilgrimages,
      total: pilgrimages.length,
      icon: Bus,
      link: '/admin/pilgrimages',
      color: 'text-amber-400',
    },
    {
      label: '活動資訊',
      value: activeEvents,
      total: events.length,
      icon: CalendarDays,
      link: '/admin/events',
      color: 'text-blue-400',
    },
    {
      label: '最新消息',
      value: activeNews,
      total: news.length,
      icon: Megaphone,
      link: '/admin/news',
      color: 'text-emerald-400',
    },
    {
      label: '未讀留言',
      value: unreadMessages,
      total: contactMessages.length,
      icon: MessageSquare,
      link: '/admin/contacts',
      color: 'text-purple-400',
    },
    {
      label: '待發送通知',
      value: draftNotifications,
      total: notifications.length,
      icon: Send,
      link: '/admin/notifications',
      color: 'text-amber-400',
    },
  ]

  // --- Recent data ---
  const recentLightings = lightings.slice(0, 5)
  const recentPilgrimages = pilgrimages.slice(0, 5)

  // --- Future 7-day calendar ---
  const upcoming = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 7)

    const items = []

    events.forEach(ev => {
      if (!ev.isActive) return
      const d = new Date(ev.date)
      if (d >= today && d < endDate) {
        items.push({ type: 'event', date: ev.date, title: ev.title, time: ev.time, link: '/admin/events' })
      }
    })

    pilgrimages.forEach(pg => {
      if (pg.status === 'cancelled') return
      const d = new Date(pg.visitDate)
      if (d >= today && d < endDate) {
        items.push({ type: 'pilgrimage', date: pg.visitDate, title: pg.templeName, time: pg.visitTime, link: '/admin/pilgrimages' })
      }
    })

    items.sort((a, b) => new Date(a.date) - new Date(b.date))
    return items
  }, [events, pilgrimages])

  // --- CSV export handler ---
  const handleExportLightings = () => {
    const headers = ['編號', '類型', '姓名', '電話', 'Email', '金額', '狀態', '登記時間']
    const rows = lightings.map(l => [
      l.id,
      lightTypeNames[l.lightType] || l.lightType,
      l.members.map(m => m.name).join('、'),
      l.phone,
      l.email,
      l.totalAmount,
      statusLabels[l.status] || l.status,
      formatDateTime(l.createdAt),
    ])
    exportToCSV(headers, rows, '點燈登記名單')
  }

  // --- Format short date for calendar ---
  const formatShortDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' })
  }

  return (
    <div className="max-w-[1200px]">
      {/* Page title */}
      <h1 className="text-temple-gold text-2xl font-bold mb-6">儀表板</h1>

      {/* Stats cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            subtitle={`共 ${stat.total} 筆`}
            link={stat.link}
            color={stat.color}
          />
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => navigate('/admin/events')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          新增活動
        </button>
        <button
          onClick={() => navigate('/admin/news')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          新增消息
        </button>
        <button
          onClick={handleExportLightings}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-admin-dark-light border border-admin-dark-lighter hover:border-temple-gold/40 text-gray-300 hover:text-temple-gold text-sm font-medium rounded-lg transition-colors"
        >
          <Download size={16} />
          匯出名單
        </button>
      </div>

      {/* Recent data - two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent lightings */}
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-admin-dark-lighter">
            <h2 className="text-temple-gold text-lg font-semibold">最近點燈登記</h2>
            <Link to="/admin/lightings" className="text-sm text-gray-500 hover:text-temple-gold transition-colors">
              查看全部 <span className="inline-block">→</span>
            </Link>
          </div>
          <div className="py-1">
            {recentLightings.length > 0 ? (
              recentLightings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3.5 border-b border-admin-dark-lighter last:border-b-0 hover:bg-admin-dark transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Flame size={18} className="text-red-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-gray-200 text-sm font-medium truncate">
                        {lightTypeNames[item.lightType] || item.lightName}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5 truncate">
                        {item.members.map(m => m.name).join('、')} · {item.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                    <StatusBadge status={item.status} />
                    <span className="text-gray-600 text-xs">{formatDateTime(item.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-gray-500 text-sm">暫無資料</div>
            )}
          </div>
        </div>

        {/* Recent pilgrimages */}
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-admin-dark-lighter">
            <h2 className="text-temple-gold text-lg font-semibold">最近進香登記</h2>
            <Link to="/admin/pilgrimages" className="text-sm text-gray-500 hover:text-temple-gold transition-colors">
              查看全部 <span className="inline-block">→</span>
            </Link>
          </div>
          <div className="py-1">
            {recentPilgrimages.length > 0 ? (
              recentPilgrimages.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3.5 border-b border-admin-dark-lighter last:border-b-0 hover:bg-admin-dark transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Bus size={18} className="text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-gray-200 text-sm font-medium truncate">{item.templeName}</div>
                      <div className="text-gray-500 text-xs mt-0.5 truncate">
                        {item.visitDate} · {item.peopleCount} 人
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                    <StatusBadge status={item.status} />
                    <span className="text-gray-600 text-xs">{formatDateTime(item.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-gray-500 text-sm">暫無資料</div>
            )}
          </div>
        </div>
      </div>

      {/* Future 7-day calendar */}
      <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-admin-dark-lighter">
          <h2 className="text-temple-gold text-lg font-semibold">未來 7 天行事曆</h2>
          <Link to="/admin/calendar" className="text-sm text-gray-500 hover:text-temple-gold transition-colors">
            完整行事曆 <span className="inline-block">→</span>
          </Link>
        </div>
        <div className="py-1">
          {upcoming.length > 0 ? (
            upcoming.map((item, idx) => (
              <Link
                key={`${item.type}-${item.date}-${idx}`}
                to={item.link}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-admin-dark-lighter last:border-b-0 hover:bg-admin-dark transition-colors"
              >
                {/* Date badge */}
                <div className="w-16 text-center shrink-0">
                  <div className="text-xs text-gray-500">{formatShortDate(item.date)}</div>
                </div>

                {/* Type icon */}
                <div className="shrink-0">
                  {item.type === 'event' ? (
                    <CalendarDays size={18} className="text-blue-400" />
                  ) : (
                    <Bus size={18} className="text-amber-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-gray-200 text-sm font-medium truncate">{item.title}</div>
                  {item.time && (
                    <div className="text-gray-500 text-xs mt-0.5">{item.time}</div>
                  )}
                </div>

                {/* Type label */}
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                  item.type === 'event'
                    ? 'bg-blue-900/40 text-blue-300'
                    : 'bg-amber-900/40 text-amber-300'
                }`}>
                  {item.type === 'event' ? '活動' : '進香'}
                </span>

                <ArrowRight size={14} className="text-gray-600 shrink-0" />
              </Link>
            ))
          ) : (
            <div className="px-5 py-8 text-center text-gray-500 text-sm">未來 7 天沒有排程活動</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
