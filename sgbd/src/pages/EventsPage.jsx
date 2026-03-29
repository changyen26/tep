import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, ArrowRight, Sun, Mountain, Droplets } from 'lucide-react'

const annualEvents = [
  {
    id: 1,
    name: '上元節祈福法會',
    date: '農曆正月十五日',
    deity: '天官大帝聖誕',
    icon: Sun,
    color: 'from-indigo-900 to-purple-900',
    iconColor: 'text-amber-300',
    description: '上元節為天官賜福之日，本宮舉辦盛大祈福法會，為信眾祈求新年平安、闔家幸福。當日設有添油香、點光明燈、祈福儀式等活動。',
    activities: ['天官祝壽大典', '元宵祈福法會', '擲筊求籤', '點光明燈'],
  },
  {
    id: 2,
    name: '中元節普渡法會',
    date: '農曆七月十五日',
    deity: '地官大帝聖誕',
    icon: Mountain,
    color: 'from-emerald-900 to-stone-800',
    iconColor: 'text-emerald-300',
    description: '中元節為地官赦罪之日，本宮舉辦普渡法會，超渡亡魂、祭祀祖先。信眾可為先人點燈超渡，祈求地官赦免罪業。',
    activities: ['地官祝壽大典', '中元普渡法會', '超渡法事', '放水燈'],
  },
  {
    id: 3,
    name: '下元節消災法會',
    date: '農曆十月十五日',
    deity: '水官大帝聖誕',
    icon: Droplets,
    color: 'from-cyan-900 to-blue-900',
    iconColor: 'text-cyan-300',
    description: '下元節為水官解厄之日，本宮舉辦消災解厄法會，為信眾祈求消災解難、逢凶化吉。當日設有制煞補運等儀式。',
    activities: ['水官祝壽大典', '下元消災法會', '制煞補運', '祈安植福'],
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: '甲辰年上元祈福法會',
    date: '2024年2月24日（農曆正月十五）',
    time: '上午9:00 - 下午5:00',
    location: '三官寶殿正殿',
    description: '歡迎信眾攜家帶眷前來參拜祈福，祈求天官賜福、新年平安。',
  },
  {
    id: 2,
    title: '安太歲點燈法會',
    date: '2024年2月10日起',
    time: '每日 上午8:00 - 下午6:00',
    location: '服務處',
    description: '甲辰年犯太歲生肖：龍、狗、牛、兔。歡迎信眾登記安太歲、點光明燈。',
  },
  {
    id: 3,
    title: '春季進香團接待',
    date: '2024年3月 - 5月',
    time: '請提前預約',
    location: '三官寶殿',
    description: '歡迎各地宮廟、進香團蒞臨參拜，請提前來電預約接待事宜。',
  },
]

function EventsPage() {
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">活動資訊</h1>
          <p className="text-lg text-stone-200 tracking-widest">三元節慶典與各項活動</p>
        </div>
      </section>

      {/* Annual Events */}
      <section className="py-20 bg-stone-900 text-stone-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-amber-500 tracking-[0.5em] text-sm uppercase block mb-4">Annual Festivals</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">三元節慶典</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-6"></div>
            <p className="text-stone-400 max-w-2xl mx-auto">
              三元節為道教重要節日，分別為上元節（正月十五）、中元節（七月十五）、下元節（十月十五），
              是三官大帝聖誕之日，本宮每年皆舉辦盛大祭典。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {annualEvents.map((event) => {
              const IconComponent = event.icon
              return (
                <div
                  key={event.id}
                  className="bg-stone-800 rounded-xl overflow-hidden border border-stone-700 hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className={`h-32 bg-gradient-to-br ${event.color} flex items-center justify-center`}>
                    <IconComponent size={48} className={event.iconColor} />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-bold text-amber-500 mb-2">{event.name}</h3>
                    <p className="text-stone-400 text-sm mb-2">{event.date}</p>
                    <p className="text-amber-600 text-xs mb-4">{event.deity}</p>
                    <p className="text-stone-300 text-sm leading-relaxed mb-4">{event.description}</p>
                    <div className="border-t border-stone-700 pt-4">
                      <h4 className="text-sm font-medium text-stone-400 mb-2">主要活動</h4>
                      <ul className="space-y-1">
                        {event.activities.map((activity, index) => (
                          <li key={index} className="text-sm text-stone-500 flex items-center gap-2">
                            <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4">近期活動</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-stone-50 rounded-xl p-6 md:p-8 hover:shadow-lg transition-shadow border border-stone-100"
              >
                <h3 className="text-xl font-bold text-stone-900 mb-4">{event.title}</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-3 text-stone-600">
                    <Calendar size={18} className="text-amber-600" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-600">
                    <Clock size={18} className="text-amber-600" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-600">
                    <MapPin size={18} className="text-amber-600" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>
                <p className="text-stone-500">{event.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/registration"
              className="inline-flex items-center gap-2 px-8 py-3 bg-red-800 hover:bg-red-700 text-white transition-colors duration-300 rounded shadow-lg"
            >
              線上報名參加 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Notice */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-amber-500">
              <h3 className="text-xl font-bold text-stone-900 mb-4">參與注意事項</h3>
              <ul className="space-y-3 text-stone-600">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>法會期間請著整潔服裝，以示對神明之敬意。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>進入殿內請保持肅靜，勿大聲喧嘩。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>拍照攝影請勿使用閃光燈，避免干擾其他信眾。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>停車位有限，建議共乘或搭乘大眾運輸工具。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>如有任何疑問，歡迎來電洽詢。</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default EventsPage
