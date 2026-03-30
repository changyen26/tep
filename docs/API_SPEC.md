# API 規格書

後端提供 RESTful API，共約 105 個端點。Base URL: `/api`

Swagger UI: `GET /api/docs/`

## 通用規範

### 回應格式
```json
{
  "status": "success" | "error",
  "message": "說明文字",
  "data": { ... } | null
}
```

### 認證方式
```
Authorization: Bearer <access_token>
```

### 認證裝飾器
| 裝飾器 | 說明 |
|--------|------|
| `@token_required` | 任何已登入使用者（三類帳號皆可） |
| `@temple_admin_token_required` | 限廟方管理員 |
| `@super_admin_token_required` | 限系統管理員 |
| `@admin_required` | 舊版管理員驗證（已棄用） |

### 限流規則
| 端點 | 限制 |
|------|------|
| 全局 | 200 次/分鐘 |
| `POST /api/auth/register` | 3 次/分鐘 |
| `POST /api/auth/login` | 5 次/分鐘 |
| `POST /api/uploads/*` | 10 次/分鐘 |

---

## 1. 認證 `/api/auth`

| 方法 | 路徑 | 認證 | 說明 |
|------|------|------|------|
| POST | `/register` | 無 | 一般使用者註冊 |
| POST | `/login` | 無 | 統一登入 |
| GET | `/me` | token | 取得當前使用者 |
| PUT | `/change-password` | token | 修改密碼 |
| POST | `/refresh` | 無 | 刷新 Access Token |
| POST | `/logout` | token | 登出（撤銷 Refresh Token） |

### POST /register
```json
// Request
{ "name": "王小明", "email": "user@example.com", "password": "password123" }
// Response 201
{ "user": {...}, "token": "access_token", "refresh_token": "refresh_token", "account_type": "public" }
```

### POST /login
```json
// Request
{ "email": "user@example.com", "password": "password123", "login_type": "public|temple_admin|super_admin" }
// Response 200
{ "user": {...}, "token": "access_token", "refresh_token": "refresh_token", "account_type": "..." }
```

### POST /refresh
```json
// Request
{ "refresh_token": "..." }
// Response 200
{ "token": "new_access_token", "account_type": "..." }
```

### POST /logout
```json
// Request (可選)
{ "refresh_token": "..." }
// 不提供則撤銷該使用者所有 refresh token
```

---

## 2. 使用者 `/api/user`

全部需要 `@token_required`

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/profile` | 取得個人資料（含統計） |
| PUT | `/profile` | 更新個人資料 `{name}` |
| PUT | `/password` | 修改密碼 `{old_password, new_password}` |
| PUT | `/email` | 修改 Email `{email, password}` |
| DELETE | `/account` | 刪除帳號 `{password, confirmation: "DELETE"}` |
| GET | `/statistics` | 取得詳細統計 |

---

## 3. 廟宇 `/api/temples`

| 方法 | 路徑 | 認證 | 說明 |
|------|------|------|------|
| GET | `/` | 無 | 廟宇列表 `?search=&is_active=&limit=&offset=` |
| GET | `/:id` | 無 | 廟宇詳情 |
| GET | `/nearby` | 無 | 附近廟宇 `?latitude=&longitude=&radius=&limit=` |
| GET | `/nearby/available` | token | 附近未打卡廟宇 |
| POST | `/:id/checkin` | token | 打卡 `{amulet_id, checkin_method, latitude?, longitude?}` |
| GET | `/:id/my-checkins` | token | 我在此廟宇的打卡記錄 |
| POST | `/admin/temples` | admin | 新增廟宇 |
| PUT | `/admin/temples/:id` | admin | 更新廟宇 |
| DELETE | `/admin/temples/:id` | admin | 刪除廟宇 |

---

## 4. 平安符 `/api/amulet`

全部需要 `@token_required`

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/` | 建立平安符 |
| GET | `/` | 列表 `?status=` |
| GET | `/:id` | 詳情 |
| PATCH | `/:id` | 更新狀態 `{status}` |
| DELETE | `/:id` | 刪除 |
| GET | `/:id/temple-history` | 廟宇參拜歷史 |

---

## 5. 打卡 `/api/checkin`

全部需要 `@token_required`

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/` | 打卡 `{amulet_id, temple_id?}` |
| GET | `/` | 記錄列表 |
| GET | `/amulet/:id` | 特定平安符打卡 |
| GET | `/today` | 今日是否已打卡 `?amulet_id=` |
| GET | `/history` | 進階篩選 `?start_date=&end_date=&temple_id=&page=&per_page=` |
| GET | `/stats` | 打卡統計總覽 |
| GET | `/streak` | 連續打卡天數 |
| GET | `/monthly-stats` | 月度統計 `?year=&month=` |

---

## 6. 能量 `/api/energy`

全部需要 `@token_required`

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/add` | 增加能量 `{amulet_id, amount}` |
| POST | `/consume` | 消耗能量 `{amulet_id, amount}` |
| GET | `/logs` | 能量記錄 `?amulet_id=&limit=` |
| GET | `/amulet/:id` | 特定平安符能量記錄 |

---

## 7. 商品 `/api/products`

| 方法 | 路徑 | 認證 | 說明 |
|------|------|------|------|
| GET | `/` | 無 | 商品列表 `?page=&per_page=&category=&sort=&keyword=` |
| GET | `/:id` | 無 | 商品詳情 |
| GET | `/categories` | 無 | 商品分類 |
| POST | `/admin/products` | admin | 新增商品 |
| PUT | `/admin/products/:id` | admin | 更新商品 |
| DELETE | `/admin/products/:id` | admin | 軟刪除商品 |

---

## 8. 兌換 `/api/redemptions`

| 方法 | 路徑 | 認證 | 說明 |
|------|------|------|------|
| POST | `/` | token | 兌換商品 `{product_id, quantity, address_id, notes?}` |
| GET | `/` | token | 兌換記錄 `?page=&per_page=&status=` |
| GET | `/:id` | token | 兌換詳情 |
| POST | `/:id/cancel` | token | 取消兌換 |
| GET | `/stats` | token | 兌換統計 |
| GET | `/admin/redemptions` | admin | 管理員查詢 |
| PUT | `/admin/redemptions/:id/status` | admin | 更新狀態 `{status, tracking_number?}` |

---

## 9. 獎勵 `/api/rewards`

| 方法 | 路徑 | 認證 | 說明 |
|------|------|------|------|
| GET | `/` | 無 | 啟用中獎勵列表 |
| GET | `/temple/:id` | 無 | 廟宇獎勵規則 |
| GET | `/available` | token | 可領取的獎勵 |
| POST | `/:id/claim` | token | 領取獎勵 |
| GET | `/my-claims` | token | 領取歷史 |
| POST | `/` | token | 建立獎勵規則 |
| PUT | `/:id` | token | 更新規則 |
| DELETE | `/:id` | token | 刪除規則 |
| GET | `/:id` | token | 獎勵詳情 |
| GET | `/:id/statistics` | token | 獎勵統計 |

---

## 10. 地址 `/api/addresses`

全部需要 `@token_required`

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/` | 地址列表 |
| POST | `/` | 新增地址 `{recipient_name, phone, city, district, address}` |
| GET | `/:id` | 地址詳情 |
| PUT | `/:id` | 更新地址 |
| DELETE | `/:id` | 刪除地址 |
| PUT | `/:id/set-default` | 設為預設 |

---

## 11. 排行榜 `/api/leaderboard`

| 方法 | 路徑 | 認證 | 說明 |
|------|------|------|------|
| GET | `/blessing-points` | 無 | 功德值排行 `?limit=&period=all|week|month` |
| GET | `/checkins` | 無 | 打卡排行 |
| GET | `/temples` | 無 | 廟宇人氣排行 |
| GET | `/my-rank` | token | 我的排名 `?type=blessing_points|checkins` |

---

## 12. 通知 `/api/notifications`

全部需要 `@token_required`

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/` | 通知列表 `?page=&per_page=&is_read=&type=` |
| PUT | `/:id/read` | 標記已讀 |
| PUT | `/read-all` | 全部已讀 |
| DELETE | `/:id` | 刪除通知 |
| GET | `/unread-count` | 未讀數量 |
| GET | `/settings` | 通知設定 |
| PUT | `/settings` | 更新設定 |
| POST | `/batch-delete` | 批量刪除 `{notification_ids[]}` |
| DELETE | `/clear-read` | 清除已讀 |

---

## 13. 上傳 `/api/uploads`

| 方法 | 路徑 | 認證 | 說明 |
|------|------|------|------|
| POST | `/image` | token | 上傳圖片 FormData `{file, category}` |
| POST | `/product/:id/image` | admin | 上傳商品圖片 |
| POST | `/avatar` | token | 上傳頭像 |
| GET | `/:filename` | 無 | 存取檔案 |
| POST | `/delete` | token | 刪除檔案 `{file_path}` |

安全機制：Magic bytes MIME 驗證、路徑穿越防護 (`os.path.realpath`)

---

## 14. 廟方管理 API `/api/temple-admin/temples`

需要 `@token_required`，廟方管理員只能存取自己的廟宇

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/:templeId` | 廟宇資訊 |
| PUT | `/:templeId` | 更新廟宇資訊 |
| GET | `/:templeId/dashboard` | 儀表板數據 |
| GET | `/:templeId/checkins` | 打卡紀錄 |
| GET | `/:templeId/visitors` | 訪客統計 |
| GET | `/:templeId/products` | 商品管理 |
| POST | `/:templeId/products` | 新增商品 |
| PUT | `/:templeId/products/:id` | 更新商品 |
| GET | `/:templeId/orders` | 訂單列表 |
| PUT | `/:templeId/orders/:id/status` | 更新訂單狀態 |
| GET | `/:templeId/revenue` | 收入報表 |
| GET | `/:templeId/revenue/summary` | 收入摘要 |
| GET | `/:templeId/admins` | 管理員列表 |
| POST | `/:templeId/admins` | 新增管理員 |

---

## 15. 廟方活動管理 `/api/temple-admin/events`

需要 `@token_required`

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/` | 活動列表 `?temple_id=&status=&page=&pageSize=` |
| POST | `/` | 建立活動 |
| GET | `/:id` | 活動詳情 |
| PUT | `/:id` | 更新活動 |
| POST | `/:id/publish` | 發布活動 |
| POST | `/:id/close` | 截止報名 |
| POST | `/:id/cancel` | 取消活動 |
| GET | `/:id/registrations` | 報名名單 |

---

## 16. 廟方推播通知 `/api/temple-admin/notifications`

需要 `@token_required`

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/` | 通知列表 `?temple_id=&status=&page=&pageSize=` |
| POST | `/` | 建立通知 |
| GET | `/:id` | 通知詳情 |
| PUT | `/:id` | 編輯通知 |
| DELETE | `/:id` | 刪除草稿 |
| POST | `/:id/send` | 立即發送 |
| POST | `/:id/schedule` | 設定排程 `{scheduledAt}` |
| POST | `/:id/cancel-schedule` | 取消排程 |
| GET | `/audience-count` | 預估受眾 `?temple_id=&targetAudience=` |
| GET | `/templates` | 模板列表 |
| POST | `/templates` | 建立模板 |
| PUT | `/templates/:id` | 編輯模板 |
| DELETE | `/templates/:id` | 刪除模板 |

---

## 17. 公開活動 `/api/public`

無需認證

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/temples/:templeId/events` | 活動列表 |
| GET | `/events/:id` | 活動詳情 |
| POST | `/events/:id/register` | 報名 `{name, phone, email?, peopleCount?, lineUserId?}` |
| GET | `/registrations` | 查詢報名 `?line_uid=` |
| PUT | `/registrations/:id/cancel` | 取消報名 |

---

## 18. LINE Webhook `/api/line`

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/webhook` | LINE 事件入口（簽章驗證） |

處理事件：follow（加好友）、unfollow（封鎖）、message（文字訊息）、postback

---

## 19. 系統統計 `/api/stats`

需要 `@admin_required`（除 `/my/summary`）

| 方法 | 路徑 | 認證 | 說明 |
|------|------|------|------|
| GET | `/dashboard` | admin | 系統儀表板 |
| GET | `/products/top-selling` | admin | 熱銷商品 |
| GET | `/products/low-stock` | admin | 庫存預警 |
| GET | `/users/active` | admin | 活躍用戶 |
| GET | `/users/top-spenders` | admin | 消費排行 |
| GET | `/redemptions/trend` | admin | 兌換趨勢 |
| GET | `/redemptions/status-distribution` | admin | 訂單狀態分布 |
| GET | `/points/flow` | admin | 功德值流向 |
| GET | `/my/summary` | token | 個人統計 |

---

## 20. 資料匯出 `/api/temple-export`

需要 `@token_required`，回傳 CSV 檔案

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/:templeId/checkins` | 匯出簽到 `?start_date=&end_date=` |
| GET | `/:templeId/orders` | 匯出訂單 `?start_date=&end_date=&status=` |
| GET | `/:templeId/revenue` | 匯出收入 `?start_date=&end_date=` |
