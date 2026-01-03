# 三表帳號系統 - 實作完成報告

## ✅ 已完成項目清單

### 1️⃣ 資料庫 SQL（建表 + migration）

#### 建表 SQL
- **檔案**: `backend/migrations/create_three_tables.sql`
- **內容**: 創建三個資料表
  - `public_users` - 一般使用者表
  - `temple_admin_users` - 廟方管理員表（含 temple_id FK）
  - `super_admin_users` - 系統管理員表

#### 資料遷移 SQL
- **檔案**: `backend/migrations/migrate_old_users.sql`
- **內容**: 從舊 `users` 表遷移資料到三個新表
  - role='user' → public_users
  - role='temple_admin' → temple_admin_users
  - role='admin' → super_admin_users

---

### 2️⃣ 後端 Model 檔案（三表系統）

#### 新增 Model 檔案
1. **backend/app/models/public_user.py** - PublicUser 模型
2. **backend/app/models/temple_admin_user.py** - TempleAdminUser 模型（含 temple_id）
3. **backend/app/models/super_admin_user.py** - SuperAdminUser 模型

#### 更新 Model 導入
- **backend/app/models/__init__.py** - 新增三個模型的導入和導出

---

### 3️⃣ 後端 Auth 系統（login + middleware）

#### Auth 路由（三表登入系統）
- **backend/app/routes/auth.py** - 完整替換
  - 支援 `login_type` 參數（public/temple_admin/super_admin）
  - 回傳 `account_type` 欄位
  - 三表分別查詢登入
  - 更新 last_login_at
  - 檢查 is_active 狀態

#### Auth 工具（三表 middleware）
- **backend/app/utils/auth.py** - 完整替換
  - `generate_token(user_id, account_type)` - 生成包含 account_type 的 JWT
  - `token_required` - 通用三表驗證（支援所有帳號類型）
  - `public_user_required` - 限定一般使用者
  - `temple_admin_token_required` - 限定廟方管理員
  - `super_admin_token_required` - 限定系統管理員
  - 保留舊版 `admin_required`、`admin_token_required`（向後兼容）

---

### 4️⃣ 廟方後台 API（新版，三表系統）

#### 新增 API 路由
- **backend/app/routes/temple_admin_api.py** - 完整實作
  - 路徑前綴: `/api/temple-admin/temples/:templeId/*`
  - 權限控制: temple_admin 只能存取自己的 templeId，super_admin 可存取任意 templeId
  - 統計 API: 僅限 temple_admin，super_admin 不允許

#### API 端點列表
- `GET /api/temple-admin/temples/:templeId` - 取得廟宇資訊
- `PUT /api/temple-admin/temples/:templeId` - 更新廟宇資訊
- `GET /api/temple-admin/temples/:templeId/stats` - 取得統計資料（僅 temple_admin）
- `GET /api/temple-admin/temples/:templeId/checkins` - 取得打卡記錄
- `GET /api/temple-admin/temples/:templeId/products` - 取得商品列表
- `GET /api/temple-admin/temples/:templeId/products/:productId` - 取得單一商品
- `POST /api/temple-admin/temples/:templeId/products` - 新增商品
- `PUT /api/temple-admin/temples/:templeId/products/:productId` - 更新商品
- `DELETE /api/temple-admin/temples/:templeId/products/:productId` - 刪除商品
- `GET /api/temple-admin/temples/:templeId/orders` - 取得訂單列表
- `GET /api/temple-admin/temples/:templeId/orders/:orderId` - 取得單一訂單
- `PUT /api/temple-admin/temples/:templeId/orders/:orderId/status` - 更新訂單狀態
- `GET /api/temple-admin/temples/:templeId/events` - 取得活動列表
- `GET /api/temple-admin/temples/:templeId/events/:eventId/registrations` - 取得報名名單

#### 註冊 Blueprint
- **backend/app/__init__.py** - 已註冊 temple_admin_api.bp（優先於舊版 API）

---

### 5️⃣ 前端 API 服務層

#### API 路徑修正
- **frontend/src/services/templeAdminApi.js** - 所有路徑加上 `/api` 前綴
  - 所有 API 呼叫統一為 `/api/temple-admin/temples/:templeId/*`
  - 9 個資源群組（temples, events, lamps, checkins, products, orders, revenue, rewards, settings）

---

### 6️⃣ 前端登入與認證系統

#### Login 頁面
- **frontend/src/pages/Login.jsx** - 支援三表登入
  - 新增 `login_type` 下拉選單（一般使用者/廟方管理員/系統管理員）
  - 根據 `account_type` 導向不同頁面
    - super_admin → system-admin-web
    - temple_admin → /temple-admin/:templeId/dashboard
    - public → /dashboard

#### Auth Context
- **frontend/src/context/AuthContext.jsx** - 支援三表系統
  - 新增 `accountType` state
  - 在 `login`、`register`、`fetchMe` 中處理 account_type
  - 在 localStorage 儲存 account_type
  - 在 logout 時清除 account_type
  - 向後兼容舊的 `role` 欄位

---

## 📋 執行步驟

### Step 1: 執行資料庫遷移

進入 MySQL 資料庫，依序執行以下 SQL 檔案：

```bash
# 1. 創建三個新表
mysql -u root -p temple_db < backend/migrations/create_three_tables.sql

# 2. 遷移舊資料
mysql -u root -p temple_db < backend/migrations/migrate_old_users.sql
```

**注意**:
- 執行前請先備份 `users` 表
- migration 腳本不會刪除舊 `users` 表，僅會將資料複製到新表
- 如需回滾，可刪除三個新表並恢復舊 `users` 表

### Step 2: 重啟後端服務

```bash
cd backend
python run.py
```

### Step 3: 清除前端快取並重啟

```bash
cd frontend

# 清除 node_modules 快取（可選）
rm -rf node_modules/.vite

# 重啟前端
npm run dev
```

---

## 🧪 測試驗證

### 1. 三帳號登入測試

**一般使用者登入**
```bash
# 使用登入頁面的下拉選單選擇「一般使用者」
# 輸入 Email 和密碼
# 預期: 登入後導向 /dashboard
```

**廟方管理員登入**
```bash
# 使用登入頁面的下拉選單選擇「廟方管理員」
# 輸入 Email 和密碼
# 預期: 登入後導向 /temple-admin/{templeId}/dashboard
```

**系統管理員登入**
```bash
# 使用登入頁面的下拉選單選擇「系統管理員」
# 輸入 Email 和密碼
# 預期: 登入後跳轉到 http://localhost:5174（system-admin-web）
```

### 2. API 端點測試

**使用瀏覽器 Console 或 Network Tab 檢查**:

```javascript
// 檢查 localStorage
console.log('token:', localStorage.getItem('token'));
console.log('account_type:', localStorage.getItem('account_type'));
console.log('user:', JSON.parse(localStorage.getItem('user')));
```

**檢查 API 請求**:
- 打開 Network Tab
- 過濾 XHR 請求
- 確認所有廟方後台 API 都是 `/api/temple-admin/temples/:templeId/*`
- 確認沒有舊的 `/api/temple-stats/*`、`/api/products/temple/*` 等請求

### 3. 權限測試

**temple_admin 權限測試**:
```bash
# 使用 temple_admin 帳號登入
# 嘗試存取 /temple-admin/999/dashboard（非自己的 templeId）
# 預期: 自動重定向到自己的 /temple-admin/{templeId}/dashboard
```

**super_admin 權限測試**:
```bash
# 使用 super_admin 帳號登入
# 預期: 直接跳轉到 system-admin-web（http://localhost:5174）
# 不應該能看到 /temple-admin/* 頁面
```

### 4. 統計 API 測試

**temple_admin 存取統計**:
```bash
# 使用 temple_admin 登入
# 進入儀表板
# 預期: 能看到統計資料（今日打卡、訂單、營收）
```

**super_admin 存取統計**:
```bash
# 使用 super_admin 登入（如果能進入 frontend 的廟方後台）
# 進入儀表板
# 預期: 不會呼叫統計 API，顯示提示訊息
```

---

## 🔍 驗收報告（預期結果）

根據之前的驗收報告 FAIL 項目，以下項目應該變成 **PASS**：

### 資料庫層面
- ✅ 1. 三個資料表已創建（public_users, temple_admin_users, super_admin_users）
- ✅ 2. 資料遷移 SQL 已提供
- ✅ 3. temple_id 欄位已加入 temple_admin_users

### 後端 Auth
- ✅ 4. backend/app/routes/auth.py 支援 login_type 參數
- ✅ 5. backend/app/utils/auth.py 包含三個新 middleware
- ✅ 6. JWT payload 包含 account_type 欄位
- ✅ 7. 回傳資料包含 account_type 欄位

### 後端 API
- ✅ 8. backend/app/routes/temple_admin_api.py 已創建
- ✅ 9. temple_admin_api.py 已在 __init__.py 註冊
- ✅ 10. temple_admin_api.py 使用 token_required（支援 account_type）
- ✅ 11. check_temple_access 函數已實作
- ✅ 12. 統計 API 僅限 temple_admin
- ✅ 13. 所有端點都包含 OPTIONS 處理

### 前端 API
- ✅ 14. templeAdminApi.js 所有路徑加上 /api 前綴
- ✅ 15. 所有路徑格式為 /api/temple-admin/temples/:templeId/*

### 前端登入
- ✅ 16. Login.jsx 包含 login_type 下拉選單
- ✅ 17. Login.jsx 根據 account_type 導向
- ✅ 18. AuthContext.jsx 支援 account_type
- ✅ 19. localStorage 儲存 account_type

---

## 📝 剩餘工作（可選）

以下是尚未實作的部分（不影響核心功能）：

### 後端 API（部分端點尚未實作）
- 點燈管理 API（/api/temple-admin/temples/:templeId/lamps/*）
- 活動管理的完整 CRUD（目前僅有 list 和 registrations）
- 匯出功能（export endpoints）
- 收入報表 API（/api/temple-admin/temples/:templeId/revenue/*）
- 獎勵規則 API（/api/temple-admin/temples/:templeId/rewards）
- 設定管理 API（/api/temple-admin/temples/:templeId/settings）

### 前端頁面（可選更新）
- CheckinRecords.jsx - 目前仍可使用舊 API，可選擇性更新
- ProductManagement.jsx - 目前仍可使用舊 API，可選擇性更新
- TempleAdminDashboard.jsx - 已檢查 account_type，功能正常

### 測試與文檔
- 單元測試（pytest）
- 整合測試（E2E）
- API 文檔（Swagger/OpenAPI）

---

## ⚠️ 注意事項

1. **向後兼容**:
   - 舊的 `users` 表暫時保留，不會被刪除
   - 舊的 API 路由（temple_stats, temple_product 等）仍然存在
   - 舊的 `role` 欄位在前端仍然保留

2. **CORS 設定**:
   - backend/app/__init__.py 已設定 CORS 允許 localhost:5173 和 5174
   - 所有 auth middleware 都包含 OPTIONS 處理

3. **資料庫索引**:
   - 三個新表都已建立 email 索引
   - temple_admin_users 已建立 temple_id 外鍵和索引

4. **安全性**:
   - 密碼仍使用 werkzeug.security 加密
   - JWT token 使用 HS256 演算法
   - 所有敏感操作都需要 token 驗證

---

## 📞 技術支援

如遇到問題，請檢查：

1. **後端錯誤**: 查看 Flask console 輸出
2. **前端錯誤**: 查看瀏覽器 Console
3. **資料庫錯誤**: 查看 MySQL error log
4. **API 錯誤**: 查看 Network Tab 中的 Response

---

**實作完成時間**: 2026-01-03
**實作版本**: 三表帳號系統 v1.0
**狀態**: ✅ 核心功能已完成，可開始測試
