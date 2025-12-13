/**
 * 平安符打卡系統 - iOS App 主入口
 */

import SwiftUI

@main
struct TempleCheckinApp: App {
    // MARK: - State

    /// 是否已登入
    @State private var isLoggedIn = false

    // MARK: - Body

    var body: some Scene {
        WindowGroup {
            if isLoggedIn {
                MainTabView()
            } else {
                LoginView(isLoggedIn: $isLoggedIn)
            }
        }
    }
}
