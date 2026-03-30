# 廟宇管理系統（Temple Management Platform）

## 專案簡介

一套 B2B2C 廟宇數位化管理平台，協助台灣廟宇進行數位轉型。平台提供廟方管理後台、信眾端應用、LINE 整合等功能，涵蓋打卡集點、功德商城、活動管理、推播通知、點燈服務等核心業務。

## 技術架構

```
┌─────────────────────────────────────────────────┐
│                   Nginx (port 80)                │
│              反向代理 / 靜態快取 / gzip           │
├─────────┬───────────┬───────────┬───────────────┤
│ frontend│   sgbd    │ user-web  │     liff      │
│ 廟方後台 │ 廟宇官網  │  信眾端   │ LINE 應用     │
│ React   │ React     │ React    │ React + LIFF  │
│ port 80 │ port 5174 │ port 5175│ port 5176     │
├─────────┴───────────┴───────────┴───────────────┤
│            Flask Backend (port 5000)             │
│       REST API / JWT Auth / Gunicorn             │
├─────────────────────────────────────────────────┤
│              MySQL 8.0 (port 3306)               │
│               30 張資料表                         │
└─────────────────────────────────────────────────┘
```

## 目錄結構

```
tep/
├── backend/                # Flask 後端
│   ├── app/
│   │   ├── __init__.py     # App factory (create_app)
│   │   ├── models/         # SQLAlchemy 資料模型 (30 個)
│   │   ├── routes/         # API 路由 (25 個 Blueprint)
│   │   ├── services/       # 業務服務 (LINE, 通知, 排程)
│   │   └── utils/          # 工具 (auth, logger, exceptions, file_upload)
│   ├── migrations/         # Alembic 資料庫遷移
│   ├── uploads/            # 上傳檔案目錄
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py              # 啟動入口
├── frontend/               # 廟方管理後台 (React + Vite)
├── sgbd/                   # 廟宇官網管理平台 (React + Tailwind)
├── user-web/               # 信眾端應用 (React + Ant Design)
├── liff/                   # LINE LIFF 應用 (React + Tailwind)
├── nginx/                  # Nginx 反向代理設定
├── docker-compose.yml      # Docker 一鍵部署
├── .env.example            # 環境變數模板
└── docs/                   # 技術文檔
```

## 核心技術棧

### 後端
| 技術 | 版本 | 用途 |
|------|------|------|
| Python | 3.11 | 主語言 |
| Flask | 3.0.0 | Web 框架 |
| SQLAlchemy | (Flask-SQLAlchemy 3.1.1) | ORM |
| Flask-Migrate | 4.0.5 | 資料庫遷移 (Alembic) |
| PyMySQL | 1.1.0 | MySQL 驅動 |
| PyJWT | 2.8.0 | JWT 認證 |
| bcrypt | 4.1.2 | 密碼雜湊 |
| Flask-Limiter | 3.5.0 | API 限流 |
| Flask-CORS | 4.0.0 | 跨域支援 |
| flasgger | 0.9.7.1 | Swagger API 文檔 |
| line-bot-sdk | 3.5.1 | LINE Messaging API |
| APScheduler | 3.10.4 | 排程任務 |
| Pillow | 10.1.0 | 圖片處理 |
| Gunicorn | (Docker) | 生產環境 WSGI |

### 前端
| 專案 | UI 框架 | 狀態管理 | HTTP 客戶端 | 特殊依賴 |
|------|---------|---------|------------|---------|
| frontend | Recharts | React Query v5 | Axios | - |
| sgbd | Tailwind CSS v4 + Framer Motion | Context API | Fetch | lunar-typescript (農曆) |
| user-web | Ant Design v6 | Zustand | (Mock 數據) | dayjs |
| liff | Tailwind CSS v4 | Context API | Fetch | @line/liff v2.28 |

所有前端專案皆使用 **React 19 + Vite + React Router v7**。

## 帳號系統

系統採用**三表帳號架構**，三種角色存放在獨立的資料表中：

| 角色 | 資料表 | 用途 | 登入方式 |
|------|--------|------|---------|
| 一般信眾 | `public_users` | 打卡、兌換、祈福 | Email + 密碼 |
| 廟方管理員 | `temple_admin_users` | 管理單一廟宇 | Email + 密碼 |
| 系統管理員 | `super_admin_users` | 管理整個平台 | Email + 密碼 |

### 認證機制
- **JWT 雙 Token**：Access Token (1 小時) + Refresh Token (7 天)
- 統一登入 API `POST /api/auth/login`，透過 `login_type` 區分帳號類型
- Refresh Token 存入資料庫，支援撤銷（登出時失效）

## 核心業務功能

### 信眾端
- **平安符系統**：虛擬護身符，打卡累積能量
- **廟宇打卡**：GPS 定位 + NFC 感應打卡，累積功德值
- **功德商城**：功德值兌換商品，含完整訂單流程
- **排行榜**：功德值 / 打卡次數 / 廟宇人氣排行
- **通知系統**：獎勵通知、訂單通知、廟宇公告

### 廟方管理
- **廟宇資訊管理**：基本資料、開放時間、圖片
- **活動管理**：建立活動 → 發布 → 報名管理 → 截止
- **推播通知**：LINE multicast + APP 站內通知，支援排程
- **點燈服務**：線上申請、管理、收費
- **進香登記**：線上預約進香團
- **數據分析**：訪客統計、收入報表、經營診斷
- **資料匯出**：簽到 / 訂單 / 收入 CSV 匯出

### LINE 整合
- **LINE Webhook**：接收 follow/unfollow/message 事件
- **LIFF 應用**：LINE 內嵌活動報名頁面
- **LINE 推播**：Flex Message 樣式通知

## 部署方式

```bash
# 1. 複製環境變數
cp .env.example .env
# 2. 編輯 .env 填入實際密鑰
# 3. 一鍵啟動
docker-compose up -d --build
```

## 相關文檔

- [API 規格書](./API_SPEC.md) — 全部 API 端點詳細說明
- [資料庫結構](./DATABASE_SCHEMA.md) — 30 張資料表完整欄位定義
- [前端架構](./FRONTEND_ARCHITECTURE.md) — 4 個前端專案路由與通訊方式
