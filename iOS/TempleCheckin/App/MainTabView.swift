/**
 * 主要 Tab 導航視圖
 * 參考：平安符打卡系統 PDF
 */

import SwiftUI

struct MainTabView: View {
    // MARK: - State

    @State private var selectedTab = 0

    // MARK: - Body

    var body: some View {
        TabView(selection: $selectedTab) {
            // 廟宇首頁
            TempleHomeView()
                .tabItem {
                    Label("廟宇", systemImage: selectedTab == 0 ? "building.2.fill" : "building.2")
                }
                .tag(0)

            // 平安符
            AmuletInfoView()
                .tabItem {
                    Label("平安符", systemImage: selectedTab == 1 ? "scroll.fill" : "scroll")
                }
                .tag(1)

            // 成就
            AchievementView()
                .tabItem {
                    Label("成就", systemImage: selectedTab == 2 ? "trophy.fill" : "trophy")
                }
                .tag(2)

            // 地圖搜尋
            MapView()
                .tabItem {
                    Label("地圖", systemImage: selectedTab == 3 ? "map.fill" : "map")
                }
                .tag(3)

            // 設定
            SettingsView()
                .tabItem {
                    Label("設定", systemImage: selectedTab == 4 ? "gearshape.fill" : "gearshape")
                }
                .tag(4)
        }
        .accentColor(AppTheme.gold)
    }
}

// MARK: - Preview

#Preview {
    MainTabView()
}
