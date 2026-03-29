import { Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { ArrowRight, Lightbulb, Shield, BookOpen, Coins, Heart, Baby } from 'lucide-react'

const iconMap = {
  guangming: Lightbulb,
  taisui: Shield,
  wenchang: BookOpen,
  caishen: Coins,
  yinyuan: Heart,
  qifu: Baby,
}

const colorMap = {
  guangming: { color: 'bg-amber-50 text-amber-700 border-amber-200', iconColor: 'text-amber-600' },
  taisui: { color: 'bg-red-50 text-red-700 border-red-200', iconColor: 'text-red-600' },
  wenchang: { color: 'bg-blue-50 text-blue-700 border-blue-200', iconColor: 'text-blue-600' },
  caishen: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', iconColor: 'text-yellow-600' },
  yinyuan: { color: 'bg-pink-50 text-pink-700 border-pink-200', iconColor: 'text-pink-600' },
  qifu: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconColor: 'text-emerald-600' },
}

const procedures = [
  { step: 1, title: '選擇服務', description: '依照個人需求選擇適合的點燈或安太歲服務。' },
  { step: 2, title: '填寫資料', description: '填寫信眾姓名、生辰八字（農曆）、地址等基本資料。' },
  { step: 3, title: '繳納費用', description: '至服務處繳納點燈費用，領取收據。' },
  { step: 4, title: '廟方登記', description: '廟方將於燈座上書寫姓名，並擇吉日開燈。' },
]

function ServicesPage() {
  const { siteContent } = useData()
  const services = siteContent.services
  return (
    <div className="bg-stone-50 text-stone-800">
      {/* Page Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 to-stone-900/80 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1548625361-12b704c38d39?q=80&w=2000&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">服務項目</h1>
          <p className="text-lg text-stone-200 tracking-widest">點燈祈福 · 安太歲 · 祈安植福</p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-6">點燈祈福</h2>
            <p className="text-stone-600 leading-relaxed mb-8">
              點燈是傳統宗教中重要的祈福方式，燈火象徵光明與希望。
              信眾透過點燈，祈求神明庇佑，照亮前程、消災解厄。
              本宮提供多種點燈服務，歡迎信眾依需求選擇。
            </p>
            <Link
              to="/lighting"
              className="inline-flex items-center gap-2 px-8 py-3 bg-red-800 hover:bg-red-700 text-white transition-colors duration-300 rounded shadow-lg"
            >
              線上點燈登記 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-red-800 tracking-[0.3em] text-sm uppercase block mb-4">Services</span>
            <h2 className="text-3xl font-serif font-bold mb-4">服務項目</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = iconMap[service.id] || Lightbulb
              const colors = colorMap[service.id] || colorMap.guangming
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-full ${colors.color} border flex items-center justify-center`}>
                        <IconComponent size={28} className={colors.iconColor} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-stone-900">{service.name}</h3>
                        <span className="text-sm text-amber-600 font-medium">NT$ {service.price} / {service.unit}</span>
                      </div>
                    </div>

                    <p className="text-stone-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Procedure Section */}
      <section className="py-20 bg-stone-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4">辦理流程</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {procedures.map((item, index) => (
              <div key={item.step} className="relative text-center">
                <div className="w-16 h-16 mx-auto bg-amber-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-amber-500 mb-2">{item.title}</h3>
                <p className="text-stone-400 text-sm">{item.description}</p>

                {/* Arrow */}
                {index < procedures.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 transform translate-x-1/2">
                    <ArrowRight className="text-stone-700" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notice Section */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-amber-500">
              <h3 className="text-xl font-bold text-stone-900 mb-4">服務須知</h3>
              <ul className="space-y-3 text-stone-600">
                {siteContent.serviceNotices.map((notice, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>{notice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServicesPage
