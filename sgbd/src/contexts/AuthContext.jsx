import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// 模擬管理員帳號
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'sgbd2024'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 檢查 localStorage 是否有登入狀態
    const savedUser = localStorage.getItem('sgbd_admin_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (username, password) => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const userData = { username, role: 'admin', name: '管理員' }
      setUser(userData)
      localStorage.setItem('sgbd_admin_user', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, message: '帳號或密碼錯誤' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sgbd_admin_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
