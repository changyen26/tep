/**
 * Temple Admin Routes - 廟方管理路由配置
 *
 * 所有廟方管理頁面的路由集中在此
 * 路由前綴：/temple-admin/:templeId/*
 */

import { Route } from 'react-router-dom';
import TempleAdminLayout from '../layouts/TempleAdminLayout';
import TempleAdminGuard from '../guards/TempleAdminGuard';

// 廟方管理頁面
import TempleAdminDashboard from '../pages/temple-admin/TempleAdminDashboard';
import TempleEdit from '../pages/temple-admin/TempleEdit';
import CheckinRecords from '../pages/temple-admin/CheckinRecords';
import ProductManagement from '../pages/temple-admin/ProductManagement';
import OrderManagement from '../pages/temple-admin/OrderManagement';
import RevenueReport from '../pages/temple-admin/RevenueReport';
import Settings from '../pages/temple-admin/Settings';
import DevoteeList from '../pages/temple-admin/DevoteeList';
import DevoteeDetail from '../pages/temple-admin/DevoteeDetail';
import ChangePassword from '../pages/temple-admin/ChangePassword';

// 活動報名管理
import EventList from '../pages/temple-admin/events/EventList';
import EventNew from '../pages/temple-admin/events/EventNew';
import EventEdit from '../pages/temple-admin/events/EventEdit';
import EventDetail from '../pages/temple-admin/events/EventDetail';
import EventRegistrations from '../pages/temple-admin/events/EventRegistrations';

// 點燈管理
import LampTypeList from '../pages/temple-admin/lamps/LampTypeList';
import LampTypeNew from '../pages/temple-admin/lamps/LampTypeNew';
import LampTypeEdit from '../pages/temple-admin/lamps/LampTypeEdit';
import LampTypeDetail from '../pages/temple-admin/lamps/LampTypeDetail';
import LampApplications from '../pages/temple-admin/lamps/LampApplications';

// 進香登記管理
import PilgrimageVisitList from '../pages/temple-admin/PilgrimageVisitList';
import PilgrimageVisitDetail from '../pages/temple-admin/PilgrimageVisitDetail';

// 數據分析
import AnalyticsDashboard from '../pages/temple-admin/analytics/AnalyticsDashboard';

// 經營診斷
import BusinessDashboard from '../pages/temple-admin/business/BusinessDashboard';

// 感謝狀管理
import CertificateList from '../pages/temple-admin/certificates/CertificateList';
import CertificateNew from '../pages/temple-admin/certificates/CertificateNew';
import CertificateView from '../pages/temple-admin/certificates/CertificateView';

// 推播通知管理
import NotificationList from '../pages/temple-admin/notifications/NotificationList';
import NotificationNew from '../pages/temple-admin/notifications/NotificationNew';
import NotificationDetail from '../pages/temple-admin/notifications/NotificationDetail';
import NotificationTemplates from '../pages/temple-admin/notifications/NotificationTemplates';

// 帳號與權限管理
import StaffList from '../pages/temple-admin/staff/StaffList';
import StaffNew from '../pages/temple-admin/staff/StaffNew';
import StaffDetail from '../pages/temple-admin/staff/StaffDetail';
import StaffEdit from '../pages/temple-admin/staff/StaffEdit';
import RoleManagement from '../pages/temple-admin/staff/RoleManagement';
import ActivityLog from '../pages/temple-admin/staff/ActivityLog';

// 線上捐款管理
import DonationList from '../pages/temple-admin/donations/DonationList';
import DonationDetail from '../pages/temple-admin/donations/DonationDetail';
import ReconcileReport from '../pages/temple-admin/donations/ReconcileReport';

/**
 * 廟方管理路由元件
 * 使用方式：在主路由中 import 並掛載
 *
 * <Route path="/temple-admin/:templeId/*" element={templeAdminRoutes} />
 */
export const templeAdminRoutes = (
  <Route
    path="/temple-admin/:templeId"
    element={
      <TempleAdminGuard>
        <TempleAdminLayout />
      </TempleAdminGuard>
    }
  >
    {/* 儀表板 */}
    <Route index element={<TempleAdminDashboard />} />
    <Route path="dashboard" element={<TempleAdminDashboard />} />

    {/* 廟宇資訊編輯 */}
    <Route path="temple-settings" element={<TempleEdit />} />

    {/* 打卡紀錄 */}
    <Route path="checkins" element={<CheckinRecords />} />

    {/* 商品管理 */}
    <Route path="products" element={<ProductManagement />} />

    {/* 訂單管理 */}
    <Route path="orders" element={<OrderManagement />} />

    {/* 活動報名管理 */}
    <Route path="events" element={<EventList />} />
    <Route path="events/new" element={<EventNew />} />
    <Route path="events/:eventId" element={<EventDetail />} />
    <Route path="events/:eventId/edit" element={<EventEdit />} />
    <Route path="events/:eventId/registrations" element={<EventRegistrations />} />

    {/* 點燈管理 */}
    <Route path="lamps" element={<LampTypeList />} />
    <Route path="lamps/new" element={<LampTypeNew />} />
    <Route path="lamps/:lampTypeId" element={<LampTypeDetail />} />
    <Route path="lamps/:lampTypeId/edit" element={<LampTypeEdit />} />
    <Route path="lamps/:lampTypeId/applications" element={<LampApplications />} />

    {/* 進香登記管理 */}
    <Route path="pilgrimage-visits" element={<PilgrimageVisitList />} />
    <Route path="pilgrimage-visits/:visitId" element={<PilgrimageVisitDetail />} />

    {/* 數據分析 */}
    <Route path="analytics" element={<AnalyticsDashboard />} />

    {/* 經營診斷 */}
    <Route path="business" element={<BusinessDashboard />} />

    {/* 感謝狀管理 */}
    <Route path="certificates" element={<CertificateList />} />
    <Route path="certificates/new" element={<CertificateNew />} />
    <Route path="certificates/:certificateId" element={<CertificateView />} />

    {/* 推播通知管理 */}
    <Route path="notifications" element={<NotificationList />} />
    <Route path="notifications/new" element={<NotificationNew />} />
    <Route path="notifications/templates" element={<NotificationTemplates />} />
    <Route path="notifications/:notificationId" element={<NotificationDetail />} />

    {/* 收入報表 */}
    <Route path="revenue" element={<RevenueReport />} />

    {/* 線上捐款管理 */}
    <Route path="donations" element={<DonationList />} />
    <Route path="donations/reconcile" element={<ReconcileReport />} />
    <Route path="donations/:donationId" element={<DonationDetail />} />

    {/* 信眾管理 */}
    <Route path="devotees" element={<DevoteeList />} />
    <Route path="devotees/:publicUserId" element={<DevoteeDetail />} />

    {/* 系統設定 */}
    <Route path="settings" element={<Settings />} />

    {/* 修改密碼 */}
    <Route path="change-password" element={<ChangePassword />} />

    {/* 帳號與權限管理 */}
    <Route path="staff" element={<StaffList />} />
    <Route path="staff/new" element={<StaffNew />} />
    <Route path="staff/roles" element={<RoleManagement />} />
    <Route path="staff/logs" element={<ActivityLog />} />
    <Route path="staff/:staffId" element={<StaffDetail />} />
    <Route path="staff/:staffId/edit" element={<StaffEdit />} />
  </Route>
);

export default templeAdminRoutes;
