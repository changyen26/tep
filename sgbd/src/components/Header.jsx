import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { path: '/', label: '首頁' },
    { path: '/about', label: '關於寶殿' },
    { path: '/guide', label: '參拜引導' },
    { path: '/services', label: '服務項目' },
    { path: '/events', label: '活動資訊' },
    { path: '/contact', label: '聯絡我們' },
  ]

  const isHomePage = location.pathname === '/'

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled || !isHomePage
        ? 'bg-white/95 backdrop-blur-md shadow-lg py-3'
        : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
            isScrolled || !isHomePage ? 'border-red-800 text-red-800' : 'border-white text-white'
          }`}>
            <span className="font-serif font-bold text-lg">三</span>
          </div>
          <div className={`flex flex-col transition-colors ${
            isScrolled || !isHomePage ? 'text-stone-900' : 'text-white'
          }`}>
            <span className="text-xl font-bold tracking-widest font-serif">三官寶殿</span>
            <span className="text-xs tracking-wider opacity-80">台南・白河</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium tracking-wider transition-colors ${
                location.pathname === link.path
                  ? 'text-amber-500'
                  : isScrolled || !isHomePage
                    ? 'text-stone-600 hover:text-amber-500'
                    : 'text-stone-200 hover:text-amber-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/lighting"
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              isScrolled || !isHomePage
                ? 'bg-red-800 text-white hover:bg-red-900'
                : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
            }`}
          >
            線上點燈
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 transition-colors ${
            isScrolled || !isHomePage ? 'text-stone-900' : 'text-white'
          }`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="切換選單"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl py-6 px-6 flex flex-col gap-4 md:hidden border-t border-stone-100">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg py-2 border-b border-stone-100 font-serif transition-colors ${
                location.pathname === link.path
                  ? 'text-amber-600'
                  : 'text-stone-800 hover:text-amber-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/lighting"
            onClick={() => setIsMenuOpen(false)}
            className="w-full bg-red-800 text-white py-3 rounded mt-2 text-center font-medium hover:bg-red-900 transition-colors"
          >
            線上點燈
          </Link>
        </div>
      )}
    </header>
  )
}

export default Header
