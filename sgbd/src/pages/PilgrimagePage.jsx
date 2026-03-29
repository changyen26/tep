import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { Link } from 'react-router-dom'
import { Check, Building, Calendar, Clock, Users, Bus, User, Phone, Mail, FileText } from 'lucide-react'

const initialFormData = {
  templeName: '',
  contactName: '',
  phone: '',
  email: '',
  peopleCount: '',
  busCount: '',
  visitDate: '',
  visitTime: '',
  notes: '',
}

function PilgrimagePage() {
  const { addPilgrimage } = useData()
  const [formData, setFormData] = useState(initialFormData)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.templeName || !formData.contactName || !formData.phone || !formData.visitDate || !formData.peopleCount) {
      alert('請填寫必填欄位')
      return
    }
    addPilgrimage({
      ...formData,
      peopleCount: parseInt(formData.peopleCount) || 0,
      busCount: parseInt(formData.busCount) || 0,
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
                <h1 className="text-2xl font-bold text-stone-900 mb-2">登記成功</h1>
                <p className="text-stone-500 mb-8">感謝您的登記，我們已收到您的進香預約</p>

                <div className="bg-stone-50 rounded-xl p-6 mb-8 text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-stone-500">進香團名稱</span>
                      <span className="font-medium text-stone-900">{formData.templeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">預計日期</span>
                      <span className="font-medium text-stone-900">{formData.visitDate} {formData.visitTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">預計人數</span>
                      <span className="font-medium text-stone-900">{formData.peopleCount} 人</span>
                    </div>
                    {formData.busCount && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">車輛數</span>
                        <span className="font-medium text-stone-900">{formData.busCount} 輛</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 text-left">
                  <h3 className="font-bold text-amber-800 mb-3">後續步驟</h3>
                  <ol className="space-y-2 text-sm text-amber-700">
                    <li className="flex gap-3">
                      <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                      <span>廟方人員將於 3 個工作日內與您聯繫確認</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                      <span>確認後請依約定時間蒞臨參拜</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                      <span>如需更改日期請提前來電告知</span>
                    </li>
                  </ol>
                </div>

                <Link
                  to="/"
                  className="inline-block w-full py-3 bg-red-800 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  返回首頁
                </Link>
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
          <h1 className="text-3xl font-serif font-bold text-white mb-2">進香登記</h1>
          <p className="text-stone-300">歡迎各地宮廟、進香團蒞臨參拜</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 介紹 */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Building className="text-red-700" size={24} />
              </div>
              <div>
                <h2 className="font-bold text-stone-900 mb-1">進香團預約登記</h2>
                <p className="text-sm text-stone-500">
                  為提供最完善的接待服務，請於來訪前三日填寫此表單預約，廟方將盡快與您聯繫確認。
                </p>
              </div>
            </div>
          </div>

          {/* 表單 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 進香團資訊 */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Building size={18} className="text-red-700" />
                進香團資訊
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    進香團/宮廟名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="templeName"
                    value={formData.templeName}
                    onChange={handleChange}
                    placeholder="例：北港朝天宮進香團"
                    required
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      <Calendar size={14} className="inline mr-1" />
                      預計日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="visitDate"
                      value={formData.visitDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      <Clock size={14} className="inline mr-1" />
                      預計時間
                    </label>
                    <input
                      type="time"
                      name="visitTime"
                      value={formData.visitTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      <Users size={14} className="inline mr-1" />
                      預計人數 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="peopleCount"
                      value={formData.peopleCount}
                      onChange={handleChange}
                      placeholder="請輸入人數"
                      min="1"
                      required
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      <Bus size={14} className="inline mr-1" />
                      車輛數
                    </label>
                    <input
                      type="number"
                      name="busCount"
                      value={formData.busCount}
                      onChange={handleChange}
                      placeholder="遊覽車數量"
                      min="0"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 聯絡資訊 */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <User size={18} className="text-red-700" />
                聯絡資訊
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      聯絡人姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="請輸入聯絡人姓名"
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
                    <FileText size={14} className="inline mr-1" />
                    備註事項
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="如有特殊需求請在此說明（例：需要導覽服務、用餐安排等）"
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 送出按鈕 */}
            <button
              type="submit"
              className="w-full py-3 bg-red-800 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              送出登記
            </button>
          </form>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-amber-50 border-t border-amber-100 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <h3 className="font-bold text-amber-800 mb-3">進香須知</h3>
            <ul className="space-y-2 text-sm text-amber-700">
              <li>• 請於預計來訪前三日完成登記，以利廟方安排接待</li>
              <li>• 如需更改或取消預約，請提前來電告知</li>
              <li>• 廟前設有停車場，可容納遊覽車停放</li>
              <li>• 如需導覽服務或用餐安排，請於備註說明</li>
              <li>• 聯絡電話：06-685-2428</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PilgrimagePage
