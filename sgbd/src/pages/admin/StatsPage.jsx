import { useMemo } from 'react'
import { useData } from '../../contexts/DataContext'
import { lightTypeNames } from '../../utils/adminUtils'
import { Flame, Bus, CalendarDays, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts'

const COLORS = ['#d4a017', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b']

function StatsPage() {
  const { lightings, pilgrimages, registrations } = useData()

  const lightingStats = useMemo(() => ({
    total: lightings.length,
    pending: lightings.filter(l => l.status === 'pending').length,
    confirmed: lightings.filter(l => l.status === 'confirmed').length,
    paid: lightings.filter(l => l.status === 'paid').length,
    completed: lightings.filter(l => l.status === 'completed').length,
    totalAmount: lightings.reduce((s, l) => s + (l.totalAmount || 0), 0),
    paidAmount: lightings.filter(l => l.status === 'paid' || l.status === 'completed').reduce((s, l) => s + (l.totalAmount || 0), 0),
  }), [lightings])

  const typeData = useMemo(() => {
    const map = {}
    lightings.forEach(l => {
      const type = l.lightType || 'other'
      if (!map[type]) map[type] = { name: lightTypeNames[type] || type, count: 0, amount: 0 }
      map[type].count++
      map[type].amount += l.totalAmount || 0
    })
    return Object.values(map)
  }, [lightings])

  const statusData = useMemo(() => [
    { name: '待處理', value: lightingStats.pending, color: '#f59e0b' },
    { name: '已確認', value: lightingStats.confirmed, color: '#3b82f6' },
    { name: '已繳費', value: lightingStats.paid, color: '#10b981' },
    { name: '已完成', value: lightingStats.completed, color: '#22c55e' },
  ].filter(d => d.value > 0), [lightingStats])

  const pilgrimageStats = useMemo(() => ({
    total: pilgrimages.length,
    totalPeople: pilgrimages.reduce((s, p) => s + (p.peopleCount || 0), 0),
    totalBuses: pilgrimages.reduce((s, p) => s + (p.busCount || 0), 0),
  }), [pilgrimages])

  const registrationStats = useMemo(() => ({
    total: registrations.length,
    totalPeople: registrations.reduce((s, r) => s + (r.peopleCount || 0), 0),
  }), [registrations])

  const monthlyData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months.push({
        label: `${date.getMonth() + 1}月`,
        點燈: lightings.filter(l => l.createdAt?.startsWith(key)).length,
        進香: pilgrimages.filter(p => p.createdAt?.startsWith(key)).length,
        報名: registrations.filter(r => r.createdAt?.startsWith(key)).length,
      })
    }
    return months
  }, [lightings, pilgrimages, registrations])

  return (
    <div>
      <h1 className="text-2xl font-bold text-temple-gold mb-6">統計報表</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-admin-dark rounded-lg flex items-center justify-center"><DollarSign size={20} className="text-temple-gold" /></div>
            <div><div className="text-xl font-bold text-temple-gold">NT$ {lightingStats.paidAmount.toLocaleString()}</div><div className="text-xs text-gray-500">點燈收入</div></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">預估總額：NT$ {lightingStats.totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-admin-dark rounded-lg flex items-center justify-center"><Flame size={20} className="text-orange-400" /></div>
            <div><div className="text-xl font-bold text-orange-400">{lightingStats.total} 筆</div><div className="text-xs text-gray-500">點燈登記</div></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">待處理：{lightingStats.pending} 筆</p>
        </div>
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-admin-dark rounded-lg flex items-center justify-center"><Bus size={20} className="text-blue-400" /></div>
            <div><div className="text-xl font-bold text-blue-400">{pilgrimageStats.totalPeople} 人次</div><div className="text-xs text-gray-500">進香團</div></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">{pilgrimageStats.total} 團 / {pilgrimageStats.totalBuses} 車</p>
        </div>
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-admin-dark rounded-lg flex items-center justify-center"><CalendarDays size={20} className="text-green-400" /></div>
            <div><div className="text-xl font-bold text-green-400">{registrationStats.totalPeople} 人</div><div className="text-xs text-gray-500">活動報名</div></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">{registrationStats.total} 筆報名</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Type Distribution */}
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">點燈類型分布</h2>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3d302c" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#2a2220', border: '1px solid #3d302c', borderRadius: 8, color: '#e5e7eb' }} />
                <Bar dataKey="count" fill="#d4a017" name="筆數" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">暫無資料</p>
          )}
        </div>

        {/* Status Pie */}
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">點燈狀態分布</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#2a2220', border: '1px solid #3d302c', borderRadius: 8, color: '#e5e7eb' }} />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">暫無資料</p>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">月度趨勢（近6個月）</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3d302c" />
            <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#2a2220', border: '1px solid #3d302c', borderRadius: 8, color: '#e5e7eb' }} />
            <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
            <Line type="monotone" dataKey="點燈" stroke="#d4a017" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="進香" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="報名" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default StatsPage
