import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { MapPin, Phone, Clock, Mail, Car, Train, ArrowRight, CheckCircle } from 'lucide-react'

function ContactPage() {
  const { addContactMessage, siteContent } = useData()
  const { basicInfo, transportGuide } = siteContent
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    addContactMessage({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    })
    setSubmitted(true)
    setFormData({
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
    })
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div className="bg-stone-50 text-stone-800">
      {/* Page Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 to-stone-900/80 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1599827051921-12792671e353?q=80&w=2000&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">聯絡我們</h1>
          <p className="text-lg text-stone-200 tracking-widest">歡迎來訪 · 虔誠參拜</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-stone-50 p-6 rounded-xl text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="text-red-700" size={24} />
              </div>
              <h3 className="font-bold text-stone-900 mb-2">廟宇地址</h3>
              <p className="text-sm text-stone-500">{basicInfo.address}</p>
            </div>

            <div className="bg-stone-50 p-6 rounded-xl text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Phone className="text-amber-700" size={24} />
              </div>
              <h3 className="font-bold text-stone-900 mb-2">聯絡電話</h3>
              <p className="text-sm text-stone-500">{basicInfo.phone}</p>
            </div>

            <div className="bg-stone-50 p-6 rounded-xl text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-emerald-700" size={24} />
              </div>
              <h3 className="font-bold text-stone-900 mb-2">開放時間</h3>
              <p className="text-sm text-stone-500">{basicInfo.openingHours}</p>
            </div>

            <div className="bg-stone-50 p-6 rounded-xl text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="text-blue-700" size={24} />
              </div>
              <h3 className="font-bold text-stone-900 mb-2">電子信箱</h3>
              <p className="text-sm text-stone-500">{basicInfo.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map & Form Section */}
      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Map & Transport */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">交通指南</h2>

              {/* Google Map Embed */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3663.5!2d120.4!3d23.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDE4JzAwLjAiTiAxMjDCsDI0JzAwLjAiRQ!5e0!3m2!1szh-TW!2stw!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Map"
                ></iframe>
              </div>

              {/* Transport Info */}
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Car className="text-amber-600" size={24} />
                    <h3 className="font-bold text-stone-900">自行開車</h3>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {transportGuide.driving}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Train className="text-emerald-600" size={24} />
                    <h3 className="font-bold text-stone-900">大眾運輸</h3>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {transportGuide.publicTransport}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">線上留言</h2>

              <form className="bg-white p-8 rounded-xl shadow-sm" onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="請輸入您的姓名"
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2">
                      電話
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="請輸入聯絡電話"
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                      電子信箱
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="請輸入電子信箱"
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-2">
                    主旨 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors bg-white"
                  >
                    <option value="">請選擇主旨</option>
                    <option value="general">一般詢問</option>
                    <option value="service">服務諮詢</option>
                    <option value="pilgrimage">進香登記</option>
                    <option value="event">活動詢問</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">
                    留言內容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="請輸入您的留言內容"
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                {submitted && (
                  <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                    <p className="text-emerald-700 text-sm">感謝您的來信，我們將盡快回覆！</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-red-800 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  送出留言
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Pilgrimage CTA */}
      <section className="py-16 bg-gradient-to-r from-stone-800 to-stone-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold mb-4">進香團登記</h2>
            <p className="text-stone-300 leading-relaxed mb-8">
              歡迎各地宮廟、進香團蒞臨本宮參拜。為提供最完善的接待服務，
              請於來訪前三日來電或填寫表單預約，告知團體名稱、人數、預計到達時間。
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-amber-400">
                <Phone size={18} />
                <span>預約專線：{basicInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <Clock size={18} />
                <span>服務時間：08:00 - 18:00</span>
              </div>
            </div>

            <Link
              to="/pilgrimage"
              className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white transition-colors duration-300 rounded"
            >
              線上預約登記 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage
