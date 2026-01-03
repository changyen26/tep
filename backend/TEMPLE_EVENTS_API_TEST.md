# 廟方活動報名管理 API 測試指南

## 前置準備

### 1. 執行資料庫遷移
```bash
cd backend
flask db upgrade
```

或直接執行 SQL：
```bash
mysql -u root -p temple_checkin < temple_events_init.sql
```

### 2. 取得認證 Token
首先需要登入取得 JWT token（使用廟方管理員帳號）：

```bash
# 登入取得 token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@temple.com",
    "password": "admin123"
  }'

# 回應範例：
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "user": {...}
#   }
# }
```

將回應中的 token 複製，用於後續請求的 Authorization header。

---

## API 測試範例

### 變數設定
```bash
# 設定環境變數（方便複製貼上）
export API_URL="http://localhost:5000/api/temple-admin/events"
export TOKEN="你的JWT_TOKEN"
export TEMPLE_ID=1
```

---

### 1. 獲取活動列表
```bash
curl -X GET "${API_URL}/?temple_id=${TEMPLE_ID}&status=all&page=1&pageSize=20" \
  -H "Authorization: Bearer ${TOKEN}"
```

篩選已發布的活動：
```bash
curl -X GET "${API_URL}/?temple_id=${TEMPLE_ID}&status=published" \
  -H "Authorization: Bearer ${TOKEN}"
```

搜尋活動（關鍵字）：
```bash
curl -X GET "${API_URL}/?temple_id=${TEMPLE_ID}&q=祈福" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### 2. 建立活動（草稿）
```bash
curl -X POST "${API_URL}/" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "templeId": 1,
    "title": "新春祈福法會",
    "description": "農曆新年期間舉辦的祈福法會，歡迎信眾參加。",
    "location": "大殿",
    "startAt": "2026-02-01T09:00",
    "endAt": "2026-02-01T12:00",
    "signupEndAt": "2026-01-25T23:59",
    "capacity": 100,
    "fee": 0,
    "coverImageUrl": "https://picsum.photos/800/400?random=1"
  }'
```

回應範例：
```json
{
  "success": true,
  "message": "活動建立成功",
  "data": {
    "id": 1,
    "templeId": 1,
    "title": "新春祈福法會",
    "status": "draft",
    ...
  }
}
```

---

### 3. 獲取活動詳情
```bash
# 假設活動 ID 為 1
export EVENT_ID=1

curl -X GET "${API_URL}/${EVENT_ID}/" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### 4. 更新活動
```bash
curl -X PUT "${API_URL}/${EVENT_ID}/" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新春祈福法會（已更新）",
    "capacity": 150
  }'
```

---

### 5. 發布活動（draft -> published）
```bash
curl -X POST "${API_URL}/${EVENT_ID}/publish/" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### 6. 提前截止（published -> closed）
```bash
curl -X POST "${API_URL}/${EVENT_ID}/close/" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### 7. 取消活動（published/closed -> canceled）
```bash
curl -X POST "${API_URL}/${EVENT_ID}/cancel/" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### 8. 獲取報名名單
```bash
curl -X GET "${API_URL}/${EVENT_ID}/registrations/?status=all&page=1&pageSize=20" \
  -H "Authorization: Bearer ${TOKEN}"
```

篩選已報名的：
```bash
curl -X GET "${API_URL}/${EVENT_ID}/registrations/?status=registered" \
  -H "Authorization: Bearer ${TOKEN}"
```

搜尋報名記錄：
```bash
curl -X GET "${API_URL}/${EVENT_ID}/registrations/?q=王小明" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 錯誤處理測試

### 測試權限檢查（試圖存取其他廟宇的活動）
```bash
curl -X GET "${API_URL}/?temple_id=999" \
  -H "Authorization: Bearer ${TOKEN}"
# 應回傳 403 Forbidden
```

### 測試狀態轉換限制
```bash
# 嘗試將草稿直接截止（應失敗）
curl -X POST "${API_URL}/1/close/" \
  -H "Authorization: Bearer ${TOKEN}"
# 應回傳 400，訊息：只有已發布的活動可以提前截止
```

### 測試時間邏輯驗證
```bash
# 嘗試建立 endAt < startAt 的活動（應失敗）
curl -X POST "${API_URL}/" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "templeId": 1,
    "title": "測試活動",
    "description": "測試",
    "location": "測試地點",
    "startAt": "2026-02-01T12:00",
    "endAt": "2026-02-01T09:00",
    "signupEndAt": "2026-01-25T23:59",
    "capacity": 10,
    "fee": 0
  }'
# 應回傳 400，訊息：活動結束時間必須晚於開始時間
```

---

## 完整測試流程

```bash
# 1. 建立活動
EVENT_ID=$(curl -s -X POST "${API_URL}/" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "templeId": 1,
    "title": "測試活動",
    "description": "測試說明",
    "location": "測試地點",
    "startAt": "2026-03-01T10:00",
    "endAt": "2026-03-01T12:00",
    "signupEndAt": "2026-02-25T23:59",
    "capacity": 50,
    "fee": 0
  }' | jq -r '.data.id')

echo "建立的活動 ID: $EVENT_ID"

# 2. 查看詳情
curl -s -X GET "${API_URL}/${EVENT_ID}/" \
  -H "Authorization: Bearer ${TOKEN}" | jq

# 3. 發布活動
curl -s -X POST "${API_URL}/${EVENT_ID}/publish/" \
  -H "Authorization: Bearer ${TOKEN}" | jq

# 4. 查看報名名單（空的）
curl -s -X GET "${API_URL}/${EVENT_ID}/registrations/" \
  -H "Authorization: Bearer ${TOKEN}" | jq

# 5. 提前截止
curl -s -X POST "${API_URL}/${EVENT_ID}/close/" \
  -H "Authorization: Bearer ${TOKEN}" | jq

# 6. 取消活動
curl -s -X POST "${API_URL}/${EVENT_ID}/cancel/" \
  -H "Authorization: Bearer ${TOKEN}" | jq
```

---

## 預期回應格式

### 成功回應
```json
{
  "success": true,
  "message": "操作成功訊息",
  "data": { ... }
}
```

### 錯誤回應
```json
{
  "success": false,
  "message": "錯誤訊息"
}
```

### 列表回應格式
```json
{
  "success": true,
  "data": {
    "events": [ {...}, {...} ],
    "total": 10,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

---

## 注意事項

1. **所有 API 都需要 JWT Token 認證**
2. **權限檢查：只能操作自己廟宇的活動**（透過 temple_id 和 TempleAdmin 關聯檢查）
3. **狀態轉換規則**：
   - draft → published（發布）
   - published → closed（提前截止）
   - published/closed → canceled（取消）
   - 其他轉換會被拒絕
4. **末尾斜線**：所有端點都以 `/` 結尾（符合專案規範）
5. **日期時間格式**：使用 ISO 8601 格式（`2026-01-15T14:00`）
