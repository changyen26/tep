import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'

// 前台頁面
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import EventsPage from './pages/EventsPage'
import ServicesPage from './pages/ServicesPage'
import LightingPage from './pages/LightingPage'
import PilgrimagePage from './pages/PilgrimagePage'
import RegistrationPage from './pages/RegistrationPage'
import GalleryPage from './pages/GalleryPage'
import ContactPage from './pages/ContactPage'
import GuidePage from './pages/GuidePage'

// 後台頁面
import LoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import LightingsPage from './pages/admin/LightingsPage'
import PilgrimagesPage from './pages/admin/PilgrimagesPage'
import RegistrationsPage from './pages/admin/RegistrationsPage'
import AdminEventsPage from './pages/admin/EventsPage'
import NewsPage from './pages/admin/NewsPage'
import StatsPage from './pages/admin/StatsPage'
import CalendarPage from './pages/admin/CalendarPage'
import ReceiptsPage from './pages/admin/ReceiptsPage'
import ContactMessagesPage from './pages/admin/ContactMessagesPage'
import ContentManagementPage from './pages/admin/ContentManagementPage'
import GalleryManagementPage from './pages/admin/GalleryManagementPage'
import SettingsPage from './pages/admin/SettingsPage'
import NotificationsPage from './pages/admin/NotificationsPage'
import MembersPage from './pages/admin/MembersPage'
import RolesPermissionsPage from './pages/admin/RolesPermissionsPage'

function App() {
  return (
    <Routes>
      {/* 前台路由 */}
      <Route path="/" element={<><Header /><main style={{ flex: 1 }}><HomePage /></main><Footer /></>} />
      <Route path="/about" element={<><Header /><main style={{ flex: 1 }}><AboutPage /></main><Footer /></>} />
      <Route path="/events" element={<><Header /><main style={{ flex: 1 }}><EventsPage /></main><Footer /></>} />
      <Route path="/services" element={<><Header /><main style={{ flex: 1 }}><ServicesPage /></main><Footer /></>} />
      <Route path="/lighting" element={<><Header /><main style={{ flex: 1 }}><LightingPage /></main><Footer /></>} />
      <Route path="/pilgrimage" element={<><Header /><main style={{ flex: 1 }}><PilgrimagePage /></main><Footer /></>} />
      <Route path="/registration" element={<><Header /><main style={{ flex: 1 }}><RegistrationPage /></main><Footer /></>} />
      <Route path="/gallery" element={<><Header /><main style={{ flex: 1 }}><GalleryPage /></main><Footer /></>} />
      <Route path="/contact" element={<><Header /><main style={{ flex: 1 }}><ContactPage /></main><Footer /></>} />
      <Route path="/guide" element={<GuidePage />} />

      {/* 後台登入 */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* 後台路由（需登入） */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout><DashboardPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/lightings" element={
        <ProtectedRoute>
          <AdminLayout><LightingsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/pilgrimages" element={
        <ProtectedRoute>
          <AdminLayout><PilgrimagesPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/events" element={
        <ProtectedRoute>
          <AdminLayout><AdminEventsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/news" element={
        <ProtectedRoute>
          <AdminLayout><NewsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/registrations" element={
        <ProtectedRoute>
          <AdminLayout><RegistrationsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/receipts" element={
        <ProtectedRoute>
          <AdminLayout><ReceiptsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/stats" element={
        <ProtectedRoute>
          <AdminLayout><StatsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/calendar" element={
        <ProtectedRoute>
          <AdminLayout><CalendarPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/contacts" element={
        <ProtectedRoute>
          <AdminLayout><ContactMessagesPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/content" element={
        <ProtectedRoute>
          <AdminLayout><ContentManagementPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/gallery" element={
        <ProtectedRoute>
          <AdminLayout><GalleryManagementPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <AdminLayout><SettingsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute>
          <AdminLayout><NotificationsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/members" element={
        <ProtectedRoute>
          <AdminLayout><MembersPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/roles" element={
        <ProtectedRoute>
          <AdminLayout><RolesPermissionsPage /></AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
