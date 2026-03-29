import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchEvents } from '../services/api'
import Loading from '../components/Loading'

function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchEvents()
      .then(res => setEvents(res.data?.events || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading message="載入活動中..." />

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 mb-2">載入失敗</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-4 pb-8">
      {/* Header */}
      <div className="text-center mb-6 pt-2">
        <div className="text-3xl mb-2">☯</div>
        <h1 className="text-xl font-bold text-temple-gold">三官寶殿</h1>
        <p className="text-sm text-gray-400 mt-1">活動報名</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">目前沒有開放報名的活動</p>
          <p className="text-sm text-gray-500">請稍後再來查看</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => {
            const startDate = event.startAt ? new Date(event.startAt) : null
            const remaining = event.remainingCapacity
            const isFull = remaining !== null && remaining <= 0

            return (
              <div
                key={event.id}
                onClick={() => !isFull && navigate(`/events/${event.id}/register`)}
                className={`bg-card border border-card rounded-xl overflow-hidden transition-all ${
                  isFull ? 'opacity-50' : 'active:scale-[0.98] cursor-pointer'
                }`}
              >
                {/* 日期標籤 */}
                {startDate && (
                  <div className="bg-card-light px-4 py-2 flex items-center justify-between border-b border-card">
                    <div className="flex items-center gap-2">
                      <span className="text-temple-gold font-bold text-lg">
                        {startDate.getMonth() + 1}/{startDate.getDate()}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {['日', '一', '二', '三', '四', '五', '六'][startDate.getDay()]}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {startDate.getHours().toString().padStart(2, '0')}:
                      {startDate.getMinutes().toString().padStart(2, '0')}
                    </span>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2">{event.title}</h3>

                  <div className="space-y-1.5 text-sm text-gray-400">
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center text-gray-500">📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.fee > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center text-gray-500">💰</span>
                        <span>NT$ {event.fee}</span>
                      </div>
                    )}
                  </div>

                  {/* 名額 */}
                  <div className="mt-3 flex items-center justify-between">
                    {event.capacity > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full w-24 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, ((event.totalPeople || 0) / event.capacity) * 100)}%`,
                              backgroundColor: isFull ? '#ef4444' : 'var(--color-temple-gold)',
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {isFull ? '已額滿' : `剩 ${remaining} 名`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">不限名額</span>
                    )}

                    {!isFull && (
                      <span className="text-xs bg-temple-gold text-[#0f0f1a] px-3 py-1 rounded-full font-medium">
                        立即報名
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default EventsPage
