import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiff } from '../contexts/LiffContext'
import { fetchEvent, submitRegistration } from '../services/api'
import Loading from '../components/Loading'

function RegisterPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { lineUserId, profile } = useLiff()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    peopleCount: 1,
    notes: '',
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchEvent(eventId)
      .then(res => {
        setEvent(res.data)
        // 自動帶入 LINE 暱稱
        if (profile?.displayName) {
          setForm(prev => ({ ...prev, name: prev.name || profile.displayName }))
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [eventId, profile])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim()) { setFormError('請填寫姓名'); return }
    if (!form.phone.trim()) { setFormError('請填寫電話'); return }

    setSubmitting(true)
    try {
      await submitRegistration(eventId, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        peopleCount: form.peopleCount,
        notes: form.notes.trim(),
        lineUserId,
      })
      setSuccess(true)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading message="載入活動資訊..." />

  if (!lineUserId) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-lg font-bold text-white mb-2">請先登入</h2>
        <p className="text-gray-400 mb-6 text-sm">報名活動需要 LINE 帳號驗證</p>
        <button onClick={login}
          className="px-6 py-3 bg-[#06C755] text-white rounded-xl font-semibold">
          LINE 登入
        </button>
        <button onClick={() => navigate('/events')}
          className="block mx-auto mt-4 text-sm text-gray-400">
          ← 返回活動列表
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 mb-2">載入失敗</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={() => navigate('/events')}
          className="mt-4 px-4 py-2 bg-card text-gray-300 rounded-lg text-sm">
          返回活動列表
        </button>
      </div>
    )
  }

  // 成功頁面
  if (success) {
    const startDate = event?.startAt ? new Date(event.startAt) : null

    return (
      <div className="p-6 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-white mb-2">報名成功！</h2>
        <p className="text-gray-400 mb-6">我們將發送確認通知給您</p>

        <div className="bg-card border border-card rounded-xl p-5 text-left mb-6">
          <h3 className="text-temple-gold font-semibold mb-3">{event?.title}</h3>
          <div className="space-y-2 text-sm">
            {startDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">時間</span>
                <span className="text-gray-300">
                  {startDate.getFullYear()}/{startDate.getMonth() + 1}/{startDate.getDate()}{' '}
                  {startDate.getHours().toString().padStart(2, '0')}:
                  {startDate.getMinutes().toString().padStart(2, '0')}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">地點</span>
              <span className="text-gray-300">{event?.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">姓名</span>
              <span className="text-gray-300">{form.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">人數</span>
              <span className="text-gray-300">{form.peopleCount} 人</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => navigate('/my')}
            className="w-full py-3 bg-temple-gold text-[#0f0f1a] rounded-xl font-semibold">
            查看我的報名
          </button>
          <button onClick={() => navigate('/events')}
            className="w-full py-3 bg-card border border-card text-gray-300 rounded-xl">
            返回活動列表
          </button>
        </div>
      </div>
    )
  }

  // 報名表單
  const startDate = event?.startAt ? new Date(event.startAt) : null
  const inputCls = 'w-full px-4 py-3 bg-[#0f0f1a] border border-card rounded-xl text-gray-200 text-base focus:outline-none focus:border-[var(--color-temple-gold)]'

  return (
    <div className="p-4 pb-8">
      {/* 活動資訊 */}
      <div className="bg-card border border-card rounded-xl p-4 mb-6">
        <h2 className="text-lg font-bold text-temple-gold mb-2">{event?.title}</h2>
        <div className="space-y-1.5 text-sm text-gray-400">
          {startDate && (
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>
                {startDate.getFullYear()}/{startDate.getMonth() + 1}/{startDate.getDate()}{' '}
                {startDate.getHours().toString().padStart(2, '0')}:
                {startDate.getMinutes().toString().padStart(2, '0')}
              </span>
            </div>
          )}
          {event?.location && (
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
          )}
          {event?.remainingCapacity !== null && (
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>剩餘 {event.remainingCapacity} 名</span>
            </div>
          )}
        </div>
      </div>

      {/* 表單 */}
      <form onSubmit={handleSubmit}>
        <h3 className="text-white font-semibold mb-4">填寫報名資料</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">姓名 *</label>
            <input type="text" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="您的姓名" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">電話 *</label>
            <input type="tel" value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="0912-345-678" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="選填" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">報名人數</label>
            <div className="flex items-center gap-3">
              <button type="button"
                onClick={() => setForm(p => ({ ...p, peopleCount: Math.max(1, p.peopleCount - 1) }))}
                className="w-10 h-10 bg-card border border-card rounded-xl text-gray-300 text-lg font-bold flex items-center justify-center">
                −
              </button>
              <span className="text-xl font-bold text-white w-8 text-center">{form.peopleCount}</span>
              <button type="button"
                onClick={() => setForm(p => ({ ...p, peopleCount: Math.min(20, p.peopleCount + 1) }))}
                className="w-10 h-10 bg-card border border-card rounded-xl text-gray-300 text-lg font-bold flex items-center justify-center">
                +
              </button>
              <span className="text-sm text-gray-500">人</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">備註</label>
            <textarea value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="特殊需求或其他說明（選填）" rows={3}
              className={`${inputCls} resize-none`} />
          </div>
        </div>

        {formError && (
          <p className="text-red-400 text-sm mt-4 bg-red-900/20 p-3 rounded-lg">{formError}</p>
        )}

        <button type="submit" disabled={submitting}
          className="w-full mt-6 py-3.5 bg-temple-gold text-[#0f0f1a] rounded-xl font-bold text-base disabled:opacity-50 transition-all active:scale-[0.98]">
          {submitting ? '報名中...' : '確認報名'}
        </button>
      </form>

      <button onClick={() => navigate('/events')}
        className="w-full mt-3 py-3 text-gray-400 text-sm">
        ← 返回活動列表
      </button>
    </div>
  )
}

export default RegisterPage
