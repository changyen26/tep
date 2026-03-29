import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Sun, Mountain, Droplets, ArrowRight, Feather, MapPin } from 'lucide-react'
import IntroAnimation from '../components/IntroAnimation'

function HomePage() {
  const [showIntro, setShowIntro] = useState(true)

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
  }, [])

  return (
    <div className="font-sans text-stone-800 bg-stone-50 selection:bg-red-900 selection:text-white">
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      {/* Hero Section */}
      <header className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-stone-800/20 to-stone-900/60 z-10"></div>

        {/* Background Image */}
        <div className="absolute inset-0 bg-stone-900 z-0">
          <div
            className="absolute inset-0 opacity-50 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1599827051921-12792671e353?q=80&w=2000&auto=format&fit=crop')`
            }}
          ></div>
        </div>

        <div className="relative z-20 text-center text-white px-4 mt-16">
          <div className="mb-6 inline-block">
            <span className="px-3 py-1 border border-amber-400/50 text-amber-400 text-sm tracking-[0.3em] uppercase rounded-sm backdrop-blur-sm">
              Tainan Baihe
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 tracking-tight drop-shadow-lg">
            天地水<span className="text-amber-500">.</span>三官
          </h1>
          <p className="text-lg md:text-xl font-light tracking-[0.2em] max-w-2xl mx-auto text-stone-200 mb-10 leading-relaxed">
            上元賜福 · 中元赦罪 · 下元解厄<br/>
            守護白河蓮鄉的百年信仰
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link
              to="/services"
              className="px-8 py-3 bg-red-800 hover:bg-red-700 text-white transition-colors duration-300 rounded shadow-lg shadow-red-900/20 flex items-center gap-2"
            >
              參拜指南 <ArrowRight size={16} />
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 bg-transparent border border-white/30 hover:bg-white/10 text-white transition-colors duration-300 rounded backdrop-blur-sm"
            >
              廟宇歷史
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce text-white/50">
          <ChevronDown size={32} />
        </div>
      </header>

      {/* About Section */}
      <section className="py-24 bg-stone-50 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#8B0000" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.9,32.2C59.6,42.9,48.3,51.4,36.4,56.7C24.5,62,12.1,64.1,-1.3,66.4C-14.7,68.7,-29.6,71.2,-41.7,65.8C-53.8,60.4,-63.1,47.1,-69.5,33.3C-75.9,19.5,-79.4,5.2,-78.2,-8.7C-77,-22.6,-71.1,-36.1,-61.2,-46.8C-51.3,-57.5,-37.4,-65.4,-23.6,-73C-9.8,-80.6,3.9,-87.9,17.2,-86.3C30.5,-84.7,43.3,-74.2,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[1px] w-12 bg-red-800"></div>
                <span className="text-red-800 font-medium tracking-widest text-sm">歷史沿革</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
                承襲百年香火<br/>
                <span className="text-stone-400">佑護一方淨土</span>
              </h2>
              <p className="text-stone-600 leading-8 text-justify">
                白河三官寶殿，肇建於清朝年間，見證了白河（舊稱店仔口）的開墾與繁榮。
                廟宇建築融合了閩南傳統工藝與現代結構美學，屋脊剪黏栩栩如生，石雕木刻皆訴說著先民的故事。
                座落於蓮田環繞之地，四季流轉間，香煙與荷香交織，不僅是信仰中心，更是心靈沉澱的殿堂。
              </p>
              <div className="pt-4">
                <Link to="/about" className="inline-flex items-center text-red-800 font-medium hover:gap-4 gap-2 transition-all">
                  閱讀完整廟誌 <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4 relative">
              <div className="aspect-[3/4] bg-stone-200 rounded-lg overflow-hidden transform translate-y-8 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1599827051921-12792671e353?q=80&w=800&auto=format&fit=crop"
                  alt="廟宇建築"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="aspect-[3/4] bg-stone-300 rounded-lg overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1548625361-12b704c38d39?q=80&w=800&auto=format&fit=crop"
                  alt="燈籠"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Decorative Circle */}
              <div className="absolute -bottom-10 -left-10 w-32 h-32 border-2 border-amber-500/30 rounded-full z-[-1]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Officials Section */}
      <section className="py-24 bg-stone-900 text-stone-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-amber-500 tracking-[0.5em] text-sm uppercase block mb-4">Main Deities</span>
            <h2 className="text-4xl font-serif font-bold mb-6">三官大帝</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 天官 */}
            <div className="group relative bg-stone-800 rounded-xl overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-2xl border border-stone-700">
              <div className="h-48 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
                <Sun size={64} className="text-amber-300 opacity-80" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-serif font-bold mb-2 text-amber-500">上元天官大帝</h3>
                <p className="text-stone-400 text-sm mb-4 tracking-widest">正月十五日聖誕</p>
                <p className="text-stone-300 leading-relaxed mb-6">
                  主宰天界，統御萬靈。天官賜福，祈求國泰民安，運勢亨通。適合祈求事業順利、學業進步。
                </p>
                <span className="inline-block px-3 py-1 bg-indigo-900/50 text-indigo-300 text-xs rounded border border-indigo-700">賜福</span>
              </div>
            </div>

            {/* 地官 */}
            <div className="group relative bg-stone-800 rounded-xl overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-2xl border border-stone-700">
              <div className="h-48 bg-gradient-to-br from-emerald-900 to-stone-800 flex items-center justify-center relative overflow-hidden">
                <Mountain size={64} className="text-emerald-300 opacity-80" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-serif font-bold mb-2 text-emerald-500">中元地官大帝</h3>
                <p className="text-stone-400 text-sm mb-4 tracking-widest">七月十五日聖誕</p>
                <p className="text-stone-300 leading-relaxed mb-6">
                  主宰地府，考校功過。地官赦罪，普度眾生，消災解業。適合祈求身體健康、元辰光彩。
                </p>
                <span className="inline-block px-3 py-1 bg-emerald-900/50 text-emerald-300 text-xs rounded border border-emerald-700">赦罪</span>
              </div>
            </div>

            {/* 水官 */}
            <div className="group relative bg-stone-800 rounded-xl overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-2xl border border-stone-700">
              <div className="h-48 bg-gradient-to-br from-cyan-900 to-blue-900 flex items-center justify-center relative overflow-hidden">
                <Droplets size={64} className="text-cyan-300 opacity-80" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-serif font-bold mb-2 text-cyan-500">下元水官大帝</h3>
                <p className="text-stone-400 text-sm mb-4 tracking-widest">十月十五日聖誕</p>
                <p className="text-stone-300 leading-relaxed mb-6">
                  主宰水域，解除厄運。水官解厄，化解冤結，諸事順遂。適合祈求財運、消災去難。
                </p>
                <span className="inline-block px-3 py-1 bg-cyan-900/50 text-cyan-300 text-xs rounded border border-cyan-700">解厄</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Baihe Culture Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>

              <img
                src="https://images.unsplash.com/photo-1512783088320-96f7e4f9b20b?q=80&w=1000&auto=format&fit=crop"
                alt="白河蓮花"
                className="rounded-lg shadow-2xl relative z-10 w-full object-cover h-[500px]"
              />

              <div className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur p-4 rounded shadow-lg border-l-4 border-pink-500">
                <p className="font-serif font-bold text-lg text-pink-900">蓮花季・仲夏之約</p>
                <p className="text-sm text-pink-700">每年 6月 - 8月</p>
              </div>
            </div>

            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-4xl font-serif font-bold text-stone-900">
                蓮鄉佛國，<span className="text-pink-700">清淨自在</span>
              </h2>
              <p className="text-stone-600 text-lg leading-relaxed">
                白河素有「蓮鄉」美譽。三官寶殿與周邊的自然生態共生共榮。
                每逢盛夏，殿前蓮田盛開，清風徐來，荷香撲鼻。
                來到這裡，不只是向神明祈福，更是一趟洗滌心靈的旅程。
              </p>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="border border-stone-200 p-6 rounded hover:bg-stone-50 transition-colors">
                  <Feather className="text-pink-600 mb-3" size={24} />
                  <h4 className="font-bold text-stone-900 mb-1">賞蓮步道</h4>
                  <p className="text-sm text-stone-500">廟旁即是百頃蓮田，設有休憩步道。</p>
                </div>
                <div className="border border-stone-200 p-6 rounded hover:bg-stone-50 transition-colors">
                  <MapPin className="text-green-600 mb-3" size={24} />
                  <h4 className="font-bold text-stone-900 mb-1">周邊景點</h4>
                  <p className="text-sm text-stone-500">鄰近關子嶺溫泉、水火同源。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-stone-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4">濟世服務</h2>
            <p className="text-stone-500 max-w-xl mx-auto">
              秉持三官大帝慈悲為懷精神，提供各項宗教服務，為信眾指點迷津。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: '點燈祈福', desc: '光明燈、太歲燈、財利燈', color: 'bg-red-50 text-red-700' },
              { title: '補運制解', desc: '每月初一、十五誦經祈福', color: 'bg-amber-50 text-amber-700' },
              { title: '收驚安神', desc: '每日上午 9:00 - 11:00', color: 'bg-blue-50 text-blue-700' },
              { title: '問事解籤', desc: '誠心祈求，靈籤指引', color: 'bg-stone-200 text-stone-700' },
            ].map((service, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${service.color}`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                </div>
                <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                <p className="text-sm text-stone-500">{service.desc}</p>
                <Link to="/services" className="mt-6 text-sm font-medium text-stone-400 hover:text-stone-900 transition-colors">
                  了解詳情 &rarr;
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/lighting"
              className="inline-flex items-center gap-2 px-8 py-3 bg-red-800 hover:bg-red-700 text-white transition-colors duration-300 rounded shadow-lg"
            >
              線上點燈登記 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-stone-800 to-stone-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">進香登記</h2>
          <p className="text-stone-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            歡迎各地宮廟、進香團蒞臨參拜。本宮提供完善的接待服務，
            請提前預約登記，讓我們為您安排最佳的進香行程。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/pilgrimage"
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white transition-colors duration-300 rounded"
            >
              線上進香登記
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 bg-transparent border border-white/30 hover:bg-white/10 transition-colors duration-300 rounded"
            >
              聯絡我們
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
