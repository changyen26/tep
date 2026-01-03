# 廟方活動報名管理 API 實作總結

## 📦 新增/修改檔案清單

### 1. **資料庫 Models** ✨ 新增
- `backend/app/models/temple_event.py`
  - TempleEvent 模型（廟方活動表）
  - 包含完整的 to_dict() 方法與 registeredCount 計算

- `backend/app/models/event_registration.py`
  - EventRegistration 模型（活動報名記錄表）

- `backend/app/models/__init__.py` ✏️ 修改
  - 新增 TempleEvent 和 EventRegistration 的 import

### 2. **API Routes** ✨ 新增
- `backend/app/routes/temple_event_admin.py`
  - 完整的 8 個 API 端點
  - 權限檢查邏輯（check_temple_permission）
  - 完整的驗證規則實作

### 3. **資料庫遷移**
- `backend/migrations/versions/f8d1e2c3b4a5_add_temple_events_and_registrations.py` ✨ 新增
  - Alembic 遷移檔案

- `backend/temple_events_init.sql` ✨ 新增
  - 純 SQL 建表語句（含索引與外鍵）

### 4. **應用程式主檔** ✏️ 修改
- `backend/app/__init__.py`
  - 新增 TempleEvent, EventRegistration 到 models import
  - 註冊 temple_event_admin blueprint

### 5. **文件**
- `backend/TEMPLE_EVENTS_API_TEST.md` ✨ 新增
  - 完整的 API 測試指南與 curl 範例

- `backend/TEMPLE_EVENTS_IMPLEMENTATION_SUMMARY.md` ✨ 新增（本文件）

### 6. **前端調整** ✏️ 修改
- `frontend/src/services/templeEventsService.js`
  - 更新註解，說明需要 temple_id 參數

- `frontend/src/pages/temple-admin/events/EventList.jsx`
  - 在呼叫 API 時傳遞 temple_id 參數

---

## 🗄️ 資料庫結構

### 表 1: temple_events（廟方活動）
```sql
- id (INT, PK, AUTO_INCREMENT)
- temple_id (INT, FK -> temples.id, NOT NULL, INDEXED)
- title (VARCHAR(200), NOT NULL)
- description (TEXT, NOT NULL)
- location (VARCHAR(200), NOT NULL)
- start_at (DATETIME, NOT NULL, INDEXED)
- end_at (DATETIME, NOT NULL)
- signup_end_at (DATETIME, NOT NULL, INDEXED)
- capacity (INT, NOT NULL)
- fee (DECIMAL(10,2), DEFAULT 0.00)
- cover_image_url (VARCHAR(500), NULL)
- status (VARCHAR(20), DEFAULT 'draft', INDEXED)
  - draft, published, closed, canceled
- created_by (INT, FK -> users.id, NOT NULL)
- created_at (DATETIME, DEFAULT CURRENT_TIMESTAMP, INDEXED)
- updated_at (DATETIME, ON UPDATE CURRENT_TIMESTAMP)
```

**索引**：
- `idx_temple_id` (temple_id)
- `idx_status` (status)
- `idx_start_at` (start_at)
- `idx_signup_end_at` (signup_end_at)
- `idx_created_at` (created_at)
- `idx_temple_status` (temple_id, status) - 複合索引

### 表 2: event_registrations（活動報名記錄）
```sql
- id (INT, PK, AUTO_INCREMENT)
- event_id (INT, FK -> temple_events.id, NOT NULL, INDEXED)
- user_id (INT, FK -> users.id, NULL)
- name (VARCHAR(100), NOT NULL)
- phone (VARCHAR(20), NOT NULL)
- email (VARCHAR(120), NOT NULL)
- notes (TEXT, NULL)
- status (VARCHAR(20), DEFAULT 'registered', INDEXED)
  - registered, canceled, waitlist
- registered_at (DATETIME, DEFAULT CURRENT_TIMESTAMP, INDEXED)
- canceled_at (DATETIME, NULL)
```

**索引**：
- `idx_event_id` (event_id)
- `idx_user_id` (user_id)
- `idx_reg_status` (status)
- `idx_registered_at` (registered_at)
- `idx_event_status` (event_id, status) - 複合索引

---

## 🛣️ API 端點總覽

| 方法 | 端點 | 說明 | 權限 |
|------|------|------|------|
| GET | `/api/temple-admin/events/` | 獲取活動列表 | 廟方管理員 |
| POST | `/api/temple-admin/events/` | 建立活動（草稿） | 廟方管理員 |
| GET | `/api/temple-admin/events/<id>/` | 獲取活動詳情 | 廟方管理員 |
| PUT | `/api/temple-admin/events/<id>/` | 更新活動 | 廟方管理員 |
| POST | `/api/temple-admin/events/<id>/publish/` | 發布活動 | 廟方管理員 |
| POST | `/api/temple-admin/events/<id>/close/` | 提前截止 | 廟方管理員 |
| POST | `/api/temple-admin/events/<id>/cancel/` | 取消活動 | 廟方管理員 |
| GET | `/api/temple-admin/events/<id>/registrations/` | 獲取報名名單 | 廟方管理員 |

---

## 🔒 權限檢查機制

### check_temple_permission(current_user, temple_id)
- 檢查使用者是否為該廟宇的管理員
- 查詢 `temple_admins` 表
- 條件：`user_id`, `temple_id`, `is_active=True`
- 所有 API 都使用此函數進行權限驗證
- **防止跨廟操作**

---

## ✅ 驗證規則實作

### 時間邏輯驗證
- ✅ `start_at < end_at`（結束時間晚於開始時間）
- ✅ `signup_end_at <= start_at`（報名截止不晚於開始）

### 數值驗證
- ✅ `capacity >= 1`（名額至少 1）
- ✅ `fee >= 0`（費用不可負數）

### 狀態轉換規則
- ✅ `draft -> published`（發布）
- ✅ `published -> closed`（提前截止）
- ✅ `published/closed -> canceled`（取消）
- ✅ 其他轉換皆拒絕並回傳錯誤

### 建立與更新限制
- ✅ `create` 固定 status='draft'
- ✅ `update` 不允許直接修改 status（需透過專用端點）

---

## 📤 回傳格式

### 列表回應（events & registrations）
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": 1,
        "templeId": 1,
        "title": "活動名稱",
        "status": "published",
        "registeredCount": 25,
        ...
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

### 詳情回應
```json
{
  "success": true,
  "data": {
    "id": 1,
    "templeId": 1,
    "title": "新春祈福法會",
    "description": "...",
    "location": "大殿",
    "startAt": "2026-02-01T09:00:00",
    "endAt": "2026-02-01T12:00:00",
    "signupEndAt": "2026-01-25T23:59:00",
    "capacity": 100,
    "fee": 0,
    "coverImageUrl": "https://...",
    "status": "published",
    "registeredCount": 45,
    "createdAt": "2025-12-15T10:00:00",
    "updatedAt": "2025-12-20T15:30:00"
  }
}
```

### 操作成功回應
```json
{
  "success": true,
  "message": "活動已發布",
  "data": { ... }
}
```

### 錯誤回應
```json
{
  "success": false,
  "message": "只有草稿狀態的活動可以發布"
}
```

---

## 🚀 部署與測試步驟

### 1. 執行資料庫遷移
```bash
cd backend
flask db upgrade
```

或直接執行 SQL：
```bash
mysql -u root -p temple_checkin < temple_events_init.sql
```

### 2. 啟動後端服務
```bash
cd backend
python run.py
```

### 3. 測試 API（使用 curl）
參考 `TEMPLE_EVENTS_API_TEST.md` 中的完整測試指南。

### 4. 切換前端到真實 API
修改 `frontend/src/services/templeEventsService.js`：
```javascript
const USE_MOCK = false; // 改為 false
```

### 5. 啟動前端
```bash
cd frontend
npm run dev
```

### 6. 瀏覽器測試
訪問：`http://localhost:5173/temple-admin/1/events`

---

## 🔧 CORS 與末尾斜線處理

### CORS 設定（已處理）
- 在 `app/__init__.py` 中已配置 CORS
- 允許所有來源 (`origins: "*"`)
- 允許方法：GET, POST, PUT, DELETE, OPTIONS
- 允許 headers：Content-Type, Authorization

### 末尾斜線規則（已遵守）
- ✅ 所有端點都以 `/` 結尾
- ✅ 符合專案既有規範
- 例如：`/api/temple-admin/events/`、`/api/temple-admin/events/<id>/`

---

## 📝 重要注意事項

### 1. 權限驗證
- 所有 API 都需要 JWT Token（`@token_required`）
- 廟方管理員只能操作自己廟宇的活動
- 透過 `check_temple_permission()` 實作權限檢查

### 2. 參數傳遞
- 前端必須在 list API 中傳遞 `temple_id` 參數
- 已在 `EventList.jsx` 中實作

### 3. 狀態轉換
- 嚴格遵守狀態機規則
- 無效轉換會回傳 400 錯誤

### 4. registeredCount 計算
- 在 `to_dict(include_registered_count=True)` 時動態計算
- 只計算 `status='registered'` 的報名記錄
- 列表與詳情 API 都有包含此欄位

### 5. 日期時間處理
- 使用 `datetime.fromisoformat()` 解析前端傳來的時間
- 支援 ISO 8601 格式（例如：`2026-01-15T14:00`）
- 回傳時使用 `.isoformat()` 轉換為字串

---

## ✨ 與前端整合狀況

### 已完成
- ✅ API 端點路徑與前端 service 一致
- ✅ 回傳格式符合前端預期
- ✅ 參數命名使用 camelCase（前端）與 snake_case（後端）的轉換
- ✅ 前端已更新，在呼叫 API 時傳遞 temple_id

### 前端切換步驟
1. 修改 `frontend/src/services/templeEventsService.js`
2. 將 `USE_MOCK = true` 改為 `USE_MOCK = false`
3. 重新啟動前端開發伺服器
4. 確保後端 API 正在運行

---

## 🧪 快速測試指令

```bash
# 1. 啟動 MySQL
# 確保 MySQL 服務正在運行

# 2. 執行遷移
cd backend
flask db upgrade

# 3. 啟動後端
python run.py

# 4. 新開 terminal，測試 API
export TOKEN="你的JWT_TOKEN"
curl -X GET "http://localhost:5000/api/temple-admin/events/?temple_id=1" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 📞 支援與問題排查

### 常見問題

**Q1: 回傳 403 Forbidden**
- 檢查 token 是否有效
- 確認使用者是該廟宇的管理員（查詢 temple_admins 表）

**Q2: 回傳 400 驗證錯誤**
- 檢查時間邏輯（start < end、signup_end <= start）
- 檢查數值範圍（capacity >= 1、fee >= 0）

**Q3: 狀態轉換失敗**
- 確認當前狀態符合轉換規則
- 參考「驗證規則」章節

**Q4: 找不到活動（404）**
- 確認活動 ID 正確
- 確認該活動屬於當前廟宇

---

## ✅ 功能完整度檢查表

- ✅ 8 個 API 端點全部實作
- ✅ 權限檢查機制
- ✅ 完整的驗證規則
- ✅ 狀態轉換邏輯
- ✅ 分頁與篩選支援
- ✅ registeredCount 動態計算
- ✅ 資料庫索引優化
- ✅ CORS 設定
- ✅ 末尾斜線規範
- ✅ 錯誤處理
- ✅ 文件與測試指南

---

**後端 API 已 100% 完成並可立即測試！** 🎉
