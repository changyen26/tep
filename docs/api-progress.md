# API 進度追蹤文檔

最後更新: 2025-12-05

## 目錄
- [認證 API](#認證-api)
- [用戶 API](#用戶-api)
- [護身符 API](#護身符-api)
- [簽到 API](#簽到-api)
- [能量 API](#能量-api)
- [廟宇 API](#廟宇-api)
- [商品 API](#商品-api)
- [收件地址 API](#收件地址-api)
- [兌換功能 API](#兌換功能-api)
- [檔案上傳 API](#檔案上傳-api)
- [統計分析 API](#統計分析-api)
- [排行榜 API](#排行榜-api)
- [打卡獎勵 API](#打卡獎勵-api)

---

## 認證 API

### 用戶註冊
- **Method**: POST
- **Path**: `/api/auth/register`
- **Description**: 用戶註冊
- **Params**:
  ```json
  {
    "name": "使用者名稱",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": { ... },
      "token": "jwt_token"
    },
    "message": "註冊成功"
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/auth.py:18`

### 用戶登入
- **Method**: POST
- **Path**: `/api/auth/login`
- **Description**: 用戶登入
- **Params**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": { ... },
      "token": "jwt_token"
    },
    "message": "登入成功"
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/auth.py:52`

### 獲取當前用戶資訊
- **Method**: GET
- **Path**: `/api/auth/me`
- **Description**: 獲取當前登入用戶資訊
- **Params**:
  - Header: `Authorization: Bearer <token>`
- **Response**: 用戶資訊物件
- **Status**: Done
- **Source**: `backend/app/routes/auth.py:79`

---

## 用戶 API

### 獲取個人資料
- **Method**: GET
- **Path**: `/api/user/profile`
- **Description**: 獲取當前用戶的完整個人資料及統計資訊
- **Params**:
  - Header: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": 1,
    "name": "Updated Name",
    "email": "test@example.com",
    "role": "admin",
    "blessing_points": 1000,
    "created_at": "2025-12-03T12:19:05",
    "statistics": {
      "total_amulets": 1,
      "total_checkins": 1,
      "total_redemptions": 1
    }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/user.py:12`

### 更新個人資料
- **Method**: PUT
- **Path**: `/api/user/profile`
- **Description**: 更新用戶個人資料（目前僅支援名稱）
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "name": "新名稱"
    }
    ```
- **Response**: 更新後的用戶資訊
- **Status**: Done
- **Source**: `backend/app/routes/user.py:38`

### 修改密碼
- **Method**: PUT
- **Path**: `/api/user/password`
- **Description**: 修改用戶密碼
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "old_password": "舊密碼",
      "new_password": "新密碼"
    }
    ```
- **Response**: `null`
- **Status**: Done
- **Source**: `backend/app/routes/user.py:66`

### 修改 Email
- **Method**: PUT
- **Path**: `/api/user/email`
- **Description**: 修改用戶 Email
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "email": "new@example.com",
      "password": "密碼驗證"
    }
    ```
- **Response**:
  ```json
  {
    "email": "new@example.com"
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/user.py:110`

### 刪除帳號
- **Method**: DELETE
- **Path**: `/api/user/account`
- **Description**: 刪除用戶帳號（硬刪除，級聯刪除所有關聯資料）
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "password": "密碼驗證",
      "confirmation": "DELETE"
    }
    ```
- **Response**:
  ```json
  {
    "deleted_email": "user@example.com"
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/user.py:159`

### 獲取用戶統計
- **Method**: GET
- **Path**: `/api/user/statistics`
- **Description**: 獲取用戶的詳細統計資訊
- **Params**:
  - Header: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "amulets": {
      "total": 1,
      "active": 1
    },
    "checkins": {
      "total": 1
    },
    "redemptions": {
      "total": 1,
      "pending": 0,
      "completed": 0
    },
    "blessing_points": {
      "current": 1000,
      "total_used": 0
    }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/user.py:208`

---

## 護身符 API

### 創建護身符
- **Method**: POST
- **Path**: `/api/amulet/`
- **Description**: 創建新的護身符
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "energy": 0  // 可選，預設為 0
    }
    ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "user_id": 1,
      "energy": 0,
      "status": "active",
      "created_at": "2025-12-04T12:00:00"
    }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/amulet.py:18`

### 獲取護身符列表
- **Method**: GET
- **Path**: `/api/amulet/`
- **Description**: 獲取當前用戶的所有護身符
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Query: `?status=active` (可選)
- **Response**:
  ```json
  {
    "amulets": [...],
    "count": 5
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/amulet.py:43`

### 獲取單個護身符
- **Method**: GET
- **Path**: `/api/amulet/<amulet_id>`
- **Description**: 獲取指定護身符詳情
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `amulet_id` (整數)
- **Response**: 護身符物件
- **Status**: Done
- **Source**: `backend/app/routes/amulet.py:64`

### 更新護身符狀態
- **Method**: PATCH
- **Path**: `/api/amulet/<amulet_id>`
- **Description**: 更新護身符狀態
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `amulet_id` (整數)
  - Body:
    ```json
    {
      "status": "inactive"  // active, inactive, expired
    }
    ```
- **Response**: 更新後的護身符物件
- **Status**: Done
- **Source**: `backend/app/routes/amulet.py:85`

### 刪除護身符
- **Method**: DELETE
- **Path**: `/api/amulet/<amulet_id>`
- **Description**: 刪除指定護身符
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `amulet_id` (整數)
- **Response**: `null`
- **Status**: Done
- **Source**: `backend/app/routes/amulet.py:114`

---

## 簽到 API

### 創建簽到記錄
- **Method**: POST
- **Path**: `/api/checkin/`
- **Description**: 創建簽到記錄（每次簽到增加 10 點能量）
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "amulet_id": 1
    }
    ```
- **Response**:
  ```json
  {
    "checkin": { ... },
    "amulet": { ... },
    "energy_added": 10
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/checkin.py:19`

### 獲取簽到記錄
- **Method**: GET
- **Path**: `/api/checkin/`
- **Description**: 獲取用戶的簽到記錄
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Query: `?amulet_id=1&limit=10` (可選)
- **Response**:
  ```json
  {
    "checkins": [...],
    "count": 10
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/checkin.py:75`

### 獲取護身符簽到記錄
- **Method**: GET
- **Path**: `/api/checkin/amulet/<amulet_id>`
- **Description**: 獲取指定護身符的簽到記錄
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `amulet_id` (整數)
- **Response**:
  ```json
  {
    "amulet": { ... },
    "checkins": [...],
    "count": 10
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/checkin.py:101`

### 檢查今日簽到狀態
- **Method**: GET
- **Path**: `/api/checkin/today`
- **Description**: 檢查今天是否已簽到
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Query: `?amulet_id=1` (必需)
- **Response**:
  ```json
  {
    "checked_in": true,
    "checkin": { ... }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/checkin.py:133`

### 打卡歷史查詢（進階）
- **Method**: GET
- **Path**: `/api/checkin/history`
- **Description**: 獲取打卡歷史記錄（支援日期範圍、廟宇、護身符篩選及分頁）
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Query:
    - `start_date`: 開始日期 YYYY-MM-DD (可選)
    - `end_date`: 結束日期 YYYY-MM-DD (可選)
    - `temple_id`: 廟宇 ID (可選)
    - `amulet_id`: 護身符 ID (可選)
    - `page`: 頁碼 (default: 1)
    - `per_page`: 每頁數量 (default: 20, max: 100)
- **Response**:
  ```json
  {
    "checkins": [...],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 50,
      "pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/checkin.py:167`

### 打卡統計總覽
- **Method**: GET
- **Path**: `/api/checkin/stats`
- **Description**: 獲取用戶的打卡統計總覽
- **Params**:
  - Header: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "total_checkins": 100,
    "total_temples": 15,
    "total_blessing_points": 1000,
    "current_streak": 7,
    "longest_streak": 30,
    "top_temples": [
      {
        "temple_id": 1,
        "temple_name": "龍山寺",
        "visit_count": 20
      }
    ],
    "this_month": {
      "checkins": 15,
      "blessing_points": 150
    }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/checkin.py:247`

### 連續打卡天數
- **Method**: GET
- **Path**: `/api/checkin/streak`
- **Description**: 獲取連續打卡天數及最近打卡日期
- **Params**:
  - Header: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "current_streak": 7,
    "longest_streak": 30,
    "recent_checkin_dates": ["2025-12-05", "2025-12-04", ...]
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/checkin.py:329`

### 月度打卡統計
- **Method**: GET
- **Path**: `/api/checkin/monthly-stats`
- **Description**: 獲取特定月份的打卡統計
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Query:
    - `year`: 年份 (default: 當前年份)
    - `month`: 月份 1-12 (default: 當前月份)
- **Response**:
  ```json
  {
    "year": 2025,
    "month": 12,
    "total_checkins": 15,
    "total_blessing_points": 150,
    "daily_stats": [
      {
        "date": "2025-12-01",
        "checkin_count": 2,
        "blessing_points": 20
      }
    ]
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/checkin.py:361`

---

## 能量 API

### 增加能量
- **Method**: POST
- **Path**: `/api/energy/add`
- **Description**: 手動增加護身符能量
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "amulet_id": 1,
      "amount": 50
    }
    ```
- **Response**:
  ```json
  {
    "amulet": { ... },
    "energy_log": { ... }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/energy.py:19`

### 消耗能量
- **Method**: POST
- **Path**: `/api/energy/consume`
- **Description**: 消耗護身符能量
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "amulet_id": 1,
      "amount": 20
    }
    ```
- **Response**:
  ```json
  {
    "amulet": { ... },
    "energy_log": { ... }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/energy.py:62`

### 獲取能量記錄
- **Method**: GET
- **Path**: `/api/energy/logs`
- **Description**: 獲取能量變動記錄
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Query: `?amulet_id=1&limit=50` (可選)
- **Response**:
  ```json
  {
    "logs": [...],
    "count": 50
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/energy.py:103`

### 獲取護身符能量統計
- **Method**: GET
- **Path**: `/api/energy/amulet/<amulet_id>`
- **Description**: 獲取指定護身符的能量記錄和統計
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `amulet_id` (整數)
- **Response**:
  ```json
  {
    "amulet": { ... },
    "logs": [...],
    "count": 50,
    "statistics": {
      "total_added": 500,
      "total_consumed": 200,
      "current_energy": 300
    }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/energy.py:132`

---

## 廟宇 API

### 獲取廟宇列表
- **Method**: GET
- **Path**: `/api/temples/`
- **Description**: 獲取廟宇列表（公開）
- **Params**:
  - Query:
    - `is_active`: 是否啟用 (true/false)
    - `search`: 搜索關鍵字
    - `limit`: 每頁數量 (default: 50)
    - `offset`: 偏移量 (default: 0)
- **Response**:
  ```json
  {
    "temples": [...],
    "total": 100,
    "limit": 50,
    "offset": 0
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/temple.py:18`

### 獲取廟宇詳情
- **Method**: GET
- **Path**: `/api/temples/<temple_id>`
- **Description**: 獲取廟宇詳細資訊（公開）
- **Params**:
  - Path: `temple_id` (整數)
- **Response**: 廟宇詳情物件（包含 checkin_count）
- **Status**: Done
- **Source**: `backend/app/routes/temple.py:54`

### 獲取附近廟宇
- **Method**: GET
- **Path**: `/api/temples/nearby`
- **Description**: 根據經緯度獲取附近廟宇（公開）
- **Params**:
  - Query:
    - `latitude`: 當前緯度 (必需)
    - `longitude`: 當前經度 (必需)
    - `radius`: 搜索半徑（公里）(default: 10)
    - `limit`: 返回數量 (default: 20)
- **Response**:
  ```json
  {
    "temples": [...],
    "count": 15,
    "search_center": {
      "latitude": 25.0330,
      "longitude": 121.5654
    },
    "radius": 10
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/temple.py:82`

### [管理員] 創建廟宇
- **Method**: POST
- **Path**: `/api/temples/admin/temples`
- **Description**: 創建新廟宇（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Body:
    ```json
    {
      "name": "廟宇名稱",
      "address": "廟宇地址",
      "latitude": 25.0330,
      "longitude": 121.5654,
      "main_deity": "主祀神明",
      "description": "廟宇描述",
      "nfc_uid": "NFC UID (可選)"
    }
    ```
- **Response**: 廟宇物件
- **Status**: Done
- **Source**: `backend/app/routes/temple.py:148`

### [管理員] 更新廟宇
- **Method**: PUT
- **Path**: `/api/temples/admin/temples/<temple_id>`
- **Description**: 更新廟宇資訊（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Path: `temple_id` (整數)
  - Body: 與創建相同的欄位（可選更新）
- **Response**: 更新後的廟宇物件
- **Status**: Done
- **Source**: `backend/app/routes/temple.py:184`

### [管理員] 刪除廟宇
- **Method**: DELETE
- **Path**: `/api/temples/admin/temples/<temple_id>`
- **Description**: 刪除廟宇（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Path: `temple_id` (整數)
- **Response**: `null`
- **Status**: Done
- **Source**: `backend/app/routes/temple.py:220`

---

## 商品 API

### 獲取商品列表
- **Method**: GET
- **Path**: `/api/products/`
- **Description**: 獲取商品列表（公開）
- **Params**:
  - Query:
    - `page`: 頁碼 (default: 1)
    - `per_page`: 每頁數量 (default: 20)
    - `category`: 商品分類篩選
    - `sort`: 排序方式 (newest/price_asc/price_desc/popular)
    - `is_active`: 是否啟用 (default: true)
- **Response**:
  ```json
  {
    "products": [...],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 100,
      "pages": 5
    }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/product.py:19`

### 獲取商品詳情
- **Method**: GET
- **Path**: `/api/products/<product_id>`
- **Description**: 獲取商品詳細資訊（公開）
- **Params**:
  - Path: `product_id` (整數)
- **Response**: 商品詳情物件（包含 redemption_count）
- **Status**: Done
- **Source**: `backend/app/routes/product.py:72`

### 獲取商品分類列表
- **Method**: GET
- **Path**: `/api/products/categories`
- **Description**: 獲取所有商品分類及數量（公開）
- **Params**: 無
- **Response**:
  ```json
  [
    {
      "category": "charm",
      "name": "吊飾",
      "count": 10
    }
  ]
  ```
- **Status**: Done
- **Source**: `backend/app/routes/product.py:92`

### [管理員] 創建商品
- **Method**: POST
- **Path**: `/api/products/admin/products`
- **Description**: 創建新商品（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Body:
    ```json
    {
      "name": "商品名稱",
      "description": "商品描述",
      "category": "charm",
      "merit_points": 100,
      "stock_quantity": 50,
      "image_url": "圖片URL",
      "images": ["圖片1", "圖片2"],
      "is_featured": false
    }
    ```
- **Response**: 商品物件
- **Status**: Done
- **Source**: `backend/app/routes/product.py:117`

### [管理員] 更新商品
- **Method**: PUT
- **Path**: `/api/products/admin/products/<product_id>`
- **Description**: 更新商品資訊（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Path: `product_id` (整數)
  - Body: 與創建相同的欄位（可選更新）
- **Response**: 更新後的商品物件
- **Status**: Done
- **Source**: `backend/app/routes/product.py:154`

### [管理員] 刪除商品
- **Method**: DELETE
- **Path**: `/api/products/admin/products/<product_id>`
- **Description**: 刪除商品（軟刪除，設為不啟用）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Path: `product_id` (整數)
- **Response**: `null`
- **Status**: Done
- **Source**: `backend/app/routes/product.py:191`

---

## 收件地址 API

### 獲取地址列表
- **Method**: GET
- **Path**: `/api/addresses/`
- **Description**: 獲取當前用戶的所有收件地址
- **Params**:
  - Header: `Authorization: Bearer <token>`
- **Response**: 地址陣列（按預設和創建時間排序）
- **Status**: Done
- **Source**: `backend/app/routes/address.py:18`

### 獲取地址詳情
- **Method**: GET
- **Path**: `/api/addresses/<address_id>`
- **Description**: 獲取指定地址詳情
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `address_id` (整數)
- **Response**: 地址物件
- **Status**: Done
- **Source**: `backend/app/routes/address.py:36`

### 新增地址
- **Method**: POST
- **Path**: `/api/addresses/`
- **Description**: 新增收件地址
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "recipient_name": "王小明",
      "phone": "0912345678",
      "postal_code": "100",
      "city": "台北市",
      "district": "中正區",
      "address": "重慶南路一段122號",
      "is_default": false
    }
    ```
- **Response**: 新創建的地址物件
- **Status**: Done
- **Source**: `backend/app/routes/address.py:56`

### 更新地址
- **Method**: PUT
- **Path**: `/api/addresses/<address_id>`
- **Description**: 更新收件地址
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `address_id` (整數)
  - Body: 與新增相同的欄位（可選更新）
- **Response**: 更新後的地址物件
- **Status**: Done
- **Source**: `backend/app/routes/address.py:107`

### 刪除地址
- **Method**: DELETE
- **Path**: `/api/addresses/<address_id>`
- **Description**: 刪除收件地址
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `address_id` (整數)
- **Response**: `null`
- **Status**: Done
- **Source**: `backend/app/routes/address.py:149`

### 設定預設地址
- **Method**: PUT
- **Path**: `/api/addresses/<address_id>/set-default`
- **Description**: 設定為預設收件地址
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `address_id` (整數)
- **Response**: 更新後的地址物件
- **Status**: Done
- **Source**: `backend/app/routes/address.py:170`

---

## 兌換功能 API

### 兌換商品
- **Method**: POST
- **Path**: `/api/redemptions/`
- **Description**: 使用功德值兌換商品
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "product_id": 1,
      "quantity": 1,
      "address_id": 1,
      "notes": "請小心包裝"
    }
    ```
- **Response**:
  ```json
  {
    "redemption": { ... },
    "remaining_points": 500
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/redemption.py:20`

### 獲取兌換記錄
- **Method**: GET
- **Path**: `/api/redemptions/`
- **Description**: 獲取當前用戶的兌換記錄
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Query:
    - `page`: 頁碼 (default: 1)
    - `per_page`: 每頁數量 (default: 20)
    - `status`: 狀態篩選
- **Response**:
  ```json
  {
    "redemptions": [...],
    "pagination": { ... }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/redemption.py:85`

### 獲取兌換詳情
- **Method**: GET
- **Path**: `/api/redemptions/<redemption_id>`
- **Description**: 獲取指定兌換詳情
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `redemption_id` (整數)
- **Response**: 兌換詳情物件
- **Status**: Done
- **Source**: `backend/app/routes/redemption.py:124`

### 取消兌換
- **Method**: POST
- **Path**: `/api/redemptions/<redemption_id>/cancel`
- **Description**: 取消兌換訂單並退還功德值
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `redemption_id` (整數)
- **Response**:
  ```json
  {
    "refunded_points": 100,
    "current_points": 600
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/redemption.py:149`

### 獲取兌換統計
- **Method**: GET
- **Path**: `/api/redemptions/stats`
- **Description**: 獲取當前用戶的兌換統計資訊
- **Params**:
  - Header: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "total_redemptions": 10,
    "total_points_used": 1000,
    "status_count": { ... },
    "recent_redemptions": [...]
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/redemption.py:197`

### [管理員] 獲取所有兌換記錄
- **Method**: GET
- **Path**: `/api/redemptions/admin/redemptions`
- **Description**: 獲取所有用戶的兌換記錄（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Query:
    - `page`, `per_page`, `status`, `user_id`
- **Response**: 與用戶端相同的分頁格式
- **Status**: Done
- **Source**: `backend/app/routes/redemption.py:236`

### [管理員] 更新兌換狀態
- **Method**: PUT
- **Path**: `/api/redemptions/admin/redemptions/<redemption_id>/status`
- **Description**: 更新兌換訂單狀態（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Path: `redemption_id` (整數)
  - Body:
    ```json
    {
      "status": "shipped",
      "tracking_number": "1234567890",
      "shipping_method": "宅配",
      "admin_notes": "已於今日出貨"
    }
    ```
- **Response**: 更新後的兌換物件
- **Status**: Done
- **Source**: `backend/app/routes/redemption.py:279`

---

## 檔案上傳 API

### 通用圖片上傳
- **Method**: POST
- **Path**: `/api/uploads/image`
- **Description**: 上傳圖片（自動壓縮並按用戶ID分類）
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Content-Type: `multipart/form-data`
  - Form Data:
    - `file`: 圖片檔案
    - `category`: 分類 (products, avatars, temp) 預設: temp
- **Response**:
  ```json
  {
    "filename": "...",
    "original_filename": "...",
    "path": "...",
    "size": 12345,
    "url": "/uploads/...",
    "user_id": 1
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/upload.py:18`

### [管理員] 上傳商品圖片
- **Method**: POST
- **Path**: `/api/uploads/product/<product_id>/image`
- **Description**: 上傳商品圖片並更新商品（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Content-Type: `multipart/form-data`
  - Path: `product_id` (整數)
  - Form Data: `file`: 圖片檔案
- **Response**:
  ```json
  {
    "product_id": 1,
    "image_url": "/uploads/...",
    "file_info": { ... }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/upload.py:58`

### 上傳用戶頭像
- **Method**: POST
- **Path**: `/api/uploads/avatar`
- **Description**: 上傳用戶頭像
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Content-Type: `multipart/form-data`
  - Form Data: `file`: 圖片檔案
- **Response**:
  ```json
  {
    "image_url": "/uploads/...",
    "file_info": { ... }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/upload.py:111`

### 訪問上傳檔案
- **Method**: GET
- **Path**: `/api/uploads/<filename>`
- **Description**: 訪問上傳的檔案（公開）
- **Params**:
  - Path: `filename` (檔案路徑)
- **Response**: 檔案內容
- **Status**: Done
- **Source**: `backend/app/routes/upload.py:158`

### 刪除上傳檔案
- **Method**: POST
- **Path**: `/api/uploads/delete`
- **Description**: 刪除上傳的檔案
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "file_path": "products/filename.jpg"
    }
    ```
- **Response**: `null`
- **Status**: Done
- **Source**: `backend/app/routes/upload.py:169`

---

## 統計分析 API

### [管理員] 儀表板總覽
- **Method**: GET
- **Path**: `/api/stats/dashboard`
- **Description**: 獲取管理員儀表板統計總覽（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
- **Response**:
  ```json
  {
    "users": {
      "total": 1000,
      "new_today": 5
    },
    "products": {
      "total": 50,
      "active": 45,
      "low_stock": 3,
      "out_of_stock": 2
    },
    "redemptions": {
      "total": 500,
      "pending": 10,
      "today": 15
    },
    "points": {
      "total_used": 50000,
      "today_used": 1500
    }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/stats.py:18`

### [管理員] 熱門商品排行
- **Method**: GET
- **Path**: `/api/stats/products/top-selling`
- **Description**: 獲取熱門商品排行榜（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Query:
    - `limit`: 數量限制 (default: 10)
    - `days`: 天數範圍 (default: 30)
- **Response**:
  ```json
  {
    "products": [...],
    "period_days": 30
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/stats.py:113`

### [管理員] 庫存預警商品列表
- **Method**: GET
- **Path**: `/api/stats/products/low-stock`
- **Description**: 獲取庫存低於警戒值的商品（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Query:
    - `threshold`: 庫存警戒值 (default: 10)
- **Response**:
  ```json
  {
    "products": [...],
    "threshold": 10,
    "count": 5
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/stats.py:175`

### [管理員] 活躍用戶統計
- **Method**: GET
- **Path**: `/api/stats/users/active`
- **Description**: 獲取活躍用戶統計（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Query:
    - `days`: 天數範圍 (default: 7)
- **Response**:
  ```json
  {
    "period_days": 7,
    "total_users": 1000,
    "new_users": 20,
    "active_by_redemption": 50,
    "active_by_checkin": 80
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/stats.py:207`

### [管理員] 消費排行榜
- **Method**: GET
- **Path**: `/api/stats/users/top-spenders`
- **Description**: 獲取消費功德值排行榜（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Query:
    - `limit`: 數量限制 (default: 10)
    - `days`: 天數範圍 (0 表示全部，default: 0)
- **Response**:
  ```json
  {
    "users": [...],
    "period_days": "all"
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/stats.py:254`

### [管理員] 兌換趨勢統計
- **Method**: GET
- **Path**: `/api/stats/redemptions/trend`
- **Description**: 獲取兌換趨勢統計（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Query:
    - `days`: 天數範圍 (default: 30)
- **Response**:
  ```json
  {
    "trend": [
      {
        "date": "2025-01-01",
        "count": 10,
        "points": 1000
      }
    ],
    "period_days": 30
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/stats.py:307`

### [管理員] 訂單狀態分布
- **Method**: GET
- **Path**: `/api/stats/redemptions/status-distribution`
- **Description**: 獲取訂單狀態分布統計（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
- **Response**:
  ```json
  [
    {
      "status": "pending",
      "count": 10,
      "total_points": 1000
    }
  ]
  ```
- **Status**: Done
- **Source**: `backend/app/routes/stats.py:351`

### [管理員] 功德值流向統計
- **Method**: GET
- **Path**: `/api/stats/points/flow`
- **Description**: 獲取功德值收入/支出流向統計（需要管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (管理員)
  - Query:
    - `days`: 天數範圍 (default: 30)
- **Response**:
  ```json
  {
    "summary": {
      "total_earned": 100000,
      "total_spent": 50000,
      "net_flow": 50000
    },
    "daily_flow": [...],
    "period_days": 30
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/stats.py:379`

### 我的統計總覽
- **Method**: GET
- **Path**: `/api/stats/my/summary`
- **Description**: 獲取當前用戶的統計總覽
- **Params**:
  - Header: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "blessing_points": 500,
    "total_redemptions": 10,
    "total_points_used": 1000,
    "total_checkins": 50,
    "consecutive_checkin_days": 7
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/stats.py:448`

---

## 前端 API 整合狀態

### 已實作的前端 API 模組
- ✅ `authAPI` - 認證相關
- ✅ `amuletAPI` - 護身符管理
- ✅ `checkinAPI` - 簽到功能
- ✅ `energyAPI` - 能量管理
- ✅ `productAPI` - 商品瀏覽（部分）
- ✅ `addressAPI` - 收件地址管理
- ✅ `redemptionAPI` - 兌換功能（部分）

### 未實作的前端 API 模組
- ❌ `templeAPI` - 廟宇相關（後端已完成）
- ❌ `uploadAPI` - 檔案上傳（後端已完成）
- ❌ `statsAPI` - 統計分析（後端已完成）
- ❌ `userAPI` - 用戶管理（後端未實作）
- ❌ 管理員功能的前端介面

**Source**: `frontend/src/api/index.js`

---

## 排行榜 API

### 功德值排行榜
- **Method**: GET
- **Path**: `/api/leaderboard/blessing-points`
- **Description**: 獲取功德值排行榜
- **Params**:
  - Query:
    - `limit`: 返回數量 (default: 10, max: 100)
    - `period`: 時間範圍 all/week/month (default: all)
- **Response**:
  ```json
  {
    "period": "all",
    "leaderboard": [
      {
        "rank": 1,
        "user_id": 1,
        "user_name": "王小明",
        "blessing_points": 5000
      }
    ],
    "count": 10
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/leaderboard.py:13`

### 打卡次數排行榜
- **Method**: GET
- **Path**: `/api/leaderboard/checkins`
- **Description**: 獲取打卡次數排行榜
- **Params**:
  - Query:
    - `limit`: 返回數量 (default: 10, max: 100)
    - `period`: 時間範圍 all/week/month (default: all)
- **Response**:
  ```json
  {
    "period": "week",
    "leaderboard": [
      {
        "rank": 1,
        "user_id": 1,
        "user_name": "王小明",
        "checkin_count": 150
      }
    ],
    "count": 10
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/leaderboard.py:109`

### 廟宇人氣排行榜
- **Method**: GET
- **Path**: `/api/leaderboard/temples`
- **Description**: 獲取廟宇人氣排行榜
- **Params**:
  - Query:
    - `limit`: 返回數量 (default: 10, max: 100)
    - `period`: 時間範圍 all/week/month (default: all)
- **Response**:
  ```json
  {
    "period": "month",
    "leaderboard": [
      {
        "rank": 1,
        "temple_id": 1,
        "temple_name": "龍山寺",
        "main_deity": "觀音菩薩",
        "visit_count": 500,
        "unique_visitors": 250
      }
    ],
    "count": 10
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/leaderboard.py:165`

### 查詢我的排名
- **Method**: GET
- **Path**: `/api/leaderboard/my-rank`
- **Description**: 查詢當前使用者的排名
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Query:
    - `type`: 排行榜類型 blessing_points/checkins (default: blessing_points)
- **Response**:
  ```json
  {
    "type": "blessing_points",
    "my_rank": 15,
    "my_value": 1500
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/leaderboard.py:220`

---

## 打卡獎勵 API

### 創建獎勵規則
- **Method**: POST
- **Path**: `/api/rewards/`
- **Description**: 創建獎勵規則（需廟方管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>` (廟方管理員或系統管理員)
  - Body:
    ```json
    {
      "temple_id": 1,  // 可選，NULL 表示全站通用
      "name": "連續打卡7天獎勵",
      "description": "連續打卡7天可獲得額外福德點數",
      "reward_type": "consecutive_days",  // consecutive_days, total_count, first_time, daily_bonus
      "condition_value": 7,
      "reward_points": 100,
      "is_repeatable": true,
      "start_date": "2025-01-01T00:00:00",  // 可選
      "end_date": "2025-12-31T23:59:59"  // 可選
    }
    ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "temple_id": 1,
      "temple_name": "龍山寺",
      "name": "連續打卡7天獎勵",
      "reward_type": "consecutive_days",
      "condition_value": 7,
      "reward_points": 100,
      "is_repeatable": true,
      ...
    },
    "message": "獎勵規則創建成功"
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/reward.py:14`

### 獲取廟宇獎勵規則列表
- **Method**: GET
- **Path**: `/api/rewards/temple/<temple_id>`
- **Description**: 獲取廟宇獎勵規則列表（公開）
- **Params**:
  - Path: `temple_id` (整數)
  - Query: `?is_active=true` (可選)
- **Response**:
  ```json
  {
    "temple": { ... },
    "rewards": [ ... ],
    "count": 5
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/reward.py:119`

### 獲取獎勵規則詳情
- **Method**: GET
- **Path**: `/api/rewards/<reward_id>`
- **Description**: 獲取獎勵規則詳情（需廟方管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `reward_id` (整數)
- **Response**:
  ```json
  {
    "id": 1,
    "name": "連續打卡7天獎勵",
    "statistics": {
      "total_claims": 50,
      "total_points_given": 5000
    },
    ...
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/reward.py:167`

### 更新獎勵規則
- **Method**: PUT
- **Path**: `/api/rewards/<reward_id>`
- **Description**: 更新獎勵規則（需廟方管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `reward_id` (整數)
  - Body: 與創建相同的欄位（可選更新）
- **Response**: 更新後的獎勵規則物件
- **Status**: Done
- **Source**: `backend/app/routes/reward.py:215`

### 刪除獎勵規則
- **Method**: DELETE
- **Path**: `/api/rewards/<reward_id>`
- **Description**: 刪除獎勵規則（軟刪除，需廟方管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `reward_id` (整數)
- **Response**: `null`
- **Status**: Done
- **Source**: `backend/app/routes/reward.py:283`

### 獲取獎勵發放統計
- **Method**: GET
- **Path**: `/api/rewards/<reward_id>/statistics`
- **Description**: 獲取獎勵發放統計（需廟方管理員權限）
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `reward_id` (整數)
  - Query: `?days=30` (統計天數，default: 30)
- **Response**:
  ```json
  {
    "reward": { ... },
    "summary": {
      "total_claims": 100,
      "total_points_given": 10000,
      "unique_users": 80
    },
    "period_stats": {
      "days": 30,
      "claims": 50,
      "points_given": 5000
    },
    "daily_trend": [ ... ]
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/reward.py:319`

### 獲取所有獎勵規則
- **Method**: GET
- **Path**: `/api/rewards/`
- **Description**: 獲取所有啟用的獎勵規則（公開）
- **Params**:
  - Query:
    - `temple_id`: 廟宇 ID (可選)
    - `reward_type`: 獎勵類型 (可選)
    - `page`: 頁碼 (default: 1)
    - `per_page`: 每頁數量 (default: 20, max: 100)
- **Response**:
  ```json
  {
    "rewards": [ ... ],
    "pagination": { ... }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/reward.py:393`

### 查看可領取的獎勵
- **Method**: GET
- **Path**: `/api/rewards/available`
- **Description**: 查看當前使用者可領取的獎勵
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Query: `?temple_id=1` (可選)
- **Response**:
  ```json
  {
    "rewards": [
      {
        "id": 1,
        "name": "連續打卡7天獎勵",
        "progress": {
          "current": 7,
          "required": 7
        },
        ...
      }
    ],
    "count": 3
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/reward.py:437`

### 領取獎勵
- **Method**: POST
- **Path**: `/api/rewards/<reward_id>/claim`
- **Description**: 手動領取指定獎勵
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `reward_id` (整數)
- **Response**:
  ```json
  {
    "claim": { ... },
    "new_blessing_points": 1500,
    "points_received": 100
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/reward.py:481`

### 獲取我的獎勵領取歷史
- **Method**: GET
- **Path**: `/api/rewards/my-claims`
- **Description**: 獲取個人的獎勵領取記錄
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Query:
    - `page`: 頁碼 (default: 1)
    - `per_page`: 每頁數量 (default: 20, max: 100)
    - `reward_type`: 獎勵類型篩選 (可選)
- **Response**:
  ```json
  {
    "claims": [ ... ],
    "pagination": { ... },
    "summary": {
      "total_claims": 10,
      "total_points_received": 1000
    }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/reward.py:533`

---

## 系統管理員 API

### 管理員登入
- **Method**: POST
- **Path**: `/api/admin/login`
- **Description**: 系統管理員登入
- **Params**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "admin_jwt_token",
    "admin": { ... }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:23`

### 獲取用戶列表
- **Method**: GET
- **Path**: `/api/admin/users`
- **Description**: 獲取用戶列表（支持篩選、排序、分頁）
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Query: `page`, `per_page`, `keyword`, `role`, `sort_by`, `order`, `date_from`, `date_to`
- **Response**: 用戶列表及分頁資訊
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:80`

### 獲取用戶詳細資訊
- **Method**: GET
- **Path**: `/api/admin/users/<user_id>`
- **Description**: 獲取用戶詳細資訊（含統計數據）
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
- **Response**: 用戶詳情、統計、最近活動
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:140`

### 更新用戶角色
- **Method**: PUT
- **Path**: `/api/admin/users/<user_id>/role`
- **Description**: 更新用戶角色
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{"role": "admin"}`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:172`

### 調整用戶功德點數
- **Method**: PUT
- **Path**: `/api/admin/users/<user_id>/points`
- **Description**: 調整用戶功德點數
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{"adjustment": 100, "reason": "活動獎勵"}`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:210`

### 批量操作用戶
- **Method**: POST
- **Path**: `/api/admin/users/bulk-action`
- **Description**: 批量更新用戶角色
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{"user_ids": [1,2,3], "action": "set_admin"}`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:266`

### 獲取廟宇申請列表
- **Method**: GET
- **Path**: `/api/admin/temple-applications`
- **Description**: 獲取廟宇申請列表
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Query: `page`, `per_page`, `status`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:311`

### 審核廟宇申請
- **Method**: POST
- **Path**: `/api/admin/temple-applications/<application_id>/review`
- **Description**: 審核廟宇申請（批准/拒絕/審核中）
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{"action": "approve", "note": "備註"}`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:330`

### 獲取待審核產品
- **Method**: GET
- **Path**: `/api/admin/products/pending`
- **Description**: 獲取待審核產品列表
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:398`

### 審核產品
- **Method**: POST
- **Path**: `/api/admin/products/<product_id>/review`
- **Description**: 審核產品
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{"action": "approve", "note": "備註"}`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:413`

### 切換產品狀態
- **Method**: PUT
- **Path**: `/api/admin/products/<product_id>/toggle-status`
- **Description**: 切換產品上架/下架狀態
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{"is_active": true}`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:454`

### 獲取所有兌換訂單
- **Method**: GET
- **Path**: `/api/admin/redemptions`
- **Description**: 獲取所有兌換訂單（帶高級篩選）
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Query: `page`, `per_page`, `status`, `keyword`, `date_from`, `date_to`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:505`

### 系統總覽統計
- **Method**: GET
- **Path**: `/api/admin/analytics/overview`
- **Description**: 獲取系統總覽統計
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
- **Response**: 用戶、廟宇、打卡、兌換等各項統計
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:549`

### 用戶增長統計
- **Method**: GET
- **Path**: `/api/admin/analytics/users`
- **Description**: 獲取用戶增長統計
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Query: `days` (統計天數)
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:619`

### 兌換統計
- **Method**: GET
- **Path**: `/api/admin/analytics/redemptions`
- **Description**: 獲取兌換統計
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Query: `days` (統計天數)
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:654`

### 廟宇統計
- **Method**: GET
- **Path**: `/api/admin/analytics/temples`
- **Description**: 獲取廟宇統計
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:701`

### 打卡統計
- **Method**: GET
- **Path**: `/api/admin/analytics/checkins`
- **Description**: 獲取打卡統計
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Query: `days` (統計天數)
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:733`

### 獲取系統設定
- **Method**: GET
- **Path**: `/api/admin/settings`
- **Description**: 獲取系統設定列表
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Query: `category` (分類篩選)
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:770`

### 更新系統設定
- **Method**: PUT
- **Path**: `/api/admin/settings/<setting_id>`
- **Description**: 更新系統設定
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{"value": "new_value"}`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:789`

### 創建系統設定
- **Method**: POST
- **Path**: `/api/admin/settings`
- **Description**: 創建新的系統設定
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{"key": "setting_key", "value": "...", "category": "general", "data_type": "string"}`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:816`

### 獲取用戶檢舉列表
- **Method**: GET
- **Path**: `/api/admin/reports`
- **Description**: 獲取用戶檢舉列表
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Query: `page`, `per_page`, `status`, `type`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:858`

### 處理用戶檢舉
- **Method**: POST
- **Path**: `/api/admin/reports/<report_id>/handle`
- **Description**: 處理用戶檢舉
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{"action": "resolve", "note": "處理說明", "action_taken": "採取措施"}`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:881`

### 獲取管理員列表
- **Method**: GET
- **Path**: `/api/admin/admins`
- **Description**: 獲取管理員列表
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:926`

### 創建管理員
- **Method**: POST
- **Path**: `/api/admin/admins`
- **Description**: 創建新管理員
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{"username": "...", "password": "...", "name": "...", "email": "...", "role": "admin", "permissions": {...}}`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:936`

### 更新管理員資訊
- **Method**: PUT
- **Path**: `/api/admin/admins/<admin_id>`
- **Description**: 更新管理員資訊
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: 可更新 `name`, `email`, `phone`, `role`, `permissions`, `is_active`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:982`

### 重置管理員密碼
- **Method**: PUT
- **Path**: `/api/admin/admins/<admin_id>/password`
- **Description**: 重置管理員密碼
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{"new_password": "new_password_123"}`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:1039`

### 獲取系統日誌
- **Method**: GET
- **Path**: `/api/admin/logs`
- **Description**: 獲取系統日誌
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Query: `page`, `per_page`, `category`, `type`, `admin_id`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:1065`

### 發布系統公告
- **Method**: POST
- **Path**: `/api/admin/system-announcement`
- **Description**: 發布系統公告
- **Params**:
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{"title": "公告標題", "content": "公告內容"}`
- **Status**: Done
- **Source**: `backend/app/routes/admin.py:1098`

---

## 通知系統 API

### 獲取通知列表
- **Method**: GET
- **Path**: `/api/notifications`
- **Description**: 獲取當前用戶的通知列表
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Query:
    - `page`: 頁碼
    - `per_page`: 每頁數量
    - `is_read`: 已讀/未讀篩選 (true/false)
    - `type`: 通知類型篩選
- **Response**:
  ```json
  {
    "notifications": [ ... ],
    "total": 50,
    "page": 1,
    "pages": 3,
    "has_next": true,
    "has_prev": false
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/notification.py:13`

### 標記通知為已讀
- **Method**: PUT
- **Path**: `/api/notifications/<notification_id>/read`
- **Description**: 標記指定通知為已讀
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `notification_id`
- **Status**: Done
- **Source**: `backend/app/routes/notification.py:47`

### 標記全部通知為已讀
- **Method**: PUT
- **Path**: `/api/notifications/read-all`
- **Description**: 標記所有通知為已讀
- **Params**:
  - Header: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "updated_count": 15
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/notification.py:69`

### 刪除通知
- **Method**: DELETE
- **Path**: `/api/notifications/<notification_id>`
- **Description**: 刪除指定通知
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Path: `notification_id`
- **Status**: Done
- **Source**: `backend/app/routes/notification.py:87`

### 獲取未讀通知數量
- **Method**: GET
- **Path**: `/api/notifications/unread-count`
- **Description**: 獲取未讀通知總數及各類型分類統計
- **Params**:
  - Header: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "unread_count": 10,
    "type_breakdown": {
      "reward_received": 3,
      "redemption_status": 2,
      "temple_announcement": 5
    }
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/notification.py:104`

### 獲取通知設定
- **Method**: GET
- **Path**: `/api/notifications/settings`
- **Description**: 獲取當前用戶的通知設定
- **Params**:
  - Header: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "reward_received": true,
    "redemption_status": true,
    "temple_announcement": true,
    "system_announcement": true,
    "checkin_milestone": true,
    "push_enabled": true,
    "email_enabled": false
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/notification.py:127`

### 更新通知設定
- **Method**: PUT
- **Path**: `/api/notifications/settings`
- **Description**: 更新通知設定
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body: 可更新任意設定項
- **Status**: Done
- **Source**: `backend/app/routes/notification.py:138`

### 批量刪除通知
- **Method**: POST
- **Path**: `/api/notifications/batch-delete`
- **Description**: 批量刪除指定通知
- **Params**:
  - Header: `Authorization: Bearer <token>`
  - Body: `{"notification_ids": [1, 2, 3, ...]}`
- **Status**: Done
- **Source**: `backend/app/routes/notification.py:174`

### 清除已讀通知
- **Method**: DELETE
- **Path**: `/api/notifications/clear-read`
- **Description**: 清除所有已讀通知
- **Params**:
  - Header: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "deleted_count": 25
  }
  ```
- **Status**: Done
- **Source**: `backend/app/routes/notification.py:195`

---

## 統計資訊

- **總 API 數量**: 119 個端點
- **已完成**: 119 個
- **待實作**: 0 個
- **需要認證**: 91 個
- **需要系統管理員權限**: 28 個
- **公開訪問**: 17 個

---

## 更新日誌

### 2025-12-05 (下午)
- **新增通知系統 (9個端點)**
  - 通知列表查詢（支持分頁、篩選已讀/未讀、類型篩選）
  - 標記已讀（單個/全部）
  - 刪除通知（單個/批量/清除已讀）
  - 未讀數量統計（含類型分類）
  - 通知設定管理（獲取/更新）
  - 創建 2 個新資料模型：Notification（通知記錄）、NotificationSettings（通知設定）
  - 支援 5 種通知類型：獎勵發放、兌換狀態、廟宇公告、系統公告、打卡里程碑
  - 提供靜態方法快速創建各類通知
- **新增系統管理員功能 (28個端點)**
  - 管理員認證系統（獨立的 JWT token）
  - 用戶管理（6個端點）：列表查詢、詳情、角色更新、點數調整、批量操作
  - 廟宇審核（2個端點）：申請列表、審核流程
  - 產品審核（3個端點）：待審核列表、審核、狀態切換
  - 兌換訂單管理（1個端點）：高級篩選查詢
  - 統計分析（5個端點）：總覽、用戶增長、兌換、廟宇、打卡統計
  - 系統設定（3個端點）：查詢、更新、創建
  - 檢舉處理（2個端點）：列表、處理
  - 管理員權限管理（4個端點）：列表、創建、更新、密碼重置
  - 系統日誌（1個端點）：操作日誌查詢
  - 系統公告（1個端點）：發布全站公告
  - 創建 5 個新資料模型：SystemAdmin、TempleApplication、SystemSettings、SystemLog、UserReport
  - 實現基於角色和權限的訪問控制
  - 所有管理操作自動記錄日誌

### 2025-12-05 (上午)
- **新增打卡獎勵系統 (10個端點)**
  - 廟方管理 API（6個端點）：創建、查看、更新、刪除獎勵規則及發放統計
  - 使用者獎勵 API（4個端點）：查看可領取獎勵、手動領取、查看歷史
  - 支援 4 種獎勵類型：連續打卡天數、累計打卡次數、首次打卡、每日打卡獎勵
  - 自動獎勵檢查機制：打卡時自動檢查並發放符合條件的獎勵
  - 創建 2 個新資料模型：CheckinReward（獎勵規則）、RewardClaim（領取記錄）
  - 整合到打卡流程：打卡成功後自動檢查獎勵並發放福德點數
  - 廟方管理員權限新增 `manage_rewards` 權限
- **新增打卡功能補強 (5個端點)**
  - 打卡歷史查詢（進階篩選與分頁）
  - 打卡統計總覽（含連續天數、常去廟宇）
  - 連續打卡天數查詢
  - 月度打卡統計（按日統計）
- **新增排行榜系統 (4個端點)**
  - 功德值排行榜（支援週/月/全部時間範圍）
  - 打卡次數排行榜
  - 廟宇人氣排行榜（含獨立訪客數）
  - 查詢個人排名
- 建立 leaderboard.py 路由模組
- 建立 reward.py 路由模組
- 更新打卡 API 連續天數計算邏輯

### 2025-12-04
- 初始化 API 文檔
- 完成所有後端 API 掃描和整理
- 標註前端整合狀態
- 新增統計分析 API (10個端點)
- 新增檔案上傳 API (5個端點)
- 新增 CORS 配置（允許所有來源）
- **新增用戶管理 API (6個端點)**
  - 獲取個人資料
  - 更新個人資料
  - 修改密碼
  - 修改 Email
  - 刪除帳號
  - 獲取用戶統計
