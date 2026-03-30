# 廟宇管理系統（Temple Management Platform）

## 快速導覽
- **專案類型**：B2B2C 廟宇數位化管理平台
- **後端**：Flask 3.0 + SQLAlchemy + MySQL 8.0（`backend/`）
- **前端**：4 個 React 19 + Vite 專案（`frontend/`, `sgbd/`, `user-web/`, `liff/`）
- **部署**：Docker Compose（`docker-compose.yml`）
- **語言**：所有 UI 文字和回應訊息使用繁體中文

## 重要規範
- 後端啟動入口：`backend/run.py`
- App Factory：`backend/app/__init__.py` → `create_app()`
- 認證：JWT 雙 Token（Access 1hr + Refresh 7天），見 `backend/app/utils/auth.py`
- 三表帳號系統：`public_users` / `temple_admin_users` / `super_admin_users`
- API 回應格式：`{status, message, data}`
- Swagger UI：`/api/docs/`

## 技術文檔
- `docs/PROJECT_OVERVIEW.md` — 架構總覽、目錄結構、技術棧
- `docs/API_SPEC.md` — 全部 API 端點（~105 個）
- `docs/DATABASE_SCHEMA.md` — 30 張資料表完整欄位
- `docs/FRONTEND_ARCHITECTURE.md` — 4 個前端專案路由與通訊

## 開發指令
```bash
# 後端
cd backend && pip install -r requirements.txt && python run.py

# 前端（任一）
cd frontend && npm install && npm run dev    # port 5173
cd sgbd && npm install && npm run dev        # port 5174
cd user-web && npm install && npm run dev    # port 5175
cd liff && npm install && npm run dev        # port 5176

# Docker 一鍵啟動
docker-compose up -d --build
```

## 已知技術債
- 舊版 `users` / `system_admins` 表仍被部分路由引用（標記 deprecated）
- `user-web` 尚未接後端 API（使用 Mock 數據）
- LIFF `temple_id` 硬編碼為 1（不支援多廟宇）
- `frontend` 和 `sgbd` 廟方管理功能重疊，未來應整合
