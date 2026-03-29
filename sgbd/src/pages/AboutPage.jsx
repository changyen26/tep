import { useData } from '../contexts/DataContext'
import { Sun, Mountain, Droplets, Building, Palette, Flame, Bell } from 'lucide-react'

function AboutPage() {
  const { siteContent } = useData()
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">關於寶殿</h1>
          <p className="text-lg text-stone-200 tracking-widest">認識白河三官寶殿</p>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] w-12 bg-red-800"></div>
              <span className="text-red-800 font-medium tracking-widest text-sm">廟宇沿革</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-8">
              百年香火，<span className="text-stone-400">傳承信仰</span>
            </h2>
            <div className="space-y-6 text-stone-600 leading-8 text-justify">
              {siteContent.history.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Deities Section */}
      <section className="py-20 bg-stone-900 text-stone-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-amber-500 tracking-[0.5em] text-sm uppercase block mb-4">Main Deities</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">主祀神明</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 天官 */}
            <div className="bg-stone-800 rounded-xl overflow-hidden border border-stone-700 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-32 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                <Sun size={48} className="text-amber-300" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-amber-500 mb-2">上元一品天官大帝</h3>
                <div className="text-sm text-stone-400 mb-4 space-y-1">
                  <p>聖誕：農曆正月十五日（上元節）</p>
                  <p>職掌：<span className="text-indigo-400">賜福</span></p>
                </div>
                <p className="text-stone-300 text-sm leading-relaxed">
                  天官大帝為三官之首，主管天界，統轄諸天神明。
                  天官能賜予人間福祿壽喜，信眾祈求添福添壽、闔家平安、事業順遂。
                  上元節又稱元宵節，是天官聖誕，也是祈福的最佳時機。
                </p>
              </div>
            </div>

            {/* 地官 */}
            <div className="bg-stone-800 rounded-xl overflow-hidden border border-stone-700 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-32 bg-gradient-to-br from-emerald-900 to-stone-800 flex items-center justify-center">
                <Mountain size={48} className="text-emerald-300" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-emerald-500 mb-2">中元二品地官大帝</h3>
                <div className="text-sm text-stone-400 mb-4 space-y-1">
                  <p>聖誕：農曆七月十五日（中元節）</p>
                  <p>職掌：<span className="text-emerald-400">赦罪</span></p>
                </div>
                <p className="text-stone-300 text-sm leading-relaxed">
                  地官大帝主管地府，掌理陰間諸事。
                  地官能赦免亡魂之罪，超渡祖先往生極樂。
                  中元節為地官聖誕，是民間普渡、超渡祖先的重要日子。
                </p>
              </div>
            </div>

            {/* 水官 */}
            <div className="bg-stone-800 rounded-xl overflow-hidden border border-stone-700 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-32 bg-gradient-to-br from-cyan-900 to-blue-900 flex items-center justify-center">
                <Droplets size={48} className="text-cyan-300" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-cyan-500 mb-2">下元三品水官大帝</h3>
                <div className="text-sm text-stone-400 mb-4 space-y-1">
                  <p>聖誕：農曆十月十五日（下元節）</p>
                  <p>職掌：<span className="text-cyan-400">解厄</span></p>
                </div>
                <p className="text-stone-300 text-sm leading-relaxed">
                  水官大帝主管水域，統領水府眾神。
                  水官能消災解厄、化解凶煞，庇佑信眾逢凶化吉。
                  下元節為水官聖誕，是祈求消災解厄的良辰吉日。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4">建築特色</h2>
            <p className="text-stone-500 max-w-xl mx-auto">
              融合閩南傳統工藝與現代結構美學，展現廟宇建築之美
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Building className="text-red-700" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2">正殿</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                正殿供奉三官大帝神像，金身莊嚴，神威顯赫。
                殿內香煙繚繞，信眾絡繹不絕，祈求神明庇佑。
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <Palette className="text-amber-700" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2">彩繪</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                廟宇內外彩繪精美，以傳統工法繪製各式神話故事、吉祥圖案，
                展現傳統藝術之美。
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <Flame className="text-emerald-700" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2">雕刻</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                樑柱、斗拱上的木雕精緻細膩，龍鳳呈祥、花鳥蟲魚栩栩如生，
                彰顯匠師精湛技藝。
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="text-blue-700" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2">鐘鼓樓</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                鐘鼓樓分立兩側，晨鐘暮鼓，聲傳遐邇，
                為廟宇增添莊嚴肅穆之氛圍。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
