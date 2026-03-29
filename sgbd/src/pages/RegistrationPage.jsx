import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { Link } from 'react-router-dom'
import { Check, Calendar, MapPin, Clock, User, Phone, Mail, Users, FileText } from 'lucide-react'

function RegistrationPage() {
  const { events, addRegistration } = useData()
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    peopleCount: 1,
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const activeEvents = events.filter(e => e.isActive)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedEvent) {
      alert('請選擇活動')
      return
    }
    if (!formData.name || !formData.phone) {
      alert('請填寫必填欄位')
      return
    }
    addRegistration({
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      eventDate: selectedEvent.date,
      ...formData,
      peopleCount: parseInt(formData.peopleCount) || 1,
    })
    setSubmitted(true)
  }

  // 成功頁面
  if (submitted) {
    return (
      <div className="bg-stone-50 min-h-screen">
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <Check className="text-emerald-600" size={40} />
                </div>
                <h1 className="text-2xl font-bold text-stone-900 mb-2">報名成功</h1>
                <p className="text-stone-500 mb-8">感謝您的報名，我們已收到您的資料</p>

                <div className="bg-stone-50 rounded-xl p-6 mb-8 text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-stone-500">活動名稱</span>
                      <span className="font-medium text-stone-900">{selectedEvent?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">活動日期</span>
                      <span className="font-medium text-stone-900">{selectedEvent?.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">報名人數</span>
                      <span className="font-medium text-stone-900">{formData.peopleCount} 人</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 text-left">
                  <h3 className="font-bold text-amber-800 mb-3">注意事項</h3>
                  <ol className="space-y-2 text-sm text-amber-700">
                    <li className="flex gap-3">
                      <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                      <span>請於活動當日提前 30 分鐘報到</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                      <span>如需取消報名請提前來電告知</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                      <span>活動當日請著整潔服裝</span>
                    </li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setSelectedEvent(null)
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        peopleCount: 1,
                        notes: '',
                      })
                    }}
                    className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-100 transition-colors font-medium"
                  >
                    繼續報名
                  </button>
                  <Link
                    to="/"
                    className="flex-1 py-3 bg-red-800 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-center"
                  >
                    返回首頁
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-800 to-stone-900 pt-24 pb-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-serif font-bold text-white mb-2">活動報名</h1>
          <p className="text-stone-300">線上報名，參與廟方舉辦的各項活動</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* 選擇活動 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-stone-900 mb-4">選擇活動</h2>

            {activeEvents.length > 0 ? (
              <div className="space-y-4">
                {activeEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                      selectedEvent?.id === event.id
                        ? 'bg-red-50 border-red-500 ring-2 ring-red-500'
                        : 'bg-white border-stone-200 hover:border-red-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* 日期徽章 */}
                      <div className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
                        selectedEvent?.id === event.id ? 'bg-red-700 text-white' : 'bg-stone-100 text-stone-600'
                      }`}>
                        <span className="text-xs">{event.date.split('-')[1]}月</span>
                        <span className="text-2xl font-bold">{event.date.split('-')[2]}</span>
                      </div>

                      {/* 活動資訊 */}
                      <div className="flex-1">
                        <h3 className="font-bold text-stone-900 mb-2">{event.title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {event.date}
                          </span>
                          {event.time && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {event.time}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {event.location || '三官寶殿'}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-stone-400 mt-2 line-clamp-2">{event.description}</p>
                        )}
                      </div>

                      {/* 勾選標記 */}
                      {selectedEvent?.id === event.id && (
                        <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check size={18} className="text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
                <Calendar className="mx-auto text-stone-300 mb-4" size={48} />
                <p className="text-stone-500">目前沒有開放報名的活動</p>
                <Link to="/events" className="inline-block mt-4 text-red-700 font-medium hover:underline">
                  查看活動資訊 →
                </Link>
              </div>
            )}
          </div>

          {/* 報名表單 */}
          {selectedEvent && (
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h2 className="font-bold text-stone-900 mb-1">填寫報名資料</h2>
              <p className="text-sm text-stone-500 mb-6">報名活動：{selectedEvent.title}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      <User size={14} className="inline mr-1" />
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="請輸入姓名"
                      required
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      <Phone size={14} className="inline mr-1" />
                      聯絡電話 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0912-345-678"
                      required
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      <Mail size={14} className="inline mr-1" />
                      電子信箱
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      <Users size={14} className="inline mr-1" />
                      報名人數
                    </label>
                    <input
                      type="number"
                      name="peopleCount"
                      value={formData.peopleCount}
                      onChange={handleChange}
                      min="1"
                      max="20"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    <FileText size={14} className="inline mr-1" />
                    備註
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="如有特殊需求請在此說明"
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-800 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  確認報名
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegistrationPage
