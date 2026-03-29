import { useState, useMemo } from 'react'
import { useData } from '../../contexts/DataContext'
import { Solar } from 'lunar-typescript'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const deityBirthdays = [
  { month: 1, day: 1, name: '元始天尊聖誕' },
  { month: 1, day: 9, name: '玉皇大帝聖誕' },
  { month: 1, day: 15, name: '天官大帝聖誕（上元節）', highlight: true },
  { month: 2, day: 2, name: '福德正神聖誕' },
  { month: 2, day: 19, name: '觀世音菩薩聖誕' },
  { month: 3, day: 3, name: '玄天上帝聖誕' },
  { month: 3, day: 15, name: '保生大帝聖誕' },
  { month: 3, day: 23, name: '天上聖母聖誕' },
  { month: 4, day: 8, name: '釋迦牟尼佛聖誕' },
  { month: 4, day: 26, name: '神農大帝聖誕' },
  { month: 5, day: 13, name: '關聖帝君聖誕' },
  { month: 6, day: 24, name: '關聖帝君飛升' },
  { month: 7, day: 15, name: '地官大帝聖誕（中元節）', highlight: true },
  { month: 7, day: 18, name: '瑤池金母聖誕' },
  { month: 8, day: 15, name: '太陰星君聖誕' },
  { month: 9, day: 9, name: '斗姆元君聖誕' },
  { month: 9, day: 19, name: '觀世音菩薩出家日' },
  { month: 10, day: 15, name: '水官大帝聖誕（下元節）', highlight: true },
  { month: 11, day: 19, name: '太陽星君聖誕' },
  { month: 12, day: 16, name: '福德正神千秋' },
]

const getDailyFortune = (date) => {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  const good = [['祭祀', '祈福', '求嗣', '開光'], ['出行', '嫁娶', '安床', '移徙'], ['動土', '豎柱', '上樑', '開市'], ['納財', '交易', '立券', '入宅'], ['祭祀', '安門', '修造', '安葬']]
  const bad = [['動土', '破土', '安葬', '開市'], ['祭祀', '入殮', '嫁娶', '作灶'], ['嫁娶', '安葬', '出行', '入宅'], ['破土', '行喪', '安葬', '開倉'], ['動土', '栽種', '針灸', '掘井']]
  const idx = dayOfYear % 5
  return { good: good[idx], bad: bad[idx] }
}

const getLunarDate = (date) => {
  try {
    const solar = Solar.fromDate(date)
    const lunar = solar.getLunar()
    return { month: lunar.getMonth(), day: lunar.getDay(), monthName: lunar.getMonthInChinese() + '月', dayName: lunar.getDayInChinese() }
  } catch {
    return { month: 1, day: 1, monthName: '正月', dayName: '初一' }
  }
}

function CalendarPage() {
  const { events, pilgrimages } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()
  const fortune = getDailyFortune(today)
  const lunarToday = getLunarDate(today)

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      const dateStr = date.toISOString().slice(0, 10)
      const lunar = getLunarDate(date)
      const hasEvent = events.some(e => e.date === dateStr && e.isActive)
      const hasPilgrimage = pilgrimages.some(p => p.visitDate === dateStr)
      const birthday = deityBirthdays.find(b => b.month === lunar.month && b.day === lunar.day)
      days.push({ date: i, fullDate: date, dateStr, lunar, hasEvent, hasPilgrimage, birthday, isToday: date.toDateString() === today.toDateString() })
    }
    return days
  }, [currentDate, events, pilgrimages])

  const upcomingBirthdays = useMemo(() => {
    const results = []
    for (let i = 0; i < 90 && results.length < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
      const lunar = getLunarDate(date)
      const birthday = deityBirthdays.find(b => b.month === lunar.month && b.day === lunar.day)
      if (birthday) {
        results.push({ ...birthday, solarDate: `${date.getMonth() + 1}/${date.getDate()}` })
      }
    }
    return results
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-temple-gold mb-6">農民曆 / 行事曆</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today */}
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-1">今日</h2>
          <p className="text-sm text-gray-400 mb-1">{today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日</p>
          <p className="text-sm text-temple-gold mb-4">農曆 {lunarToday.monthName}{lunarToday.dayName}</p>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-green-400 mb-2">宜</h3>
              <div className="flex flex-wrap gap-1.5">
                {fortune.good.map((item, i) => (
                  <span key={i} className="px-2.5 py-1 bg-green-900/30 text-green-400 rounded text-xs">{item}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-400 mb-2">忌</h3>
              <div className="flex flex-wrap gap-1.5">
                {fortune.bad.map((item, i) => (
                  <span key={i} className="px-2.5 py-1 bg-red-900/30 text-red-400 rounded text-xs">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">近期神明聖誕</h2>
          <div className="space-y-2">
            {upcomingBirthdays.map((b, i) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${b.highlight ? 'bg-temple-gold/10 border border-temple-gold/20' : 'bg-admin-dark'}`}>
                <span className="text-xs text-gray-500 w-16">農{b.month}/{b.day}</span>
                <span className={`flex-1 text-sm ${b.highlight ? 'text-temple-gold font-medium' : 'text-gray-300'}`}>{b.name}</span>
                <span className="text-xs text-gray-600">國{b.solarDate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Three Festivals */}
        <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">三元節</h2>
          <div className="space-y-3">
            {[
              { char: '天', name: '上元節', date: '正月十五日', deity: '天官大帝聖誕', desc: '天官賜福', color: 'text-amber-400 bg-amber-900/30' },
              { char: '地', name: '中元節', date: '七月十五日', deity: '地官大帝聖誕', desc: '地官赦罪', color: 'text-emerald-400 bg-emerald-900/30' },
              { char: '水', name: '下元節', date: '十月十五日', deity: '水官大帝聖誕', desc: '水官解厄', color: 'text-cyan-400 bg-cyan-900/30' },
            ].map(f => (
              <div key={f.char} className="flex items-center gap-3 bg-admin-dark rounded-lg p-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${f.color}`}>{f.char}</div>
                <div>
                  <h3 className="text-sm font-medium text-white">{f.name}</h3>
                  <p className="text-xs text-gray-500">{f.date} · {f.deity}</p>
                  <span className="text-xs text-gray-600">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="mt-6 bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="p-2 text-gray-400 hover:text-temple-gold rounded-lg hover:bg-admin-dark"><ChevronLeft size={20} /></button>
          <h2 className="text-lg font-semibold text-white">{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="p-2 text-gray-400 hover:text-temple-gold rounded-lg hover:bg-admin-dark"><ChevronRight size={20} /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="text-center text-xs text-gray-500 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => (
            <div key={idx}
              className={`min-h-[70px] p-1.5 rounded-lg text-center transition-colors ${
                !day ? '' :
                day.isToday ? 'bg-temple-gold/20 border border-temple-gold/50' :
                'bg-admin-dark hover:bg-admin-dark-lighter'
              }`}>
              {day && (
                <>
                  <div className={`text-sm font-medium ${day.isToday ? 'text-temple-gold' : 'text-gray-300'}`}>{day.date}</div>
                  <div className="text-[10px] text-gray-600">{day.lunar.dayName}</div>
                  {day.hasEvent && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mx-auto mt-0.5" />}
                  {day.hasPilgrimage && <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mx-auto mt-0.5" />}
                  {day.birthday && <div className="text-[9px] text-temple-gold truncate mt-0.5">{day.birthday.name.slice(0, 4)}</div>}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full" /> 活動</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-400 rounded-full" /> 進香</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-temple-gold rounded-full" /> 神明聖誕</span>
        </div>
      </div>
    </div>
  )
}

export default CalendarPage
