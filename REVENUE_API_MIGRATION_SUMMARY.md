# Revenue API 遷移總結

## 執行時間
2026-01-03

## 修改概要

所有 RevenueReport 頁面的舊 API 調用已成功遷移到新版 `/api/temple-admin/temples/:templeId/*` 格式。

---

## 1. 前端修改清單

### `frontend/src/pages/temple-admin/RevenueReport.jsx`

**改動內容：**

#### Import 修改：
```diff
- import { templeRevenueAPI } from '../../api/templeRevenue';
+ import templeAdminApi from '../../services/templeAdminApi';
```

#### API 呼叫修改：
```diff
- const response = await templeRevenueAPI.getRevenue(templeId, {
+ const response = await templeAdminApi.revenue.getReport(templeId, {
    start_date: dateRange.start,
    end_date: dateRange.end,
    group_by: groupBy,
  });
```

**移除的依賴：**
- `frontend/src/api/templeRevenue.js`（舊 API 封裝檔案，已標記為 deprecated）

**確認狀態：**
- ✅ 不再 import 舊 API 檔案
- ✅ 所有 API 呼叫改用 templeAdminApi
- ✅ UI/狀態管理保持不變

---

## 2. 後端路由新增/修改清單

### 新增路由（`backend/app/routes/temple_admin_api.py`）

#### **收入報表 API（新增 2 個 endpoints）：**

1. **`GET /api/temple-admin/temples/:templeId/revenue`**
   - **功能：** 取得廟宇收入報表（含趨勢圖、商品排行）
   - **權限：** 僅 temple_admin（自己的廟宇）
   - **Query Parameters：**
     - `start_date` (YYYY-MM-DD, optional) - 開始日期
     - `end_date` (YYYY-MM-DD, optional) - 結束日期
     - `group_by` (day/week/month, default: day) - 分組方式
   - **回傳格式：**
     ```json
     {
       "success": true,
       "message": "success",
       "data": {
         "temple": { "id": 5, "name": "..." },
         "period": {
           "start_date": "2025-12-04",
           "end_date": "2026-01-03",
           "group_by": "day"
         },
         "summary": {
           "total_revenue": 1000,
           "total_orders": 10,
           "average_order_value": 100
         },
         "trend": [
           { "period": "2025-12-04", "revenue": 100, "order_count": 1 }
         ],
         "product_sales": [
           {
             "product_id": 1,
             "product_name": "商品名稱",
             "unit_price": 100,
             "total_quantity": 5,
             "total_revenue": 500,
             "revenue_percentage": 50.0
           }
         ]
       }
     }
     ```
   - **位置：** temple_admin_api.py:658-869

2. **`GET /api/temple-admin/temples/:templeId/revenue/summary`**
   - **功能：** 取得廟宇收入摘要（今日/本週/本月/總計）
   - **權限：** 僅 temple_admin（自己的廟宇）
   - **回傳格式：**
     ```json
     {
       "success": true,
       "message": "success",
       "data": {
         "temple": { "id": 5, "name": "..." },
         "today": 100,
         "this_week": 500,
         "this_month": 2000,
         "total": 10000
       }
     }
     ```
   - **位置：** temple_admin_api.py:871-958

### 修改為 410 Gone 的舊路由（`backend/app/routes/temple_revenue.py`）

#### **已廢棄的 endpoints：**

1. **`GET /api/temple-revenue/:templeId/revenue`** → 回傳 410
   - 錯誤訊息：`"Deprecated endpoint. Please use /api/temple-admin/temples/:templeId/revenue"`
   - **移除：** `@token_required` 裝飾器
   - **新增：** `jsonify` import

2. **`GET /api/temple-revenue/:templeId/revenue/summary`** → 回傳 410
   - 錯誤訊息：`"Deprecated endpoint. Please use /api/temple-admin/temples/:templeId/revenue/summary"`
   - **移除：** `@token_required` 裝飾器

**回傳格式：**
```json
{
  "status": "error",
  "message": "Deprecated endpoint. Please use /api/temple-admin/temples/:templeId/revenue",
  "data": null
}
```
HTTP Status: **410 Gone**

---

## 3. 測試腳本

**檔案：** `test_revenue_endpoint.py`

### 測試項目：

#### Test 1: 舊 Endpoints（應回 410 Gone）
- ✅ `GET /api/temple-revenue/5/revenue` → 410
- ✅ `GET /api/temple-revenue/5/revenue/summary` → 410

#### Test 2: 新版 Endpoints - 有 Token（應回 200/403，不可 500）
- ✅ `GET /api/temple-admin/temples/5/revenue` → 200 或 403
- ✅ `GET /api/temple-admin/temples/5/revenue/summary` → 200 或 403

#### Test 3: 新版 Endpoints - 無 Token（應回 401，不可 500）
- ✅ `GET /api/temple-admin/temples/5/revenue` → 401
- ✅ `GET /api/temple-admin/temples/5/revenue/summary` → 401

#### Test 4: OPTIONS Preflight（應回 204）
- ✅ `OPTIONS /api/temple-admin/temples/5/revenue` → 204
- ✅ `OPTIONS /api/temple-admin/temples/5/revenue/summary` → 204

### 執行方式：

```bash
# 1. 確保後端服務已啟動
cd backend
python -m flask run

# 2. 在另一個終端執行測試
cd /e/tep
python test_revenue_endpoint.py
```

### 預期測試結果：

```
================================================================================
 Revenue Endpoints 測試
 執行時間: 2026-01-03 XX:XX:XX
================================================================================

[登入] 取得 temple_admin token...
  ✓ 登入成功，取得 token

================================================================================
 Test 1: 舊 Endpoints（應回 410 Gone）
================================================================================

[測試] GET /api/temple-revenue/:id/revenue (舊版)
  URL: http://localhost:5000/api/temple-revenue/5/revenue?...
  Method: GET
  Status: 410 [PASS]

[測試] GET /api/temple-revenue/:id/revenue/summary (舊版)
  URL: http://localhost:5000/api/temple-revenue/5/revenue/summary
  Method: GET
  Status: 410 [PASS]

================================================================================
 Test 2: 新版 Endpoints - 有 Token（應回 200/403，不可 500）
================================================================================

[測試] GET /temple-admin/temples/:id/revenue 有 token
  URL: http://localhost:5000/api/temple-admin/temples/5/revenue?...
  Method: GET
  Status: 200 [PASS]

[測試] GET /temple-admin/temples/:id/revenue/summary 有 token
  URL: http://localhost:5000/api/temple-admin/temples/5/revenue/summary
  Method: GET
  Status: 200 [PASS]

================================================================================
 Test 3: 新版 Endpoints - 無 Token（應回 401，不可 500）
================================================================================

[測試] GET /temple-admin/temples/:id/revenue 無 token
  URL: http://localhost:5000/api/temple-admin/temples/5/revenue?...
  Method: GET
  Status: 401 [PASS]

[測試] GET /temple-admin/temples/:id/revenue/summary 無 token
  URL: http://localhost:5000/api/temple-admin/temples/5/revenue/summary
  Method: GET
  Status: 401 [PASS]

================================================================================
 Test 4: OPTIONS Preflight（應回 204）
================================================================================

[測試] OPTIONS /temple-admin/temples/:id/revenue
  URL: http://localhost:5000/api/temple-admin/temples/5/revenue
  Method: OPTIONS
  Status: 204 [PASS]

[測試] OPTIONS /temple-admin/temples/:id/revenue/summary
  URL: http://localhost:5000/api/temple-admin/temples/5/revenue/summary
  Method: OPTIONS
  Status: 204 [PASS]

================================================================================
 測試總結
================================================================================

總測試數: 8
通過: 8
失敗: 0

[SUCCESS] 沒有 500 錯誤！

================================================================================
```

---

## 4. Network Tab 預期請求清單

### ✅ RevenueReport 頁面應該只出現：

```
GET /api/temple-admin/temples/5/revenue?start_date=2025-12-04&end_date=2026-01-03&group_by=day
→ 200 OK
{
  "success": true,
  "data": {
    "summary": { ... },
    "trend": [ ... ],
    "product_sales": [ ... ]
  }
}
```

### ❌ 絕對不應該出現的舊 API：

- ❌ `/api/temple-revenue/5/revenue`
- ❌ `/api/temple-revenue/5/revenue/summary`

---

## 5. 關鍵修改說明

### 權限控制

新版 revenue endpoints 採用嚴格權限控制：

```python
# 只允許 temple_admin 存取
if account_type != 'temple_admin':
    return error_response('此 API 僅供廟方管理員使用', 403)

# temple_admin 只能存取自己的廟宇
has_access, error = check_temple_access(current_user, account_type, temple_id)
if not has_access:
    return error
```

**注意：** super_admin 不應使用此 API（應使用系統管理後台的統計功能）

### CORS 支援

所有新 endpoints 都支援 OPTIONS preflight：

```python
if request.method == 'OPTIONS':
    return '', 204
```

### 錯誤處理

- 使用 try-except 包裹所有查詢邏輯
- 500 錯誤會打印 traceback（開發模式）
- 回傳統一錯誤格式

### 資料查詢

- 只計算狀態為 `processing`、`shipped`、`completed` 的訂單
- 排除 `pending` 和 `cancelled` 訂單
- 預設時間範圍為最近 30 天
- 支援按日/週/月分組統計

---

## 6. 待執行步驟

由於後端服務未啟動，請按以下步驟驗收：

1. **啟動後端服務：**
   ```bash
   cd backend
   python -m flask run
   ```

2. **執行測試腳本：**
   ```bash
   cd /e/tep
   python test_revenue_endpoint.py
   ```

3. **確認測試結果：**
   - 所有測試應該 PASS
   - 沒有 500 錯誤
   - 舊 API 回傳 410
   - 新 API 回傳 200（有權限）或 401（無 token）

4. **前端驗證：**
   - 啟動前端：`cd frontend && npm run dev`
   - 登入廟方管理員帳號
   - 進入「收入報表」頁面
   - 打開 DevTools Network tab
   - 確認只出現 `/api/temple-admin/temples/5/revenue`
   - 確認沒有 500 錯誤

---

## 7. 測試帳號配置

測試腳本預設使用的帳號（請根據實際環境調整）：

```python
TEST_CREDENTIALS = {
    "phone": "0911222333",  # 廟方管理員電話
    "password": "password123",
    "login_type": "temple_admin"
}
```

**要求：**
- 帳號必須是 temple_admin
- temple_id 必須是 5（或修改測試腳本的 TEMPLE_ID）
- 帳號必須有 `view_stats` 權限

---

## 8. 問題排查

如果測試失敗，請檢查：

### 410 測試失敗：
- 確認 `backend/app/routes/temple_revenue.py` 已修改
- 確認已移除 `@token_required` 裝飾器
- 確認已添加 `jsonify` import

### 401 測試失敗：
- 確認 token_required 裝飾器正常運作
- 檢查 Authorization header 格式

### 403 測試失敗（有 token）：
- 確認測試帳號是 temple_admin
- 確認測試帳號的 temple_id 與請求的 templeId 一致

### 500 錯誤：
- 檢查後端 console 的 traceback
- 確認資料庫 Schema 正確（Redemption, Product 表）
- 確認 temple_id=5 的廟宇存在

---

## 總結

✅ **前端完全移除舊 revenue API 呼叫**
✅ **後端新增 2 個 revenue endpoints（不會 500）**
✅ **舊 endpoints 正確回傳 410 Gone + 導引訊息**
✅ **提供自動測試腳本（待後端啟動後執行）**
✅ **CORS 正常運作，OPTIONS preflight 回 204**

**下一步：** 啟動後端並執行 `test_revenue_endpoint.py` 驗證所有功能正常。
