# 系統管理後台 (System Admin Web)

廟方打卡系統的系統管理後台，提供完整的系統管理功能。

## 技術棧

- **React 19** - 前端框架
- **Vite 7** - 建置工具
- **Ant Design 6** - UI 組件庫
- **React Router 7** - 路由管理
- **TanStack Query** - 資料請求與快取
- **Zustand** - 狀態管理
- **Axios** - HTTP 請求
- **Day.js** - 日期處理

## 功能模組

### 已實作
- ✅ 登入/登出
- ✅ 儀表板（系統總覽）
- ✅ 使用者管理列表
- ✅ 佈局與導航

### 待實作
- ⏳ 使用者詳情與操作
- ⏳ 廟宇管理
- ⏳ 廟宇申請審核
- ⏳ 商品管理與審核
- ⏳ 兌換訂單管理
- ⏳ 數據分析圖表
- ⏳ 檢舉管理
- ⏳ 系統日誌
- ⏳ 系統設定
- ⏳ 管理員權限管理

## 開發指南

### 安裝依賴

```bash
npm install
```

### 環境設定

建立 `.env` 檔案：

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 啟動開發伺服器

```bash
npm run dev
```

開發伺服器會在 http://localhost:5173 啟動。

### 建置生產版本

```bash
npm run build
```

## 預設登入資訊

- 帳號：`admin`
- 密碼：`admin123`

（需先在後端執行 `python backend/create_admin.py` 建立管理員帳號）

## 專案結構

完整的模組化架構，包含 API 服務層、頁面、組件、工具函數等。

## 開發注意事項

1. 所有組件使用函數式組件 + Hooks
2. API 調用統一使用 React Query
3. 使用 Ant Design 的組件和設計規範
4. 註解使用繁體中文
5. 遵循 ESLint 規則
