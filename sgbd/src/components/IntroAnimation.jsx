import { useState, useEffect } from 'react'
import { SkipForward } from 'lucide-react'

const DoorStuds = () => (
  <div className="absolute inset-0 grid grid-cols-6 grid-rows-9 gap-4 p-6 md:p-12 pointer-events-none">
    {Array.from({ length: 54 }).map((_, i) => (
      <div key={i} className="flex items-center justify-center">
        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 shadow-[1px_2px_4px_rgba(0,0,0,0.6)] ring-1 ring-amber-900/30"></div>
      </div>
    ))}
  </div>
)

function IntroAnimation({ onComplete }) {
  const [text, setText] = useState('')
  const [subText, setSubText] = useState('')
  const [opacity, setOpacity] = useState(0)
  const [phase, setPhase] = useState(0)
  const [doorsOpen, setDoorsOpen] = useState(false)

  useEffect(() => {
    const sequence = [
      { t: '天官｜堯', sub: '', time: 500, p: 1 },
      { t: '天官｜堯', sub: '', time: 1500, p: 0 },
      { t: '地官｜舜', sub: '', time: 2000, p: 2 },
      { t: '地官｜舜', sub: '', time: 3000, p: 0 },
      { t: '水官｜禹', sub: '', time: 3500, p: 3 },
      { t: '水官｜禹', sub: '', time: 4500, p: 0 },
      { t: '白河三官寶殿', sub: '天地水・蓮鄉聖地', time: 5000, p: 4 },
      { t: '白河三官寶殿', sub: '天地水・蓮鄉聖地', time: 7500, p: 5 },
    ]

    const timeouts = sequence.map(step => {
      return setTimeout(() => {
        if (step.p === 0) {
          setOpacity(0)
          setPhase(0)
        } else if (step.p === 5) {
          setDoorsOpen(true)
          setTimeout(onComplete, 2500)
        } else {
          setText(step.t)
          setSubText(step.sub)
          setPhase(step.p)
          setOpacity(1)
        }
      }, step.time)
    })

    return () => timeouts.forEach(clearTimeout)
  }, [onComplete])

  const isChar = ['天官｜堯', '地官｜舜', '水官｜禹'].includes(text)
  const isTitle = phase === 4

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="relative w-full h-full pointer-events-auto bg-transparent" style={{ perspective: '1200px' }}>

        {/* 左廟門 */}
        <div
          className={`intro-door intro-door-left ${doorsOpen ? 'door-push-in-left' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute top-0 left-0 w-full h-full border-4 border-amber-500/30"></div>
          <DoorStuds />
          {/* 左鋪首 */}
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full shadow-lg border-2 border-amber-200 flex items-center justify-center relative shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[#7A1618] rounded-full opacity-80"></div>
              <div className="absolute top-1/2 w-10 h-10 md:w-14 md:h-14 border-[6px] border-amber-200 rounded-full mt-4 md:mt-6 shadow-sm"></div>
            </div>
          </div>
          <div className={`absolute inset-0 bg-black pointer-events-none transition-opacity duration-[2500ms] ease-out ${doorsOpen ? 'opacity-60' : 'opacity-0'}`}></div>
        </div>

        {/* 右廟門 */}
        <div
          className={`intro-door intro-door-right ${doorsOpen ? 'door-push-in-right' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute top-0 left-0 w-full h-full border-4 border-amber-500/30"></div>
          <DoorStuds />
          {/* 右鋪首 */}
          <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full shadow-lg border-2 border-amber-200 flex items-center justify-center relative shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[#7A1618] rounded-full opacity-80"></div>
              <div className="absolute top-1/2 w-10 h-10 md:w-14 md:h-14 border-[6px] border-amber-200 rounded-full mt-4 md:mt-6 shadow-sm"></div>
            </div>
          </div>
          <div className={`absolute inset-0 bg-black pointer-events-none transition-opacity duration-[2500ms] ease-out ${doorsOpen ? 'opacity-60' : 'opacity-0'}`}></div>
        </div>

        {/* 文字層 */}
        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center transition-all duration-[1500ms] ${doorsOpen ? 'opacity-0 scale-125' : 'opacity-100 scale-100'}`}>
          <div className={`transition-all duration-1000 transform ${opacity ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'} flex flex-col items-center`}>
            <h1 className={`${isChar ? 'font-brush text-8xl md:text-9xl text-amber-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]' : 'font-serif text-5xl md:text-7xl text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]'} font-bold transition-colors duration-500`}>
              {text}
            </h1>
            {isTitle && (
              <p className="mt-6 text-amber-100 text-lg md:text-xl font-serif tracking-[0.5em] intro-pulse drop-shadow-md">
                {subText}
              </p>
            )}
          </div>
        </div>

        {/* Skip 按鈕 */}
        <button
          onClick={() => { setDoorsOpen(true); setTimeout(onComplete, 800) }}
          className={`absolute bottom-10 right-10 z-30 text-white/70 hover:text-white transition-opacity duration-500 flex items-center gap-2 text-sm tracking-widest cursor-pointer ${doorsOpen ? 'opacity-0' : 'opacity-100'}`}
        >
          SKIP <SkipForward size={16} />
        </button>
      </div>
    </div>
  )
}

export default IntroAnimation
