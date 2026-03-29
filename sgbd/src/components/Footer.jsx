import { Link } from 'react-router-dom'
import { MapPin, Phone, Clock, ArrowRight, Mail } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 border-b border-stone-800 pb-12">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full border border-stone-600 flex items-center justify-center">
                <span className="font-serif font-bold text-white text-sm">三</span>
              </div>
              <h3 className="text-white font-serif text-xl tracking-widest">三官寶殿</h3>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              台南市白河區具代表性之宗教聖地，傳承百年信仰香火，結合在地蓮鄉文化，守護鄉里。
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-stone-800 rounded-full hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center"
              >
                <span className="text-xs text-white">f</span>
              </a>
              <a
                href="https://line.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-stone-800 rounded-full hover:bg-green-500 transition-colors cursor-pointer flex items-center justify-center"
              >
                <span className="text-xs text-white">L</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">快速連結</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="hover:text-amber-500 transition-colors">
                  關於寶殿
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-amber-500 transition-colors">
                  最新消息
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-500 transition-colors">
                  參拜服務
                </Link>
              </li>
              <li>
                <Link to="/lighting" className="hover:text-amber-500 transition-colors">
                  線上點燈
                </Link>
              </li>
              <li>
                <Link to="/pilgrimage" className="hover:text-amber-500 transition-colors">
                  進香登記
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-6">聯絡資訊</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 text-amber-600 flex-shrink-0" />
                <span>台南市白河區外角里4鄰外角41號</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-amber-600" />
                <span>06-685-2428</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={18} className="text-amber-600" />
                <span>每日 05:00 - 21:00</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-amber-600" />
                <span>sanguan@temple.org.tw</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6">訂閱電子報</h4>
            <p className="text-xs mb-4">接收法會通知與最新活動消息。</p>
            <div className="flex">
              <input
                type="email"
                placeholder="您的電子信箱"
                className="bg-stone-800 border-none outline-none px-4 py-2 rounded-l text-sm w-full focus:ring-1 focus:ring-amber-500"
              />
              <button className="bg-amber-600 text-white px-4 py-2 rounded-r hover:bg-amber-700 transition-colors">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-600">
          <p>&copy; 2024 白河三官寶殿. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link to="/admin/login" className="hover:text-amber-500 transition-colors">
              廟方登入
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
