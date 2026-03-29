import { Routes, Route, Navigate } from 'react-router-dom'
import { LiffProvider, useLiff } from './contexts/LiffContext'
import EventsPage from './pages/EventsPage'
import RegisterPage from './pages/RegisterPage'
import MyRegistrationsPage from './pages/MyRegistrationsPage'
import Loading from './components/Loading'

function AppContent() {
  const { liffReady, liffError } = useLiff()

  if (!liffReady) {
    return <Loading message="初始化中..." />
  }

  if (liffError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-white mb-2">初始化失敗</h2>
        <p className="text-sm text-gray-400">{liffError}</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:eventId/register" element={<RegisterPage />} />
      <Route path="/my" element={<MyRegistrationsPage />} />
      <Route path="*" element={<Navigate to="/events" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <LiffProvider>
      <div className="max-w-lg mx-auto min-h-screen">
        <AppContent />
      </div>
    </LiffProvider>
  )
}

export default App
