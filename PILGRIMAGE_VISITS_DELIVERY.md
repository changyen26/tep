# 進香登記模組 - 交付文件

## 📋 交付概要

**模組名稱：** 進香登記管理（Pilgrimage Visit Booking）
**交付日期：** 2026-01-04
**版本：** v1.0
**狀態：** ✅ 開發完成，待測試驗收

---

## ✅ 完成項目清單

### 後端實作 (Backend)

#### 1. 資料庫層 (Database Layer)
- ✅ **Model**: `backend/app/models/pilgrimage_visit.py`
  - 完整的 SQLAlchemy ORM model
  - 包含所有必要欄位（temple_id, contact_name, visit_start_at, status 等）
  - 實作 `to_dict()` 方法用於 JSON 序列化
  - Foreign Key 關聯到 `temples` 和 `public_users`

- ✅ **Migration**: `backend/migrations/create_pilgrimage_visits.sql`
  - 建立 `pilgrimage_visits` 資料表
  - 正確的索引配置（temple_id, status, visit_start_at 等）
  - Foreign Key 約束與級聯刪除設定

- ✅ **Model 註冊**: `backend/app/models/__init__.py`
  - 已匯出 `PilgrimageVisit` model
  - 確保 SQLAlchemy 正確初始化

#### 2. API Layer
- ✅ **Endpoints**: `backend/app/routes/temple_admin_api.py` (Line 1235-1512)

| HTTP Method | Endpoint | 功能 | 狀態碼 |
|------------|----------|------|--------|
| OPTIONS | `/<temple_id>/pilgrimage-visits` | CORS preflight | 204 |
| GET | `/<temple_id>/pilgrimage-visits` | 取得列表（分頁、篩選） | 200 |
| POST | `/<temple_id>/pilgrimage-visits` | 新增登記 | 201 |
| OPTIONS | `/<temple_id>/pilgrimage-visits/<visit_id>` | CORS preflight | 204 |
| GET | `/<temple_id>/pilgrimage-visits/<visit_id>` | 取得詳情 | 200 |
| PUT | `/<temple_id>/pilgrimage-visits/<visit_id>` | 更新登記 | 200 |

**功能特點：**
- ✅ 完整的權限檢查（僅 temple_admin 可用）
- ✅ templeId 驗證（temple_admin 只能存取自己的廟宇）
- ✅ OPTIONS preflight 支援（所有 endpoints）
- ✅ 統一的 JSON 錯誤回應格式
- ✅ 完整的 CORS headers（包含錯誤回應）
- ✅ 參數驗證（必填欄位、日期格式等）
- ✅ 錯誤處理（不會回傳 500，除非系統級錯誤）

**列表 API 支援：**
- 篩選：status（pending/confirmed/rejected/completed/canceled）
- 排序：visit_time（預設）/ created_at
- 分頁：page, per_page（預設 20，最大 100）

**更新 API 支援：**
- status（狀態變更）
- assignedStaff（指派人員）
- adminNote（內部備註）
- replyMessage（回覆訊息）
- 基本資訊（contactName, contactPhone, peopleCount 等）

---

### 前端實作 (Frontend)

#### 1. API Service Layer
- ✅ **Service**: `frontend/src/services/templeAdminApi.js` (Line 410-463)
  - `pilgrimageVisits.list(templeId, params)` - 取得列表
  - `pilgrimageVisits.create(templeId, data)` - 新增登記
  - `pilgrimageVisits.get(templeId, visitId)` - 取得詳情
  - `pilgrimageVisits.update(templeId, visitId, data)` - 更新登記

**路徑格式：** `/temple-admin/temples/${templeId}/pilgrimage-visits`
**baseURL：** `http://localhost:5000/api`（從 httpClient 繼承）

#### 2. 頁面元件 (Pages)

##### A. 列表頁面
- ✅ **Component**: `frontend/src/pages/temple-admin/PilgrimageVisitList.jsx`
- ✅ **Styles**: `frontend/src/pages/temple-admin/PilgrimageVisitList.css`

**功能：**
- 顯示進香登記列表（表格呈現）
- 狀態篩選（全部/待處理/已確認/已拒絕/已完成/已取消）
- 排序功能（來訪時間/登記時間）
- 分頁（上一頁/下一頁）
- 「新增登記」按鈕（開啟 modal）
- 點擊列表項目進入詳情頁
- Loading 與錯誤狀態處理

**新增登記 Modal：**
- 聯絡人姓名（必填）
- 聯絡電話（必填）
- 團體名稱（選填）
- 預計人數（必填）
- 來訪時間（必填，datetime-local）
- 來訪目的（選填）
- 特殊需求（選填，textarea）

##### B. 詳情頁面
- ✅ **Component**: `frontend/src/pages/temple-admin/PilgrimageVisitDetail.jsx`
- ✅ **Styles**: `frontend/src/pages/temple-admin/PilgrimageVisitDetail.css`

**功能：**
- 顯示完整的登記資訊
- 基本資訊卡片（聯絡人、團體、人數、來訪時間、狀態等）
- 管理資訊卡片（指派人員、回覆訊息、內部備註）
- 編輯模式切換
- 更新功能（狀態、指派人員、備註、回覆訊息）
- 返回列表按鈕
- Loading 與錯誤狀態處理

#### 3. 路由配置
- ✅ **Routes**: `frontend/src/routes/templeAdminRoutes.jsx`
  - `/temple-admin/:templeId/pilgrimage-visits` → PilgrimageVisitList
  - `/temple-admin/:templeId/pilgrimage-visits/:visitId` → PilgrimageVisitDetail

#### 4. 導覽整合
- ✅ **Sidebar**: `frontend/src/layouts/TempleAdminLayout.jsx`
  - 新增「進香登記管理」導覽項目
  - 位置：活動報名管理 → **進香登記管理** → 點燈管理
  - 點擊後跳轉至列表頁

---

### 測試與文件 (Testing & Documentation)

#### 1. 自動化測試
- ✅ **Script**: `scripts/verify_temple_admin.py`
  - 新增進香登記 API 測試
  - OPTIONS preflight 測試
  - 無 token 測試（預期 401）
  - 有 token 測試（預期 200/403）

**測試涵蓋：**
```python
# OPTIONS tests
OPTIONS /api/temple-admin/temples/5/pilgrimage-visits

# 401 tests (無 token)
GET /api/temple-admin/temples/5/pilgrimage-visits

# 200/403 tests (有 token)
GET /api/temple-admin/temples/5/pilgrimage-visits
```

#### 2. 文件
- ✅ **Setup Guide**: `PILGRIMAGE_VISITS_SETUP.md`
  - 完整的安裝指南（DB migration 執行方式）
  - 測試流程說明
  - API 路徑結構
  - 權限檢查說明
  - 常見問題排查
  - 檔案清單
  - 完成確認清單

- ✅ **Delivery Doc**: `PILGRIMAGE_VISITS_DELIVERY.md`（本文件）
  - 交付概要
  - 完成項目清單
  - 檔案變更總覽
  - 啟動與測試指南
  - 驗收標準

---

## 📁 檔案變更總覽

### 新增檔案 (11 個)

#### 後端 (3 個)
1. `backend/app/models/pilgrimage_visit.py` - PilgrimageVisit model
2. `backend/migrations/create_pilgrimage_visits.sql` - 資料表 migration

#### 前端 (6 個)
3. `frontend/src/pages/temple-admin/PilgrimageVisitList.jsx` - 列表頁元件
4. `frontend/src/pages/temple-admin/PilgrimageVisitList.css` - 列表頁樣式
5. `frontend/src/pages/temple-admin/PilgrimageVisitDetail.jsx` - 詳情頁元件
6. `frontend/src/pages/temple-admin/PilgrimageVisitDetail.css` - 詳情頁樣式

#### 文件 (2 個)
7. `PILGRIMAGE_VISITS_SETUP.md` - 安裝與測試指南
8. `PILGRIMAGE_VISITS_DELIVERY.md` - 交付文件（本文件）

### 修改檔案 (6 個)

#### 後端 (2 個)
1. `backend/app/models/__init__.py` - 匯出 PilgrimageVisit
2. `backend/app/routes/temple_admin_api.py` - 新增 4 個 endpoints

#### 前端 (3 個)
3. `frontend/src/services/templeAdminApi.js` - 新增 pilgrimageVisits API 組
4. `frontend/src/routes/templeAdminRoutes.jsx` - 新增進香登記路由
5. `frontend/src/layouts/TempleAdminLayout.jsx` - Sidebar 新增導覽項目

#### 測試 (1 個)
6. `scripts/verify_temple_admin.py` - 新增進香登記測試

---

## 🚀 啟動與測試指南

### Step 1: 執行 DB Migration

**方法一：使用 MySQL CLI**
```bash
mysql -u root -p temple_db < backend/migrations/create_pilgrimage_visits.sql
```

**方法二：使用 Python 腳本**
```bash
cd backend
python -c "
from app import db, create_app
app = create_app()
with app.app_context():
    with open('migrations/create_pilgrimage_visits.sql', 'r', encoding='utf-8') as f:
        sql = f.read()
    for statement in sql.split(';'):
        if statement.strip():
            db.session.execute(statement)
    db.session.commit()
    print('✓ Migration 執行成功')
"
```

### Step 2: 啟動後端服務
```bash
cd backend
python run.py
```

確認後端運行於：`http://localhost:5000`

### Step 3: 執行驗收測試
```bash
cd scripts
python verify_temple_admin.py
```

**預期結果：**
- ✅ 所有測試通過（無 500 錯誤）
- ✅ OPTIONS preflight 回傳 204
- ✅ 無 token 回傳 401
- ✅ 有 token 回傳 200/403

### Step 4: 啟動前端服務
```bash
cd frontend
npm install  # 如果尚未安裝依賴
npm run dev
```

確認前端運行於：`http://localhost:5173`

### Step 5: 手動測試流程

1. **登入**
   - 使用 temple_admin 帳號登入
   - 例如：0911222333 / password123

2. **導覽測試**
   - 進入廟方管理後台
   - 確認 Sidebar 顯示「進香登記管理」
   - 點擊進入列表頁

3. **列表頁測試**
   - 確認列表正常顯示
   - 測試狀態篩選（全部/待處理等）
   - 測試排序功能（來訪時間/登記時間）
   - 測試分頁功能

4. **新增功能測試**
   - 點擊「+ 新增登記」按鈕
   - 填寫表單並提交
   - 確認列表更新

5. **詳情頁測試**
   - 點擊列表項目進入詳情頁
   - 確認資訊顯示正確
   - 點擊「編輯」按鈕
   - 修改狀態、指派人員、回覆訊息
   - 儲存變更
   - 確認更新成功

6. **錯誤處理測試**
   - 嘗試不填必填欄位提交（應顯示錯誤）
   - 測試網路錯誤情況

---

## ✓ 驗收標準

### 功能驗收

- [ ] **DB Migration**
  - [ ] `pilgrimage_visits` 資料表建立成功
  - [ ] 所有欄位與索引正確

- [ ] **後端 API**
  - [ ] OPTIONS preflight 回傳 204 + CORS headers
  - [ ] 無 token 回傳 401 JSON（不是 500）
  - [ ] 有 token 時正常工作（200/403，不是 500）
  - [ ] temple_admin 可以 CRUD 自己的進香登記
  - [ ] temple_admin 無法存取其他廟宇的進香登記（403）
  - [ ] 所有錯誤都是 JSON 格式（不會回傳 HTML）
  - [ ] 所有回應都包含 CORS headers

- [ ] **前端頁面**
  - [ ] Sidebar 顯示「進香登記管理」
  - [ ] 列表頁正常顯示
  - [ ] 篩選、排序、分頁功能正常
  - [ ] 新增登記功能正常
  - [ ] 詳情頁正常顯示
  - [ ] 編輯更新功能正常
  - [ ] Loading 與錯誤狀態正確顯示

- [ ] **路由與導覽**
  - [ ] URL 變化正確
  - [ ] 返回列表功能正常
  - [ ] Sidebar active 狀態正確

### 技術驗收

- [ ] **不得出現 500 錯誤**
  - [ ] 所有 API endpoints 不得回傳 500
  - [ ] 錯誤情況應回傳 400/401/403/404

- [ ] **CORS 正確設定**
  - [ ] OPTIONS preflight 正常
  - [ ] 所有回應包含 CORS headers
  - [ ] 錯誤回應也包含 CORS headers

- [ ] **權限控制**
  - [ ] temple_admin 只能存取自己的 templeId
  - [ ] public_user 無法存取（403）
  - [ ] super_admin 呼叫會收到 403（此 API 僅供 temple_admin）

- [ ] **資料驗證**
  - [ ] 必填欄位驗證正常
  - [ ] 日期格式驗證正常
  - [ ] 狀態值驗證正常

- [ ] **程式碼品質**
  - [ ] 無 console warnings
  - [ ] 無 SQL mapper 錯誤
  - [ ] 無 baseURL 重複問題（/api/api/...）

---

## 🎯 重要技術細節

### 路徑結構
```
前端調用: http.get('/temple-admin/temples/5/pilgrimage-visits')
實際請求: http://localhost:5000/api/temple-admin/temples/5/pilgrimage-visits
後端接收: @bp.route('/<int:temple_id>/pilgrimage-visits')
```

**說明：**
- httpClient baseURL = `http://localhost:5000/api`
- templeAdminApi 路徑 = `/temple-admin/temples/${templeId}/...`
- Blueprint prefix = `/api/temple-admin/temples`
- **沒有路徑重複問題**

### 權限流程
```
1. @token_required decorator → 驗證 token
2. check_temple_access() → 檢查 temple_id 權限
3. account_type == 'temple_admin' → 檢查角色
4. user_temple_id == temple_id → 檢查 templeId 匹配
```

### 錯誤處理
```python
# 不會回傳 500 的情況：
- 400: 參數錯誤、必填欄位缺失、日期格式錯誤
- 401: 無 token、token 無效
- 403: 權限不足、templeId 不匹配
- 404: 找不到資源

# 會回傳 500 的情況（需修復）：
- 資料庫連線失敗
- SQL 語法錯誤
- model relationship 錯誤
- 未捕獲的 Python 例外
```

---

## 📞 後續支援

### 已知限制
1. 目前不支援批量操作（未來可擴充）
2. 不支援登記的軟刪除（需要時可加入 deleted_at 欄位）
3. 不支援歷史記錄追蹤（需要時可加入 audit log）

### 未來擴充建議
1. **通知功能**：登記狀態變更時自動通知信眾
2. **行事曆整合**：在行事曆上顯示進香預約
3. **統計報表**：進香登記統計（月度、年度）
4. **信眾綁定**：將登記與 public_user 帳號綁定
5. **範本訊息**：常用回覆訊息範本管理

---

## 📝 結論

進香登記模組已完成開發，包含：

✅ 完整的後端 API（4 個 endpoints）
✅ 完整的前端頁面（列表 + 詳情 + 新增 modal）
✅ 符合三表帳號權限系統
✅ 正確的 CORS 設定
✅ 統一的錯誤格式
✅ 不會出現 500 錯誤（除非系統級問題）
✅ 驗收測試腳本
✅ 完整的文件

**請依照本文件的「啟動與測試指南」執行驗收測試。**

如有任何問題，請參考 `PILGRIMAGE_VISITS_SETUP.md` 的「常見問題排查」章節。

---

**交付完成日期：** 2026-01-04
**開發人員：** Claude Code
**狀態：** ✅ 待驗收
