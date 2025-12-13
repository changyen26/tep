# 平安符打卡系統 - iOS App

基於 SwiftUI 開發的平安符打卡系統 iOS 原生應用程式。

## 專案結構

```
iOS/
├── TempleCheckin.xcodeproj/     # Xcode 專案設定
├── TempleCheckin/               # 主要程式碼
│   ├── App/                     # App 入口與導航
│   │   ├── TempleCheckinApp.swift    # App 主入口
│   │   └── MainTabView.swift          # Tab 導航
│   ├── Views/                   # 視圖層
│   │   ├── Auth/                # 認證相關
│   │   │   └── LoginView.swift        # 登入/註冊頁面
│   │   ├── Temple/              # 廟宇相關
│   │   │   └── TempleHomeView.swift   # 廟宇首頁
│   │   ├── Prayer/              # 祈福相關
│   │   │   ├── PrayerInstructionView.swift  # 祈福說明
│   │   │   └── PrayerProcessView.swift      # 祈福進度
│   │   ├── Amulet/              # 平安符相關
│   │   │   ├── AmuletInfoView.swift         # 平安符資訊
│   │   │   └── AmuletHistoryView.swift      # 平安符歷史
│   │   ├── Achievement/         # 成就相關
│   │   │   └── AchievementView.swift        # 成就系統
│   │   ├── Map/                 # 地圖相關
│   │   │   └── MapView.swift              # 地圖搜尋
│   │   ├── Settings/            # 設定相關
│   │   │   └── SettingsView.swift         # 設定頁面
│   │   ├── Profile/             # 個人相關
│   │   │   └── ProfileView.swift          # 個人帳號
│   │   └── Components/          # 共用元件
│   ├── ViewModels/              # 視圖模型層
│   ├── Models/                  # 資料模型層
│   ├── Services/                # 服務層
│   ├── Utils/                   # 工具類
│   │   └── Theme.swift          # 主題設定
│   ├── Resources/               # 資源檔案
│   ├── Assets.xcassets/         # 圖片資源
│   └── Info.plist               # App 資訊設定
├── README.md                     # 本文件
└── .gitignore                   # Git 忽略設定
```

## 技術棧

- **語言**: Swift 5.0+
- **框架**: SwiftUI
- **最低支援**: iOS 16.0+
- **架構**: MVVM (Model-View-ViewModel)
- **地圖**: MapKit
- **依賴管理**: Swift Package Manager (未來可加入)

## 主要功能

### 1. 認證系統
- 登入/註冊功能
- 表單驗證
- 模擬認證

### 2. 廟宇首頁
- 廟宇資訊展示
- 空氣品質顯示
- 農曆日期顯示
- 祈福入口

### 3. 祈福流程
- 祈福說明步驟
- 祈福進度動畫
- 彩虹圓環進度條
- 自動完成導航

### 4. 平安符系統
- 3D 平安符展示
- 等級與經驗值
- 福報值進度條
- 歷史紀錄查看
- 長條圖統計

### 5. 成就系統
- NFT 成就卡片
- 成就網格展示
- 解鎖狀態顯示
- 成就分類統計

### 6. 地圖搜尋
- 廟宇地圖標記
- 廟宇資訊卡片
- 導航功能
- 距離計算

### 7. 設定頁面
- 綁定平安符
- 通知設定
- 過往紀錄
- 其他設定

### 8. 個人帳號
- 用戶資訊展示
- 帳號管理
- 隱私設定
- 家人好友系統
- 付款與訂閱

## 設計系統

### 顏色主題

```swift
// 富貴金 (Wealth Gold)
#BDA138 - 主要品牌色，象徵神聖、光明、富貴

// 玄帝黑 (Xuandi Black)
#242428 - 主要深色背景，象徵北方、水、玄天上帝

// 漸層色
金色漸層: #BDA138 → #D4B756
深色漸層: #242428 → #1A1A1D
```

### 字體大小

- **title1**: 32pt
- **title2**: 28pt
- **title3**: 24pt
- **headline**: 20pt
- **body**: 16pt
- **callout**: 14pt
- **caption**: 12pt
- **caption2**: 11pt

### 間距

- **xs**: 4pt
- **sm**: 8pt
- **md**: 12pt
- **lg**: 16pt
- **xl**: 20pt
- **xxl**: 24pt
- **xxxl**: 32pt

### 圓角

- **sm**: 8pt
- **md**: 12pt
- **lg**: 16pt
- **xl**: 20pt
- **xxl**: 24pt

## 如何使用

### 必要條件

- Xcode 15.0 或更高版本
- iOS 16.0 或更高版本
- macOS 13.0 或更高版本

### 建置步驟

1. 使用 Xcode 開啟專案
```bash
cd iOS
open TempleCheckin.xcodeproj
```

2. 選擇目標裝置或模擬器

3. 按下 Cmd + R 執行專案

### 使用模擬器測試

建議使用以下模擬器：
- iPhone 15 Pro (iOS 17.0)
- iPhone 15 (iOS 17.0)
- iPhone 14 Pro Max (iOS 16.0)

### 測試帳號

```
Email: test@example.com
Password: 123456
```

## 資料流

```
LoginView → MainTabView → [TempleHomeView, AmuletInfoView, AchievementView, MapView, SettingsView]
                           ↓
                    PrayerInstructionView → PrayerProcessView → AmuletInfoView
                           ↓
                    AmuletInfoView → AmuletHistoryView
                           ↓
                    TempleHomeView → ProfileView
```

## 動畫效果

- **登入頁面**: 模式切換動畫
- **廟宇首頁**: 淡入動畫
- **祈福進度**: 彩虹圓環進度動畫、香爐縮放動畫
- **平安符**: 3D 旋轉動畫、浮動效果
- **成就系統**: 淡入動畫、點擊切換動畫
- **地圖**: 標記點擊動畫、卡片滑入動畫
- **設定頁面**: 列表項目淡入動畫
- **個人帳號**: 卡片淡入動畫

## 未來開發計劃

- [ ] 串接後端 API
- [ ] 實作用戶認證系統
- [ ] 加入推播通知
- [ ] 實作 QR Code 掃描
- [ ] 加入相機功能
- [ ] 實作位置追蹤
- [ ] 優化動畫效能
- [ ] 加入多語系支援
- [ ] 實作深色模式
- [ ] 加入分享功能

## 注意事項

1. 目前所有資料都是模擬資料，尚未串接後端 API
2. 地圖功能需要在實體裝置上測試
3. 某些功能顯示「開發中」提示
4. 建議在 iOS 16.0+ 裝置上執行以獲得最佳體驗

## 授權

本專案僅供學習與開發使用。

## 聯絡資訊

如有任何問題或建議，請聯繫開發團隊。
