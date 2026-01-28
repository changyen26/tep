# 進香登記模組 - 安裝與測試指南

## 1. 資料庫 Migration

在執行測試之前，需要先建立 `pilgrimage_visits` 資料表。

### 方法一：使用 MySQL CLI

```bash
# 進入專案目錄
cd E:\tep

# 執行 migration（請修改為你的資料庫連線資訊）
mysql -u root -p temple_db < backend/migrations/create_pilgrimage_visits.sql
```

### 方法二：使用資料庫管理工具

1. 開啟 phpMyAdmin / MySQL Workbench / DBeaver 等工具
2. 連線到你的資料庫（例如：`temple_db`）
3. 執行 `backend/migrations/create_pilgrimage_visits.sql` 的內容

### 方法三：使用 Python 腳本（推薦）

```bash
cd backend
python -c "
from app import db, create_app
app = create_app()
with app.app_context():
    with open('migrations/create_pilgrimage_visits.sql', 'r', encoding='utf-8') as f:
        sql = f.read()
    # 分割並執行 SQL
    for statement in sql.split(';'):
        if statement.strip():
            db.session.execute(statement)
    db.session.commit()
    print('✓ Migration 執行成功')
"
```

## 2. 啟動後端服務

```bash
cd backend
python run.py
```

確認後端正在運行於 `http://localhost:5000`

## 3. 執行驗收測試

```bash
cd scripts
python verify_temple_admin.py
```

### 測試涵蓋範圍

- ✅ OPTIONS preflight (204 + CORS headers)
- ✅ 無 token 時回傳 401
- ✅ 有 token 時正常工作（200/403，不會 500）
- ✅ 進香登記列表 API
- ✅ 進香登記詳情 API

## 4. 啟動前端服務

```bash
cd frontend
npm run dev
```

確認前端正在運行於 `http://localhost:5173`

## 5. 手動測試流程

1. 以 temple_admin 身份登入（例如：0911222333 / password123）
2. 進入廟方管理後台
3. 點擊側邊欄的「進香登記管理」
4. 測試功能：
   - 點擊「+ 新增登記」按鈕
   - 填寫表單並提交
   - 查看列表中是否出現新增的登記
   - 點擊列表項目進入詳情頁
   - 在詳情頁點擊「編輯」按鈕
   - 修改狀態、指派人員、回覆訊息等
   - 儲存變更

## 6. API 路徑結構

所有 API 都遵循統一路徑格式：

```
/api/temple-admin/temples/:templeId/pilgrimage-visits
```

### 可用的 API endpoints

| 方法 | 路徑 | 說明 |
|------|------|------|
| OPTIONS | `/pilgrimage-visits` | CORS preflight |
| GET | `/pilgrimage-visits?page=1&per_page=20&status=pending` | 取得列表 |
| POST | `/pilgrimage-visits` | 新增登記 |
| OPTIONS | `/pilgrimage-visits/:visitId` | CORS preflight |
| GET | `/pilgrimage-visits/:visitId` | 取得詳情 |
| PUT | `/pilgrimage-visits/:visitId` | 更新登記 |

## 7. 權限檢查

- ✅ 僅允許 `temple_admin` 使用
- ✅ temple_admin 只能存取自己的 `templeId`
- ✅ super_admin 或 public_user 呼叫會收到 403 錯誤（JSON 格式）

## 8. 錯誤處理

所有錯誤都會回傳 JSON 格式，不會回傳 HTML：

- 401: 未授權（無 token 或 token 無效）
- 403: 權限不足（不是 temple_admin 或 templeId 不匹配）
- 404: 找不到資源
- 400: 請求參數錯誤
- 500: 伺服器錯誤（應避免，若發生需修復）

所有錯誤回應都包含 CORS headers。

## 9. 常見問題排查

### 問題：測試時出現 500 錯誤

**可能原因：**
1. 資料表尚未建立 → 執行 migration
2. SQLAlchemy model 關聯錯誤 → 檢查 `backend/app/models/pilgrimage_visit.py`
3. Foreign key 約束失敗 → 確認 `temples` 和 `public_users` 表存在

### 問題：前端無法存取 API（CORS 錯誤）

**解決方法：**
- 確認後端 CORS 設定正確（`backend/app/__init__.py`）
- 確認 frontend `.env` 中的 `VITE_API_BASE_URL` 正確

### 問題：OPTIONS preflight 失敗

**解決方法：**
- 確認所有 endpoints 都有 `methods=['GET', 'OPTIONS']` 或對應的方法
- 確認在 `if request.method == 'OPTIONS': return '', 204`

## 10. 檔案清單

### 後端檔案
- ✅ `backend/app/models/pilgrimage_visit.py` (新增)
- ✅ `backend/migrations/create_pilgrimage_visits.sql` (新增)
- ✅ `backend/app/models/__init__.py` (修改)
- ✅ `backend/app/routes/temple_admin_api.py` (修改)

### 前端檔案
- ✅ `frontend/src/services/templeAdminApi.js` (修改)
- ✅ `frontend/src/pages/temple-admin/PilgrimageVisitList.jsx` (新增)
- ✅ `frontend/src/pages/temple-admin/PilgrimageVisitList.css` (新增)
- ✅ `frontend/src/pages/temple-admin/PilgrimageVisitDetail.jsx` (新增)
- ✅ `frontend/src/pages/temple-admin/PilgrimageVisitDetail.css` (新增)
- ✅ `frontend/src/routes/templeAdminRoutes.jsx` (修改)
- ✅ `frontend/src/layouts/TempleAdminLayout.jsx` (修改)

### 測試腳本
- ✅ `scripts/verify_temple_admin.py` (修改)

---

## 完成確認清單

- [ ] 執行 DB migration
- [ ] 後端服務啟動成功
- [ ] 執行 `verify_temple_admin.py` 測試通過（無 500 錯誤）
- [ ] 前端服務啟動成功
- [ ] Sidebar 顯示「進香登記管理」項目
- [ ] 可以新增進香登記
- [ ] 可以查看列表並篩選
- [ ] 可以查看詳情
- [ ] 可以編輯並更新登記

---

**測試通過標準：**
- ✅ 所有 API 不得回傳 500 錯誤
- ✅ OPTIONS preflight 回傳 204
- ✅ 無 token 回傳 401 JSON
- ✅ 錯誤回應都是 JSON 格式且包含 CORS headers
- ✅ temple_admin 可以正常使用所有功能
