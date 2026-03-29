import { useState, useMemo } from 'react'
import { useData } from '../contexts/DataContext'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, Plus, X, Lightbulb, Shield, BookOpen, Coins, Heart, Baby, ArrowLeft, User, Phone, Mail, MapPin, MessageSquare } from 'lucide-react'

const iconMap = {
  guangming: { icon: Lightbulb, color: 'amber' },
  taisui: { icon: Shield, color: 'red' },
  wenchang: { icon: BookOpen, color: 'blue' },
  caishen: { icon: Coins, color: 'yellow' },
  yinyuan: { icon: Heart, color: 'pink' },
  qifu: { icon: Baby, color: 'emerald' },
}

const colorMap = {
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  pink: 'bg-pink-50 border-pink-200 text-pink-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
}

const selectedColorMap = {
  amber: 'bg-amber-100 border-amber-500 ring-2 ring-amber-500',
  red: 'bg-red-100 border-red-500 ring-2 ring-red-500',
  blue: 'bg-blue-100 border-blue-500 ring-2 ring-blue-500',
  yellow: 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-500',
  pink: 'bg-pink-100 border-pink-500 ring-2 ring-pink-500',
  emerald: 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-500',
}

const initialFormData = {
  lightType: '',
  name: '',
  gender: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  birthHour: '',
  isLunar: true,
  address: '',
  phone: '',
  email: '',
  prayer: '',
}

function LightingPage() {
  const { addLighting, siteContent } = useData()

  const lightTypes = useMemo(() => {
    return siteContent.services.map(svc => ({
      id: svc.id,
      name: svc.name,
      price: svc.price,
      icon: iconMap[svc.id]?.icon || Lightbulb,
      color: iconMap[svc.id]?.color || 'amber',
      description: svc.description,
    }))
  }, [siteContent.services])

  const [formData, setFormData] = useState(initialFormData)
  const [members, setMembers] = useState([])
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const selectedLight = lightTypes.find(l => l.id === formData.lightType)
  const totalAmount = selectedLight ? selectedLight.price * members.length : 0

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLightSelect = (lightId) => {
    setFormData(prev => ({ ...prev, lightType: lightId }))
  }

  const addMember = () => {
    if (!formData.name || !formData.birthYear || !formData.birthMonth || !formData.birthDay) {
      alert('請填寫姓名及生辰')
      return
    }
    const newMember = {
      id: Date.now(),
      name: formData.name,
      gender: formData.gender,
      birthYear: formData.birthYear,
      birthMonth: formData.birthMonth,
      birthDay: formData.birthDay,
      birthHour: formData.birthHour,
      isLunar: formData.isLunar,
    }
    setMembers(prev => [...prev, newMember])
    setFormData(prev => ({
      ...prev,
      name: '',
      gender: '',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      birthHour: '',
    }))
  }

  const removeMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  const nextStep = () => {
    if (step === 1 && !formData.lightType) {
      alert('請選擇服務項目')
      return
    }
    if (step === 2 && members.length === 0) {
      alert('請至少新增一位點燈者')
      return
    }
    setStep(prev => prev + 1)
  }

  const prevStep = () => setStep(prev => prev - 1)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.phone) {
      alert('請填寫聯絡電話')
      return
    }
    addLighting({
      lightType: formData.lightType,
      lightName: selectedLight?.name,
      members: members,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      prayer: formData.prayer,
      totalAmount: totalAmount,
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
                <p className="text-stone-500 mb-8">感謝您的登記，我們已收到您的點燈申請</p>

                <div className="bg-stone-50 rounded-xl p-6 mb-8 text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-stone-500">服務項目</span>
                      <span className="font-medium text-stone-900">{selectedLight?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">點燈人數</span>
                      <span className="font-medium text-stone-900">{members.length} 人</span>
                    </div>
                    <div className="border-t border-stone-200 pt-3 flex justify-between">
                      <span className="text-stone-500">應繳金額</span>
                      <span className="text-xl font-bold text-red-700">NT$ {totalAmount.toLocaleString()}</span>
                    </div>
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
                      <span>確認後請至廟方服務處繳納費用</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                      <span>廟方將於燈座書寫姓名並擇吉開燈</span>
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
          <h1 className="text-3xl font-serif font-bold text-white mb-2">點燈登記</h1>
          <p className="text-stone-300">線上登記，為您與家人祈福點燈</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[
              { num: 1, label: '選擇服務' },
              { num: 2, label: '填寫資料' },
              { num: 3, label: '確認送出' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 md:gap-4">
                <div className={`flex items-center gap-2 ${step >= s.num ? 'text-red-800' : 'text-stone-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step > s.num ? 'bg-red-800 text-white' :
                    step === s.num ? 'bg-red-800 text-white' : 'bg-stone-200 text-stone-500'
                  }`}>
                    {step > s.num ? <Check size={16} /> : s.num}
                  </div>
                  <span className="hidden sm:inline font-medium">{s.label}</span>
                </div>
                {i < 2 && <ChevronRight className="text-stone-300" size={20} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">

          {/* Step 1: 選擇服務 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-6">請選擇點燈服務</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {lightTypes.map((light) => {
                  const IconComp = light.icon
                  const isSelected = formData.lightType === light.id
                  return (
                    <button
                      key={light.id}
                      type="button"
                      onClick={() => handleLightSelect(light.id)}
                      className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                        isSelected ? selectedColorMap[light.color] : `${colorMap[light.color]} hover:shadow-md`
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                          <Check size={14} className="text-red-700" />
                        </div>
                      )}
                      <IconComp size={28} className="mb-3" />
                      <h3 className="font-bold text-stone-900">{light.name}</h3>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">{light.description}</p>
                      <p className="text-sm font-bold text-red-700 mt-2">NT$ {light.price}/年</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: 填寫資料 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">填寫點燈者資料</h2>
              <p className="text-stone-500 text-sm mb-6">可新增多位點燈者，每位 NT$ {selectedLight?.price}</p>

              {/* 已新增的成員 */}
              {members.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-stone-700">已新增 {members.length} 人</h3>
                    <span className="text-sm text-red-700 font-medium">小計：NT$ {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    {members.map((member, index) => (
                      <div key={member.id} className="flex items-center gap-3 bg-white p-4 rounded-lg border border-stone-200">
                        <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-stone-900">{member.name}</p>
                          <p className="text-xs text-stone-500">
                            {member.isLunar ? '農曆' : '國曆'} {member.birthYear}年{member.birthMonth}月{member.birthDay}日
                            {member.birthHour && ` ${member.birthHour}時`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMember(member.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 新增成員表單 */}
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h3 className="font-medium text-stone-900 mb-4 flex items-center gap-2">
                  <Plus size={18} className="text-red-700" />
                  新增點燈者
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">姓名 *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="請輸入姓名"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">性別</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
                    >
                      <option value="">請選擇</option>
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-2">生辰 *</label>
                  <div className="flex gap-3 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isLunar"
                        checked={formData.isLunar === true}
                        onChange={() => setFormData(prev => ({ ...prev, isLunar: true }))}
                        className="w-4 h-4 text-red-700"
                      />
                      <span className="text-sm">農曆</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isLunar"
                        checked={formData.isLunar === false}
                        onChange={() => setFormData(prev => ({ ...prev, isLunar: false }))}
                        className="w-4 h-4 text-red-700"
                      />
                      <span className="text-sm">國曆</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <input
                        type="number"
                        name="birthYear"
                        value={formData.birthYear}
                        onChange={handleChange}
                        placeholder="年"
                        className="w-full px-3 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-center"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="birthMonth"
                        value={formData.birthMonth}
                        onChange={handleChange}
                        placeholder="月"
                        min="1"
                        max="12"
                        className="w-full px-3 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-center"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="birthDay"
                        value={formData.birthDay}
                        onChange={handleChange}
                        placeholder="日"
                        min="1"
                        max="31"
                        className="w-full px-3 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-center"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="birthHour"
                        value={formData.birthHour}
                        onChange={handleChange}
                        placeholder="時"
                        min="0"
                        max="23"
                        className="w-full px-3 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-center"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">時辰為選填</p>
                </div>

                <button
                  type="button"
                  onClick={addMember}
                  className="w-full py-2.5 border-2 border-dashed border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  + 新增此人
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 確認送出 */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-6">確認登記資料</h2>

              {/* 訂單摘要 */}
              <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
                <h3 className="font-medium text-stone-900 mb-4">登記摘要</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500">服務項目</span>
                    <span className="font-medium">{selectedLight?.name}</span>
                  </div>
                  <div className="py-2 border-b border-stone-100">
                    <div className="flex justify-between mb-2">
                      <span className="text-stone-500">點燈者 ({members.length}人)</span>
                    </div>
                    <div className="space-y-1 text-stone-600">
                      {members.map((m, i) => (
                        <div key={m.id}>{i + 1}. {m.name}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between py-2 text-lg">
                    <span className="font-medium">應繳金額</span>
                    <span className="font-bold text-red-700">NT$ {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 聯絡資料 */}
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h3 className="font-medium text-stone-900 mb-4">聯絡資料</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        <Phone size={14} className="inline mr-1" />
                        聯絡電話 *
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      <MapPin size={14} className="inline mr-1" />
                      通訊地址
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="請輸入通訊地址"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      <MessageSquare size={14} className="inline mr-1" />
                      祈願內容（選填）
                    </label>
                    <textarea
                      name="prayer"
                      value={formData.prayer}
                      onChange={handleChange}
                      placeholder="請輸入您的祈願內容"
                      rows="3"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-100 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                上一步
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 py-3 bg-red-800 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                下一步
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-3 bg-red-800 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                確認送出
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-amber-50 border-t border-amber-100 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h3 className="font-bold text-amber-800 mb-3">登記須知</h3>
            <ul className="space-y-2 text-sm text-amber-700">
              <li>• 點燈服務為期一年，每年需重新登記</li>
              <li>• 請填寫正確的農曆或國曆生辰，以利廟方進行儀式</li>
              <li>• 線上登記後，請於收到確認通知後至廟方繳納費用</li>
              <li>• 如有疑問，請來電洽詢：06-685-2428</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LightingPage
