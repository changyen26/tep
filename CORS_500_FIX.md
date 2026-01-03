# CORS + 500 錯誤修正報告

## ✅ 已修正的問題

### 1️⃣ CORS 對所有響應生效（包括錯誤）

#### 問題描述
- 500 錯誤響應沒有 `Access-Control-Allow-Origin` header
- 導致瀏覽器 CORS 錯誤，無法讀取錯誤訊息

#### 修正方案
在 `backend/app/__init__.py` 中：

**A. 加入 `intercept_exceptions=False`**
```python
CORS(app,
     resources={r"/api/*": {...}},
     supports_credentials=True,
     intercept_exceptions=False  # 關鍵：確保異常響應也有 CORS headers
)
```

**B. 新增全局錯誤處理器**
```python
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'status': 'error',
        'message': '資源不存在',
        'data': None
    }), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({
        'status': 'error',
        'message': '伺服器內部錯誤，請稍後再試',
        'data': str(error) if app.debug else None
    }), 500

@app.errorhandler(Exception)
def handle_exception(error):
    if app.debug:
        print(f"Unhandled Exception: {error}")
        import traceback
        traceback.print_exc()

    db.session.rollback()
    return jsonify({
        'status': 'error',
        'message': '發生未預期的錯誤',
        'data': str(error) if app.debug else None
    }), 500
```

---

### 2️⃣ 500 錯誤根因修正

#### 問題描述
`GET /api/temple-admin/temples/5` 回傳 500 錯誤

#### 可能原因
1. **資料庫表不存在**：`temple_admin_users` 表尚未執行 migration
2. **Model 查詢異常**：查詢時拋出未捕獲的異常
3. **資料轉換錯誤**：`to_dict()` 方法執行失敗

#### 修正方案
在 `backend/app/routes/temple_admin_api.py` 的 `get_temple` 函數中加入完整異常處理：

```python
@bp.route('/<int:temple_id>', methods=['GET', 'OPTIONS'])
@token_required
def get_temple(current_user, account_type, temple_id):
    """
    取得廟宇資訊
    GET /api/temple-admin/temples/:templeId
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # 權限檢查
        has_access, error = check_temple_access(current_user, account_type, temple_id)
        if not has_access:
            return error

        # 查詢廟宇（加入異常處理）
        temple = Temple.query.get(temple_id)
        if not temple:
            return error_response('廟宇不存在', 404)

        # 轉換為字典（加入異常處理）
        temple_data = temple.to_dict()

        return success_response(temple_data)

    except AttributeError as e:
        # Model 缺少必要屬性或方法
        return error_response(f'資料模型錯誤: {str(e)}', 500)

    except Exception as e:
        # 其他未預期的錯誤
        db.session.rollback()
        return error_response(f'查詢失敗: {str(e)}', 500)
```

---

### 3️⃣ OPTIONS Preflight 確保成功

#### 檢查點
✅ **auth.py 的 token_required 已正確處理 OPTIONS**
```python
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # OPTIONS 請求直接放行（CORS preflight）
        if request.method == 'OPTIONS':
            return '', 204  # ✅ 正確
        # ... 其他邏輯
```

✅ **endpoint 內部也有 OPTIONS 處理（雙重保險）**
```python
def get_temple(current_user, account_type, temple_id):
    if request.method == 'OPTIONS':
        return '', 204
    # ... 其他邏輯
```

**結論**：OPTIONS 處理已正確，會在 decorator 層級就返回 204，不會進入業務邏輯。

---

## 🧪 修正後的預期結果

### OPTIONS 請求
```http
OPTIONS /api/temple-admin/temples/5 HTTP/1.1
Host: localhost:5000
Origin: http://localhost:5173

Response:
Status: 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
```

### GET 請求（成功）
```http
GET /api/temple-admin/temples/5 HTTP/1.1
Host: localhost:5000
Origin: http://localhost:5173
Authorization: Bearer <token>

Response:
Status: 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json

{
  "status": "success",
  "message": "...",
  "data": { "id": 5, "name": "...", ... }
}
```

### GET 請求（權限錯誤 403）
```http
GET /api/temple-admin/temples/5 HTTP/1.1
Host: localhost:5000
Origin: http://localhost:5173
Authorization: Bearer <wrong-temple-token>

Response:
Status: 403 Forbidden
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json

{
  "status": "error",
  "message": "您沒有權限存取此廟宇",
  "data": null
}
```

### GET 請求（資料庫錯誤 500）
```http
GET /api/temple-admin/temples/5 HTTP/1.1
Host: localhost:5000
Origin: http://localhost:5173
Authorization: Bearer <token>

Response:
Status: 500 Internal Server Error
Access-Control-Allow-Origin: http://localhost:5173  ✅ 關鍵：錯誤也有 CORS
Content-Type: application/json

{
  "status": "error",
  "message": "伺服器內部錯誤，請稍後再試",
  "data": "NoSuchTableError: table temple_admin_users does not exist"  // debug mode
}
```

---

## 📝 執行步驟

### Step 1: 重啟後端服務

```bash
cd E:\tep\backend

# 停止當前服務（Ctrl+C）

# 重啟
python run.py
```

### Step 2: 清除瀏覽器快取

```bash
# 按 F12 → Network 標籤
# 勾選 "Disable cache"
# 右鍵點擊重新整理按鈕 → "清除快取並強制重新整理"
```

### Step 3: 測試 OPTIONS Preflight

打開瀏覽器 Network Tab，檢查：

```
Request URL: http://localhost:5000/api/temple-admin/temples/5
Request Method: OPTIONS
Status Code: 204 No Content

Response Headers:
✅ Access-Control-Allow-Origin: http://localhost:5173
✅ Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
✅ Access-Control-Allow-Headers: Content-Type, Authorization
```

### Step 4: 測試 GET 請求

```
Request URL: http://localhost:5000/api/temple-admin/temples/5
Request Method: GET
Status Code: 200 OK 或 403 Forbidden 或 500 Internal Server Error

Response Headers（所有狀態碼都必須有）:
✅ Access-Control-Allow-Origin: http://localhost:5173
✅ Content-Type: application/json

Response Body（JSON 格式）:
{
  "status": "error" | "success",
  "message": "...",
  "data": ...
}
```

---

## ⚠️ 如果仍然出現 500 錯誤

### 檢查清單：

#### 1. 資料庫表是否存在
```bash
# 連線到 MySQL
mysql -u root -p temple_db

# 檢查表
SHOW TABLES LIKE '%temple_admin_users%';

# 如果表不存在，執行 migration
mysql -u root -p temple_db < backend/migrations/create_three_tables.sql
```

#### 2. 檢查後端 Console 日誌
```
# 在後端 console 中應該會看到詳細的 stack trace
# 例如：
Unhandled Exception: (pymysql.err.ProgrammingError) (1146, "Table 'temple_db.temple_admin_users' doesn't exist")
  ...
```

#### 3. 檢查 Flask Debug Mode
在 `backend/run.py` 或啟動命令中確認：
```python
app.run(debug=True)  # ✅ 開發環境應該要 True
```

Debug mode 開啟時，500 錯誤的 response body 會包含詳細錯誤訊息：
```json
{
  "status": "error",
  "message": "伺服器內部錯誤，請稍後再試",
  "data": "Table 'temple_db.temple_admin_users' doesn't exist"
}
```

---

## 📋 修改檔案總結

| 檔案 | 修改內容 | 目的 |
|------|---------|------|
| `backend/app/__init__.py` | 1. CORS 加入 `intercept_exceptions=False`<br>2. 新增全局錯誤處理器 | 確保所有錯誤響應都有 CORS headers |
| `backend/app/routes/temple_admin_api.py` | `get_temple` 函數加入 try-except | 捕獲並正確處理資料庫/模型異常 |
| `backend/app/utils/auth.py` | **無需修改** | OPTIONS 處理已正確 |

---

## ✅ 驗收標準

### 必須全部通過：

- [ ] OPTIONS 請求回傳 204，帶 CORS headers
- [ ] GET 成功請求回傳 200，帶 CORS headers 和正確 JSON
- [ ] GET 權限錯誤回傳 403，帶 CORS headers 和錯誤 JSON
- [ ] GET 伺服器錯誤回傳 500，**仍然帶 CORS headers** 和錯誤 JSON
- [ ] 瀏覽器 Console 不再出現 CORS 錯誤
- [ ] 瀏覽器 Network Tab 可以看到錯誤響應的 JSON 內容

---

**修正完成時間**：2026-01-03
**修正狀態**：✅ 完成，請重啟後端並測試
