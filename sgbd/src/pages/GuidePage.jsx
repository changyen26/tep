import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Info, Map as MapIcon, RotateCcw } from 'lucide-react'

// --- 參拜路線資料 ---
const STEPS = [
  {
    id: 1,
    title: "天公爐",
    subtitle: "參拜首站",
    description: "取 3 柱香，面向天公爐參拜，祈求上蒼保佑。",
    deities: ["玉皇上帝 (天公)"],
    incense: 3,
    position: { x: 35, y: 60 },
  },
  {
    id: 2,
    title: "正殿",
    subtitle: "三官大帝",
    description: "面向中央主爐參拜，誠心祈求三官大帝賜福赦罪。",
    deities: ["三官大帝", "玄天上帝", "天上聖母", "中壇元帥"],
    incense: 3,
    position: { x: 35, y: 40 },
  },
  {
    id: 3,
    title: "龍邊神龕",
    subtitle: "觀音佛祖",
    description: "參拜右側（龍邊）神龕，祈求平安智慧。",
    deities: ["觀音佛祖", "神農聖帝", "華陀仙師"],
    incense: 1,
    position: { x: 55, y: 35 },
  },
  {
    id: 4,
    title: "虎邊神龕",
    subtitle: "太祖仙師",
    description: "參拜左側（虎邊）神龕。",
    deities: ["太祖仙師", "白鶴仙師", "五顯大帝"],
    incense: 1,
    position: { x: 15, y: 35 },
  },
  {
    id: 5,
    title: "五斗殿",
    subtitle: "斗姥星君",
    description: "前往右側廂房五斗殿，參拜五斗星君與太歲星君。",
    deities: ["斗姥星君", "魁斗星君", "太歲星君"],
    incense: 1,
    position: { x: 82, y: 45 },
  },
  {
    id: 6,
    title: "福德正神",
    subtitle: "財神與虎爺",
    description: "前往金爐旁，參拜土地公求財運。",
    deities: ["福德正神", "虎爺將軍"],
    incense: 1,
    position: { x: 50, y: 55 },
  },
  {
    id: 7,
    title: "五營將軍",
    subtitle: "護法將軍",
    description: "最後參拜五營兵將，感謝護持。",
    deities: ["五營將軍"],
    incense: 1,
    position: { x: 82, y: 55 },
  }
]

// --- 地圖元件 ---
const TempleMap = ({ currentStep, onNodeClick }) => {
  const currentStepData = STEPS.find(s => s.id === currentStep)
  const scale = 1.0  // 不放大，保持原始大小

  // 將當前節點移到畫面上方 1/4 處（y=25%），避免被底部卡片遮住
  const targetX = -(currentStepData.position.x - 50)
  const targetY = -(currentStepData.position.y - 25)  // 目標放在畫面 25% 高度處

  const generatePath = () => {
    let path = `M ${STEPS[0].position.x} ${STEPS[0].position.y}`
    for (let i = 1; i < STEPS.length; i++) {
      const prev = STEPS[i-1].position
      const curr = STEPS[i].position
      path += ` Q ${(prev.x + curr.x)/2} ${(prev.y + curr.y)/2} ${curr.x} ${curr.y}`
    }
    return path
  }

  return (
    <div className="relative w-full h-full bg-[#1a1c23] overflow-hidden touch-none">
      {/* 背景紋理 */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-800 via-slate-900 to-black pointer-events-none" />
      <div className="absolute inset-0 opacity-5 pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* 地圖容器 */}
      <motion.div
        className="w-full h-full will-change-transform"
        style={{ transformOrigin: 'center center' }}
        animate={{
          x: `${targetX}%`,
          y: `${targetY}%`
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
          mass: 1
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">

            {/* 建築背景 */}
            <g opacity="0.5" fill="#334155" stroke="#475569" strokeWidth="0.5">
                {/* 正殿區域 - 包含步驟 1-4, 6 */}
                <path d="M 5 25 L 65 25 L 65 65 L 5 65 Z" />
                <text x="35" y="22" textAnchor="middle" fill="#64748b" fontSize="3" fontWeight="bold">正殿區域</text>
                {/* 五斗殿 + 五營區域 - 包含步驟 5, 7 */}
                <path d="M 70 35 L 95 35 L 95 65 L 70 65 Z" />
                <text x="82.5" y="32" textAnchor="middle" fill="#64748b" fontSize="2.5" fontWeight="bold">五斗殿</text>
            </g>

            {/* 路徑 */}
            <path d={generatePath()} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />

            {STEPS.map((step, index) => {
                if (index === 0) return null
                const prev = STEPS[index-1]
                const isActivePath = index < currentStep

                return (
                    <motion.path
                        key={`path-${index}`}
                        d={`M ${prev.position.x} ${prev.position.y} Q ${(prev.position.x + step.position.x)/2} ${(prev.position.y + step.position.y)/2} ${step.position.x} ${step.position.y}`}
                        fill="none"
                        stroke={isActivePath ? "#fbbf24" : "transparent"}
                        strokeWidth="1.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: isActivePath ? 1 : 0 }}
                        transition={{ duration: 0.8, ease: "linear" }}
                    />
                )
            })}

            {/* 節點 */}
            {STEPS.map((step) => {
                const isActive = step.id === currentStep
                const isPassed = step.id < currentStep

                return (
                    <motion.g
                        key={step.id}
                        onClick={() => onNodeClick(step.id)}
                        className="cursor-pointer"
                        initial={false}
                        animate={{ scale: isActive ? 1.2 : 1 }}
                    >
                        {isActive && (
                            <g>
                                <circle cx={step.position.x} cy={step.position.y} r="10" fill="#fbbf24" opacity="0.15">
                                    <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
                                </circle>
                                <circle cx={step.position.x} cy={step.position.y} r="4" fill="#fbbf24" opacity="0.5" filter="blur(4px)" />
                            </g>
                        )}

                        <circle
                            cx={step.position.x}
                            cy={step.position.y}
                            r="3.5"
                            fill={isActive || isPassed ? "#fbbf24" : "#1e293b"}
                            stroke={isActive ? "#fff" : "#64748b"}
                            strokeWidth={isActive ? "0.8" : "0.5"}
                        />

                        <text
                            x={step.position.x}
                            y={step.position.y}
                            dy="0.35em"
                            textAnchor="middle"
                            fontSize="2.2"
                            fill={isActive || isPassed ? "#000" : "#94a3b8"}
                            fontWeight="800"
                            style={{ pointerEvents: 'none', fontFamily: 'serif' }}
                        >
                            {step.id}
                        </text>

                        <text
                            x={step.position.x}
                            y={step.position.y + 7}
                            textAnchor="middle"
                            fontSize="2.5"
                            fill={isActive ? "#fbbf24" : "#64748b"}
                            fontWeight="bold"
                            style={{
                                textShadow: '0px 2px 4px rgba(0,0,0,0.9)',
                                pointerEvents: 'none',
                                opacity: isActive || isPassed ? 1 : 0.7
                            }}
                        >
                            {step.title}
                        </text>
                    </motion.g>
                )
            })}
        </svg>
      </motion.div>

      {/* 指南針 */}
      <div className="absolute top-4 right-4 p-2 bg-slate-800/80 backdrop-blur-md rounded-full border border-slate-600 shadow-lg z-10">
         <div className="w-10 h-10 relative flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-slate-500 rounded-full opacity-50"></div>
            <div className="w-1.5 h-4 bg-red-600 absolute top-1.5 rounded-t-full shadow-sm"></div>
            <div className="w-1.5 h-4 bg-white absolute bottom-1.5 rounded-b-full shadow-sm"></div>
            <span className="absolute -top-3 text-[10px] text-slate-400 font-bold tracking-wider">N</span>
         </div>
      </div>
    </div>
  )
}

// --- 步驟卡片 ---
const StepCard = ({ step, onNext, onPrev, isLast, isFirst }) => {
  const [showDeities, setShowDeities] = useState(false)

  useEffect(() => {
    setShowDeities(false)
  }, [step])

  return (
    <motion.div
      key={step.id}
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      exit={{ y: "110%" }}
      transition={{ type: "spring", damping: 20, stiffness: 150 }}
      className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-lg w-full bg-[#0f172a]/95 backdrop-blur-xl border-t border-x border-yellow-600/30 rounded-t-2xl shadow-[0_-10px_60px_-15px_rgba(0,0,0,0.8)]">

        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />

        <div className="p-5 pb-8 relative">
            <div className="flex items-start space-x-4 mb-3">
                <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full border-2 border-yellow-500 bg-gradient-to-br from-slate-800 to-slate-900 text-yellow-400 font-bold text-3xl font-serif shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                    {step.id}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-serif text-white tracking-wide truncate">{step.title}</h2>
                        <button
                            onClick={() => setShowDeities(!showDeities)}
                            className="ml-2 p-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-yellow-400 transition-colors"
                        >
                            <Info size={18} />
                        </button>
                    </div>
                    <p className="text-yellow-600 text-xs tracking-widest uppercase font-semibold">{step.subtitle}</p>
                </div>
            </div>

            <AnimatePresence>
               {showDeities && (
                   <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="overflow-hidden mb-3"
                   >
                       <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/50">
                           <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider">此處供奉</p>
                           <div className="flex flex-wrap gap-2">
                               {step.deities.map((god, idx) => (
                                   <span key={idx} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-yellow-100/90 shadow-sm">
                                       {god}
                                   </span>
                               ))}
                           </div>
                       </div>
                   </motion.div>
               )}
            </AnimatePresence>

            <div className="mb-6 space-y-3">
                <p className="text-slate-200 text-base leading-relaxed font-light">
                   {step.description}
                </p>
                <div className="inline-flex items-center space-x-2">
                    <div className="px-2 py-0.5 bg-yellow-900/30 border border-yellow-700/50 rounded text-[10px] text-yellow-500 font-bold tracking-wider">
                        建議
                    </div>
                    <span className="text-sm text-yellow-100/80 font-serif">手持 <span className="text-yellow-400 font-bold text-lg mx-1">{step.incense}</span> 柱香</span>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
                <button
                    onClick={onPrev}
                    disabled={isFirst}
                    className={`col-span-1 h-12 flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 transition-all active:scale-95 ${isFirst ? 'opacity-30 cursor-not-allowed text-slate-500' : 'text-slate-300 hover:bg-slate-800 hover:border-slate-600'}`}
                >
                    <ChevronLeft size={24} />
                </button>

                <button
                    onClick={onNext}
                    className="col-span-4 h-12 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 text-white rounded-lg font-bold text-lg shadow-lg shadow-yellow-900/20 active:scale-[0.98] transition-all flex items-center justify-center group"
                >
                    <span className="tracking-wide">{isLast ? "圓滿結束" : "下一步"}</span>
                    {!isLast && <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                </button>
            </div>
        </div>
      </div>
    </motion.div>
  )
}

// --- 覆蓋畫面 ---
const OverlayScreen = ({ title, sub, buttonText, onAction, type = "start" }) => (
    <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20"></div>
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative max-w-xs w-full"
        >
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-slate-900 border-2 border-yellow-600/50 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.15)] relative">
                <div className="absolute inset-2 border border-yellow-600/20 rounded-full"></div>
                {type === "start" ? <MapIcon className="w-10 h-10 text-yellow-500" /> : <RotateCcw className="w-10 h-10 text-yellow-500" />}
            </div>

            <h1 className="text-4xl font-serif text-white mb-3 tracking-widest">{title}</h1>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-yellow-700 to-transparent mx-auto mb-3"></div>
            <p className="text-slate-400 mb-10 text-sm tracking-wider font-light">{sub}</p>

            <button
                onClick={onAction}
                className="w-full py-4 bg-gradient-to-b from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-yellow-900/30 transition-all active:scale-[0.98] border-t border-yellow-400/20"
            >
                {buttonText}
            </button>
        </motion.div>
    </div>
)

// --- 主元件 ---
function GuidePage() {
  const [currentStepId, setCurrentStepId] = useState(1)
  const [appState, setAppState] = useState('welcome')

  const currentStepData = STEPS.find(s => s.id === currentStepId)

  const handleNext = () => {
    if (currentStepId < STEPS.length) {
      setCurrentStepId(p => p + 1)
    } else {
      setAppState('finished')
    }
  }

  const handlePrev = () => {
    if (currentStepId > 1) {
      setCurrentStepId(p => p - 1)
    }
  }

  const handleNodeClick = (id) => {
    setCurrentStepId(id)
  }

  const restart = () => {
    setCurrentStepId(1)
    setAppState('guiding')
  }

  return (
    <div className="w-full h-[100dvh] bg-black overflow-hidden flex flex-col font-sans select-none relative">
      {/* 頂部標題 */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 pointer-events-none flex justify-center">
        <div className="bg-slate-950/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 shadow-lg">
            <h1 className="text-white/90 font-serif text-sm tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                參拜動線引導
            </h1>
        </div>
      </div>

      {/* 地圖區域 */}
      <div className="relative flex-1 w-full h-full">
        <TempleMap
            currentStep={currentStepId}
            onNodeClick={handleNodeClick}
        />

        <AnimatePresence mode='wait'>
            {appState === 'guiding' && (
                <StepCard
                    step={currentStepData}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    isFirst={currentStepId === 1}
                    isLast={currentStepId === STEPS.length}
                />
            )}
        </AnimatePresence>
      </div>

      {/* 歡迎畫面 */}
      {appState === 'welcome' && (
          <OverlayScreen
            title="參拜引導"
            sub="跟隨光引，誠心祈福"
            buttonText="開始參拜"
            onAction={() => setAppState('guiding')}
            type="start"
          />
      )}

      {/* 完成畫面 */}
      {appState === 'finished' && (
          <OverlayScreen
            title="參拜圓滿"
            sub="祝您 闔家平安 萬事如意"
            buttonText="重新導覽"
            onAction={restart}
            type="end"
          />
      )}
    </div>
  )
}

export default GuidePage
