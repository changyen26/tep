# 平安符打卡系統 - API 快速參考手冊

## 目錄
- [環境設定](#環境設定)
- [API 端點速查表](#api-端點速查表)
- [請求範例](#請求範例)
- [常見問題](#常見問題)

---

## 環境設定

### 1. 安裝相依套件

```bash
pip install Flask==3.0.0
pip install Flask-SQLAlchemy==3.1.1
pip install Flask-JWT-Extended==4.6.0
pip install Flask-CORS==4.0.0
pip install PyMySQL==1.1.0
pip install python-dotenv==1.0.0
```

或使用 requirements.txt:
```bash
pip install -r requirements.txt
```

### 2. 設定環境變數 (.env)

```env
# MySQL 設定
DB_HOST=localhost
DB_PORT=3306
DB_NAME=temple_checkin
DB_USER=root
DB_PASSWORD=

# JWT 設定
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRES=86400

# Flask 設定
FLASK_ENV=development
FLASK_DEBUG=True
```

### 3. 初始化資料庫

```bash
# 1. 啟動 MySQL (XAMPP 或獨立安裝)

# 2. 執行初始化腳本
mysql -u root -p < database_init.sql

# 或在 MySQL 命令列中執行
mysql> source /path/to/database_init.sql
```

### 4. 啟動應用程式

```bash
python clear_app.py
```

伺服器將在 `http://localhost:5000` 啟動

---

## API 端點速查表

### 認證相關

| 方法 | 端點 | 說明 | 認證 |
|------|------|------|------|
| POST | `/api/auth/register` | 註冊新使用者 | ❌ |
| POST | `/api/auth/login` | 使用者登入 | ❌ |
| GET | `/api/auth/me` | 取得當前使用者資訊 | ✅ |

### 廟宇相關

| 方法 | 端點 | 說明 | 認證 |
|------|------|------|------|
| GET | `/api/temples` | 取得廟宇列表 | ❌ |
| GET | `/api/temples/<id>` | 取得廟宇詳情 | ❌ |
| GET | `/api/temples/nearby` | 取得附近廟宇 | ❌ |

### 平安符相關

| 方法 | 端點 | 說明 | 認證 |
|------|------|------|------|
| POST | `/api/amulets` | 建立平安符 | ✅ |
| GET | `/api/amulets` | 取得我的平安符列表 | ✅ |
| PUT | `/api/amulets/<id>` | 更新平安符 | ✅ |
| DELETE | `/api/amulets/<id>` | 刪除平安符 | ✅ |

### 打卡相關

| 方法 | 端點 | 說明 | 認證 |
|------|------|------|------|
| POST | `/api/checkin` | 建立打卡記錄 | ✅ |
| GET | `/api/checkin/history` | 取得打卡歷史 | ✅ |
| GET | `/api/checkin/stats` | 取得打卡統計 | ✅ |

### 統計相關

| 方法 | 端點 | 說明 | 認證 |
|------|------|------|------|
| GET | `/api/stats/user` | 取得使用者統計 | ✅ |
| GET | `/api/stats/leaderboard` | 取得排行榜 | ❌ |
| GET | `/api/stats/temples/ranking` | 取得廟宇排行榜 | ❌ |

### 管理員相關

| 方法 | 端點 | 說明 | 認證 |
|------|------|------|------|
| POST | `/api/admin/temples` | 建立廟宇 | ✅ 管理員 |
| PUT | `/api/admin/temples/<id>` | 更新廟宇 | ✅ 管理員 |
| DELETE | `/api/admin/temples/<id>` | 刪除廟宇 | ✅ 管理員 |
| GET | `/api/admin/users` | 取得使用者列表 | ✅ 管理員 |

---

## 請求範例

### 1. 註冊使用者

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**回應:**
```json
{
  "success": true,
  "message": "註冊成功",
  "data": {
    "user": {
      "id": "uuid",
      "username": "testuser",
      "email": "test@example.com",
      "blessing_points": 0
    },
    "access_token": "eyJ0eXAiOiJKV1Qi..."
  }
}
```

### 2. 登入

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. 取得當前使用者資訊 (需要 Token)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. 取得廟宇列表

```bash
curl -X GET http://localhost:5000/api/temples
```

### 5. 建立平安符

```bash
curl -X POST http://localhost:5000/api/amulets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "uid": "UID12345",
    "name": "我的平安符",
    "description": "在龍山寺求得"
  }'
```

### 6. 打卡

```bash
curl -X POST http://localhost:5000/api/checkin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "temple_id": "750e8400-e29b-41d4-a716-446655440001",
    "amulet_uid": "UID001",
    "latitude": 25.036889,
    "longitude": 121.499722,
    "notes": "虔誠祈福"
  }'
```

**回應:**
```json
{
  "success": true,
  "message": "打卡成功",
  "data": {
    "checkin": {
      "id": "uuid",
      "checkin_time": "2025-01-15T10:30:00",
      "blessing_points": 10
    },
    "temple": {
      "name": "龍山寺",
      "main_deity": "觀音菩薩"
    },
    "total_points": 110
  }
}
```

### 7. 取得打卡歷史

```bash
curl -X GET "http://localhost:5000/api/checkin/history?page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. 取得排行榜

```bash
curl -X GET "http://localhost:5000/api/stats/leaderboard?type=points&limit=10"
```

---

## JavaScript/Fetch 範例

### 註冊使用者

```javascript
async function register(username, email, password) {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // 儲存 token
    localStorage.setItem('access_token', data.data.access_token);
    return data.data.user;
  } else {
    throw new Error(data.error);
  }
}
```

### 登入

```javascript
async function login(email, password) {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('access_token', data.data.access_token);
    return data.data.user;
  } else {
    throw new Error(data.error);
  }
}
```

### 帶 Token 的請求

```javascript
async function getCurrentUser() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:5000/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.success ? data.data : null;
}
```

### 打卡

```javascript
async function checkin(templeId, amuletUid, latitude, longitude, notes) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:5000/api/checkin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      temple_id: templeId,
      amulet_uid: amuletUid,
      latitude,
      longitude,
      notes
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.error);
  }
}
```

---

## Python Requests 範例

### 安裝 requests

```bash
pip install requests
```

### 註冊與登入

```python
import requests

BASE_URL = 'http://localhost:5000'

# 註冊
def register(username, email, password):
    response = requests.post(
        f'{BASE_URL}/api/auth/register',
        json={
            'username': username,
            'email': email,
            'password': password
        }
    )
    return response.json()

# 登入
def login(email, password):
    response = requests.post(
        f'{BASE_URL}/api/auth/login',
        json={
            'email': email,
            'password': password
        }
    )
    data = response.json()
    if data['success']:
        return data['data']['access_token']
    return None

# 使用範例
token = login('test@example.com', 'password123')
```

### 帶 Token 的請求

```python
# 取得當前使用者資訊
def get_current_user(token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{BASE_URL}/api/auth/me', headers=headers)
    return response.json()

# 打卡
def checkin(token, temple_id, amulet_uid, lat=None, lng=None, notes=None):
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    data = {
        'temple_id': temple_id,
        'amulet_uid': amulet_uid
    }
    if lat and lng:
        data['latitude'] = lat
        data['longitude'] = lng
    if notes:
        data['notes'] = notes
    
    response = requests.post(
        f'{BASE_URL}/api/checkin',
        json=data,
        headers=headers
    )
    return response.json()

# 取得廟宇列表
def get_temples():
    response = requests.get(f'{BASE_URL}/api/temples')
    return response.json()

# 使用範例
token = login('test@example.com', 'password123')
temples = get_temples()
result = checkin(token, temples['data'][0]['id'], 'UID001')
print(result)
```

---

## 常見問題

### Q1: 如何處理 Token 過期?

**A:** 當收到 401 錯誤時,需要重新登入取得新的 Token。

```javascript
async function apiCall(url, options = {}) {
  let response = await fetch(url, options);
  
  if (response.status === 401) {
    // Token 過期,重新登入
    const email = localStorage.getItem('user_email');
    const password = prompt('請重新輸入密碼');
    await login(email, password);
    
    // 更新 Token 後重試
    options.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
    response = await fetch(url, options);
  }
  
  return response.json();
}
```

### Q2: 如何限制每日只能在同一廟宇打卡一次?

**A:** 後端已實作此邏輯,如果今日已打卡會回傳錯誤:

```json
{
  "success": false,
  "error": "今日已在此廟宇打卡"
}
```

### Q3: 如何計算使用者的連續打卡天數?

**A:** 可以透過 `/api/checkin/stats` 端點取得:

```javascript
const stats = await fetch('http://localhost:5000/api/checkin/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

console.log('連續打卡天數:', stats.data.current_streak);
```

### Q4: 如何搜尋附近的廟宇?

**A:** 使用瀏覽器的地理位置 API:

```javascript
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  
  const response = await fetch(
    `http://localhost:5000/api/temples/nearby?latitude=${latitude}&longitude=${longitude}&radius=5`
  );
  
  const data = await response.json();
  console.log('附近廟宇:', data.data);
});
```

### Q5: 資料庫連線失敗怎麼辦?

**A:** 檢查以下項目:
1. MySQL 服務是否啟動
2. 資料庫名稱是否正確
3. 使用者名稱和密碼是否正確
4. 防火牆是否阻擋連線

執行檢查指令:
```bash
python clear_app.py check-db
```

### Q6: 如何重置測試帳戶密碼?

**A:** 執行重置指令:
```bash
python clear_app.py reset-passwords
```

這會將測試帳戶密碼重置為:
- `test@example.com` → `password123`
- `admin@example.com` → `admin123`

### Q7: 如何查看系統統計資訊?

**A:** 執行統計指令:
```bash
python clear_app.py show-stats
```

或訪問 `/health` 端點:
```bash
curl http://localhost:5000/health
```

---

## 錯誤處理最佳實踐

### 前端錯誤處理範例

```javascript
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!data.success) {
      // 處理業務邏輯錯誤
      switch (response.status) {
        case 400:
          alert('請求參數錯誤: ' + data.error);
          break;
        case 401:
          alert('請先登入');
          // 重導到登入頁面
          window.location.href = '/login';
          break;
        case 403:
          alert('權限不足');
          break;
        case 404:
          alert('資源不存在');
          break;
        case 500:
          alert('伺服器錯誤,請稍後再試');
          break;
        default:
          alert('發生錯誤: ' + data.error);
      }
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('網路錯誤:', error);
    alert('網路連線失敗,請檢查您的網路設定');
    return null;
  }
}
```

---

## 安全性建議

### 1. 生產環境設定

```env
# 使用強密碼的 JWT Secret
JWT_SECRET_KEY=use-a-very-strong-random-key-here-at-least-32-chars

# 關閉除錯模式
FLASK_ENV=production
FLASK_DEBUG=False

# 使用專用資料庫使用者
DB_USER=temple_app
DB_PASSWORD=strong_password_here
```

### 2. HTTPS 設定

生產環境務必使用 HTTPS:

```python
# config.py
if not app.debug:
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
```

### 3. Rate Limiting

```bash
pip install Flask-Limiter
```

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["100 per hour"]
)

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    # ...
```

---

## 測試帳號

系統預設提供以下測試帳號:

| Email | 密碼 | 權限 | 點數 |
|-------|------|------|------|
| test@example.com | password123 | 一般使用者 | 100 |
| admin@example.com | admin123 | 管理員 | 500 |
| john@example.com | password123 | 一般使用者 | 250 |

---

## 效能優化建議

### 1. 資料庫索引

已在資料表中建立適當索引,包括:
- 使用者的 email 和 username
- 打卡記錄的時間和使用者 ID
- 廟宇的地理位置

### 2. 查詢優化

使用 View 和 Stored Procedure 來優化常用查詢:

```sql
-- 使用統計視圖
SELECT * FROM v_user_stats WHERE id = 'user_id';

-- 使用預存程序
CALL sp_get_user_checkin_stats('user_id');
```

### 3. 快取建議

考慮使用 Redis 快取常用資料:
- 廟宇列表
- 排行榜
- 使用者統計

---

## 更新日誌

### v1.0.0 (2025-01-15)
- ✅ 初始版本發布
- ✅ 實作基本認證功能
- ✅ 實作廟宇管理
- ✅ 實作打卡系統
- ✅ 實作統計功能
- ✅ MySQL 資料庫整合

---

## 聯絡與支援

如有任何問題或建議,請透過以下方式聯繫:
- GitHub Issues
- Email: support@temple-checkin.com

---

**最後更新**: 2025-01-15
**版本**: 1.0.0
