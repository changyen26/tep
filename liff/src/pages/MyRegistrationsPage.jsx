import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiff } from '../contexts/LiffContext'
import { fetchMyRegistrations, cancelRegistration } from '../services/api'
import Loading from '../components/Loading'

const statusConfig = {
  registered: { label: '已報名', color: 'bg-blue-900/30 text-blue-400' },
  confirmed: { label: '已確認', color: 'bg-green-900/30 text-green-400' },
  canceled: { label: '已取消', color: 'bg-red-900/30 text-red-400' },
  waitlist: { label: '候補中', color: 'bg-amber-900/30 text-amber-400' },
}

function MyRegistrationsPage() {
  const navigate = useNavigate()
  const { lineUserId } = useLiff()

  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelingId, setCancelingId] = useState(null)
  const [cancelConfirm, setCancelConfirm] = useState(null)

  const load = () => {
    if (!lineUserId) return
    setLoading(true)
    fetchMyRegistrations(lineUserId)
      .then(res => setRegistrations(res.data?.registrations || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [lineUserId])

  const handleCancel = async (reg) => {
    setCancelingId(reg.id)
    try {
      await cancelRegistration(reg.id, lineUserId)
      // 更新本地狀態
      setRegistrations(prev =>
        prev.map(r => r.id === reg.id ? { ...r, status: 'canceled' } : r)
      )
      setCancelConfirm(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setCancelingId(null)
    }
  }

  if (loading) return <Loading message="載入報名紀錄..." />

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-xl font-bold text-temple-gold">我的報名</h1>
        <button onClick={() => navigate('/events')}
          className="text-sm text-gray-400 bg-card border border-card px-3 py-1.5 rounded-lg">
          活動報名
        </button>
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-red-400 mb-2">載入失敗</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={load} className="mt-3 text-sm text-temple-gold">重新載入</button>
        </div>
      )}

      {!error && registrations.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-400 mb-2">您還沒有報名紀錄</p>
          <button onClick={() => navigate('/events')}
            className="mt-3 px-5 py-2 bg-temple-gold text-[#0f0f1a] rounded-xl text-sm font-semibold">
            前往報名
          </button>
        </div>
      )}

      <div className="space-y-3">
        {registrations.map(reg => {
          const event = reg.event || {}
          const startDate = event.startAt ? new Date(event.startAt) : null
          const status = statusConfig[reg.status] || statusConfig.registered
          const canCancel = reg.status === 'registered' || reg.status === 'confirmed'

          return (
            <div key={reg.id} className="bg-card border border-card rounded-xl overflow-hidden">
              <div className="p-4">
                {/* 標題 + 狀態 */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-white font-semibold flex-1">{event.title || '活動'}</h3>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* 資訊 */}
                <div className="space-y-1 text-sm text-gray-400">
                  {startDate && (
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-center text-gray-500">📅</span>
                      <span>
                        {startDate.getMonth() + 1}/{startDate.getDate()}{' '}
                        {startDate.getHours().toString().padStart(2, '0')}:
                        {startDate.getMinutes().toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-center text-gray-500">👤</span>
                    <span>{reg.name}・{reg.peopleCount} 人</span>
                  </div>
                </div>

                {/* 取消按鈕 */}
                {canCancel && (
                  <div className="mt-3 pt-3 border-t border-card">
                    {cancelConfirm === reg.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 flex-1">確定取消？</span>
                        <button onClick={() => setCancelConfirm(null)}
                          className="px-3 py-1.5 text-sm text-gray-400 bg-card-light rounded-lg">
                          否
                        </button>
                        <button onClick={() => handleCancel(reg)}
                          disabled={cancelingId === reg.id}
                          className="px-3 py-1.5 text-sm text-red-400 bg-red-900/20 rounded-lg disabled:opacity-50">
                          {cancelingId === reg.id ? '取消中...' : '確定取消'}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setCancelConfirm(reg.id)}
                        className="text-sm text-gray-500 hover:text-red-400 transition-colors">
                        取消報名
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyRegistrationsPage
