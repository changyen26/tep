# 前端架構文檔

4 個 React 前端專案，皆使用 React 19 + Vite + React Router v7。

## 專案對照表

| 專案 | 用途 | UI 框架 | 狀態管理 | HTTP | Port |
|------|------|---------|---------|------|------|
| frontend | 廟方管理後台 | Recharts | React Query v5 | Axios | 80 (nginx) |
| sgbd | 廟宇官網前後台 | Tailwind v4 + Framer Motion | Context API | Fetch | 5174 |
| user-web | 信眾端應用 | Ant Design v6 | Zustand | (Mock) | 5175 |
| liff | LINE 內嵌應用 | Tailwind v4 | Context API | Fetch | 5176 |

---

## 1. Frontend（廟方管理後台）

**目標用戶**：廟方管理員、系統管理員

### API 通訊
- HTTP 客戶端：Axios (`/src/api/client.js`)
- Base URL：`VITE_API_BASE_URL` (預設 `http://localhost:5000/api`)
- Token 自動刷新：401 時使用 refresh_token 換新 token，並行請求排隊機制
- Token 儲存：localStorage (`token`, `refresh_token`)

### 路由結構
```
/login                              登入頁
/temple-admin/:templeId/
  ├── dashboard                     儀表板
  ├── temple-settings               廟宇設定
  ├── checkins                      打卡紀錄
  ├── products                      商品管理
  ├── orders                        訂單管理
  ├── events/                       活動管理
  │   ├── new                       新建活動
  │   ├── :eventId                  活動詳情
  │   ├── :eventId/edit             編輯活動
  │   └── :eventId/registrations    報名名單
  ├── lamps/                        點燈管理
  │   ├── new
  │   ├── :lampTypeId
  │   ├── :lampTypeId/edit
  │   └── :lampTypeId/applications
  ├── pilgrimage-visits             進香登記
  ├── notifications                 推播通知
  ├── analytics                     數據分析
  ├── business                      經營診斷
  ├── revenue                       收入報表
  ├── donations                     捐款管理
  ├── devotees                      信眾管理
  ├── staff                         帳號權限
  ├── certificates                  感謝狀
  ├── settings                      系統設定
  └── change-password               修改密碼

/temple/:templeId/                  廟宇官網（公開）
  ├── /                             首頁
  ├── about                         關於
  ├── news / news/:newsId           新聞
  ├── events                        活動
  ├── services                      服務
  ├── lighting                      點燈
  ├── gallery                       相冊
  └── contact                       聯絡
```

### API 模組 (`/src/api/`)
auth, amulet, checkin, energy, product, address, redemption, reward, stats, temple, leaderboard, templeRevenue, templeOrder, templeProduct, templeExport

---

## 2. SGBD（廟宇官網管理平台）

**目標用戶**：廟宇管理員、廟宇訪客

### API 通訊
- HTTP 客戶端：原生 Fetch (`/src/services/api.js`)
- 認證：Bearer token，localStorage (`sgbd_token`)
- 登入：`authApi.login(email, password)` → `login_type: 'temple_admin'`
- 401 處理：清除 token，重導至 `/admin/login`

### 路由結構
```
前台（公開）
/                           首頁
/about                      關於
/events                     活動
/services                   服務
/lighting                   點燈
/pilgrimage                 進香
/registration               報名
/gallery                    相冊
/contact                    聯絡
/guide                      指南

後台（需登入）
/admin/login                登入
/admin/                     儀表板
/admin/lightings            點燈管理
/admin/pilgrimages          進香管理
/admin/registrations        報名管理
/admin/events               活動管理
/admin/news                 新聞管理
/admin/receipts             收據管理
/admin/stats                統計
/admin/calendar             日曆
/admin/contacts             聯絡訊息
/admin/content              內容管理
/admin/gallery              相冊管理
/admin/settings             設定
/admin/notifications        通知
/admin/members              成員管理
/admin/roles                角色與權限
```

### 特殊依賴
- `lunar-typescript`：農曆日期轉換（廟宇場景需求）
- `framer-motion`：頁面過場動畫

---

## 3. User-web（信眾端應用）

**目標用戶**：廟宇信眾、平台使用者

### API 通訊
- 目前使用 Mock 數據 (`/src/mock/templeWebsiteMockData.js`)
- 預留 Zustand 狀態管理，待與後端整合

### 路由結構
```
/login                      登入

廟宇官網模板（公開）
/temple/:templeId/
  ├── /                     首頁
  ├── about                 關於
  ├── news / news/:newsId   新聞
  ├── events                活動
  ├── services              服務
  ├── lighting              點燈
  ├── gallery               相冊
  └── contact               聯絡

應用功能（需登入）
/                           首頁
/temple                     廟宇首頁
/temple/info                廟宇資訊
/prayer/instruction         祈福說明
/prayer/process             祈福流程
/amulet                     平安符
/amulet/history             平安符歷史
/profile                    個人檔案
/achievement                成就系統
/map                        地圖搜尋
/settings                   設定
```

### 特殊依賴
- `antd v6`：完整 UI 元件庫
- `zustand`：輕量狀態管理
- `dayjs`：日期處理

---

## 4. LIFF（LINE 內嵌應用）

**目標用戶**：LINE 官方帳號的信眾

### API 通訊
- HTTP 客戶端：原生 Fetch (`/src/services/api.js`)
- 無 JWT 認證（使用 LINE User ID 識別身份）
- 端點皆為公開 API (`/api/public/...`)
- Temple ID：`VITE_TEMPLE_ID` (預設 `1`，目前硬編碼)

### LIFF 初始化
- Context：`/src/contexts/LiffContext.jsx`
- LIFF ID：`VITE_LIFF_ID`
- 開發模式：無 LIFF_ID 時使用模擬 LINE 使用者
- 流程：`liff.init()` → `liff.login()` → `liff.getProfile()`

### 路由結構
```
/events                     活動列表
/events/:eventId/register   活動報名表單
/my                         我的報名紀錄
*                           重導至 /events
```

### API 端點
```javascript
GET  /api/public/temples/{TEMPLE_ID}/events          // 活動列表
GET  /api/public/events/{eventId}                     // 活動詳情
POST /api/public/events/{eventId}/register            // 報名
GET  /api/public/registrations?line_uid={lineUid}     // 我的報名
PUT  /api/public/registrations/{id}/cancel            // 取消報名
```

---

## 環境變數

所有前端專案共用的環境變數格式（Vite）：

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

LIFF 專案額外需要：
```env
VITE_LIFF_ID=your_liff_id
VITE_TEMPLE_ID=1
```

---

## 已知技術債

1. **frontend 和 sgbd 功能重疊**：兩個專案都有廟方管理功能，未來應整合
2. **user-web 未接後端**：仍使用 Mock 數據，需完成 API 整合
3. **LIFF temple_id 硬編碼**：`VITE_TEMPLE_ID` 固定為 1，不支援多廟宇
4. **sgbd 無 Token 刷新**：401 直接登出，不像 frontend 有自動刷新
5. **共用元件未抽取**：4 個專案各自獨立，無 shared package
