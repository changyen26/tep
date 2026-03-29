import { createContext, useContext, useState, useEffect } from 'react'
import liff from '@line/liff'

const LiffContext = createContext(null)

const LIFF_ID = import.meta.env.VITE_LIFF_ID || ''

export function LiffProvider({ children }) {
  const [liffReady, setLiffReady] = useState(false)
  const [liffError, setLiffError] = useState(null)
  const [profile, setProfile] = useState(null)
  const [lineUserId, setLineUserId] = useState(null)

  useEffect(() => {
    if (!LIFF_ID) {
      // 開發模式：不初始化 LIFF，使用假資料
      console.warn('[LIFF] No LIFF_ID, running in dev mode')
      setLineUserId('dev_user_001')
      setProfile({ displayName: '開發測試用戶', pictureUrl: null })
      setLiffReady(true)
      return
    }

    liff.init({ liffId: LIFF_ID })
      .then(() => {
        if (!liff.isLoggedIn()) {
          // 未登入 → 跳轉 LINE 登入，登入後會自動回來
          liff.login({ redirectUri: window.location.href })
          return null
        }
        setLiffReady(true)
        return liff.getProfile()
      })
      .then((prof) => {
        if (prof) {
          setProfile(prof)
          setLineUserId(prof.userId)
        }
      })
      .catch((err) => {
        console.error('[LIFF] Init error:', err)
        setLiffError(err.message || 'LIFF 初始化失敗')
        setLiffReady(true)
      })
  }, [])

  const login = () => {
    if (LIFF_ID && !liff.isLoggedIn()) {
      liff.login({ redirectUri: window.location.href })
    }
  }

  const isInClient = () => {
    try { return liff.isInClient() } catch { return false }
  }

  return (
    <LiffContext.Provider value={{ liffReady, liffError, profile, lineUserId, login, isInClient }}>
      {children}
    </LiffContext.Provider>
  )
}

export function useLiff() {
  const context = useContext(LiffContext)
  if (!context) {
    throw new Error('useLiff must be used within a LiffProvider')
  }
  return context
}
