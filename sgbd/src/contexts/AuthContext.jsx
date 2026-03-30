import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('sgbd_admin_user')
    const token = localStorage.getItem('sgbd_token')
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const { ok, data } = await authApi.login(email, password)
      if (ok && data.status === 'success') {
        const token = data.data?.token
        const userData = {
          id: data.data?.user?.id,
          name: data.data?.user?.name || email,
          email: data.data?.user?.email || email,
          role: 'admin',
          templeId: data.data?.user?.temple_id,
        }
        localStorage.setItem('sgbd_token', token)
        localStorage.setItem('sgbd_admin_user', JSON.stringify(userData))
        setUser(userData)
        return { success: true }
      }
      return { success: false, message: data.message || '帳號或密碼錯誤' }
    } catch (err) {
      return { success: false, message: err.message || '連線失敗，請稍後再試' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sgbd_token')
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
