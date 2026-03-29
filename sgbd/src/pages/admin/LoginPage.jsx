import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 模擬延遲
    await new Promise(resolve => setTimeout(resolve, 500))

    const result = login(username, password)

    if (result.success) {
      navigate('/admin')
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-admin-dark via-admin-dark-light to-admin-dark p-4">
      <div className="w-full max-w-[400px] bg-admin-dark-light rounded-lg p-10 border border-admin-dark-lighter shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="block text-6xl text-temple-gold mb-4">☯</span>
          <h1 className="text-temple-gold text-2xl mb-2">白河三官寶殿</h1>
          <p className="text-gray-500 m-0">後台管理系統</p>
        </div>

        {/* Form */}
        <form className="mb-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-3 py-3 rounded mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="username" className="block text-gray-200 mb-2 text-[0.95rem]">
              帳號
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="請輸入帳號"
              required
              autoFocus
              className="w-full py-3.5 px-4 bg-admin-dark border border-admin-dark-lighter rounded text-gray-200 text-base transition-colors duration-200 placeholder:text-gray-500 focus:outline-none focus:border-temple-gold"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block text-gray-200 mb-2 text-[0.95rem]">
              密碼
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              required
              className="w-full py-3.5 px-4 bg-admin-dark border border-admin-dark-lighter rounded text-gray-200 text-base transition-colors duration-200 placeholder:text-gray-500 focus:outline-none focus:border-temple-gold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-br from-temple-gold to-temple-gold-dark text-admin-dark border-none rounded text-lg font-semibold cursor-pointer transition-all duration-200 hover:enabled:from-temple-gold-light hover:enabled:to-temple-gold hover:enabled:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <a
            href="/"
            className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-temple-gold"
          >
            ← 返回首頁
          </a>
        </div>

        {/* Test credentials hint */}
        <div className="mt-6 pt-6 border-t border-admin-dark-lighter text-center">
          <p className="text-gray-500 text-xs my-1">測試帳號：admin</p>
          <p className="text-gray-500 text-xs my-1">測試密碼：sgbd2024</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
