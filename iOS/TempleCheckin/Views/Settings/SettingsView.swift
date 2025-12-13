/**
 * 設定頁面
 * 參考：平安符打卡系統 PDF 第8頁第4張
 */

import SwiftUI

struct SettingsView: View {
    // MARK: - State

    @State private var showingAlert = false
    @State private var alertMessage = ""

    // MARK: - Mock Data

    private let settingOptions = [
        SettingOption(
            id: "bind",
            icon: "tag.fill",
            title: "綁定平安符",
            description: "綁定實體平安符以獲取福報"
        ),
        SettingOption(
            id: "notification",
            icon: "bell.fill",
            title: "通知",
            description: "管理推播通知設定"
        ),
        SettingOption(
            id: "history",
            icon: "clock.fill",
            title: "過往紀錄",
            description: "查看祈福與打卡紀錄"
        ),
        SettingOption(
            id: "other",
            icon: "gearshape.fill",
            title: "其他",
            description: "更多設定選項"
        )
    ]

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                // 背景漸層
                AppTheme.goldGradient
                    .ignoresSafeArea()

                // 裝飾圖案
                decorativePatterns

                // 主要內容
                ScrollView {
                    VStack(spacing: AppTheme.Spacing.xxxl) {
                        // 標題
                        Text("設定")
                            .font(.system(size: AppTheme.FontSize.title1, weight: .bold))
                            .foregroundColor(AppTheme.dark)
                            .tracking(4)
                            .padding(.top, AppTheme.Spacing.xxxl)

                        // 設定選項列表
                        VStack(spacing: AppTheme.Spacing.lg) {
                            ForEach(Array(settingOptions.enumerated()), id: \.element.id) { index, option in
                                SettingOptionCard(
                                    option: option,
                                    index: index
                                )
                                .onTapGesture {
                                    handleOptionTap(option)
                                }
                            }
                        }
                        .padding(.horizontal, AppTheme.Spacing.xl)
                        .padding(.bottom, AppTheme.Spacing.xxxl)
                    }
                }
            }
        }
        .alert("提示", isPresented: $showingAlert) {
            Button("確定", role: .cancel) { }
        } message: {
            Text(alertMessage)
        }
    }

    // MARK: - Components

    private var decorativePatterns: some View {
        ZStack {
            // 蛇圖案裝飾 (右上)
            Image(systemName: "figure.wave")
                .font(.system(size: 100))
                .foregroundColor(AppTheme.dark.opacity(0.1))
                .rotationEffect(.degrees(45))
                .offset(x: 120, y: -200)

            // 齒輪圖案裝飾 (左下)
            Image(systemName: "gearshape.fill")
                .font(.system(size: 80))
                .foregroundColor(AppTheme.dark.opacity(0.1))
                .offset(x: -120, y: 200)
                .rotationEffect(.degrees(0))
        }
    }

    // MARK: - Methods

    private func handleOptionTap(_ option: SettingOption) {
        alertMessage = "\(option.title)功能開發中"
        showingAlert = true
    }
}

// MARK: - Setting Option Model

struct SettingOption: Identifiable {
    let id: String
    let icon: String
    let title: String
    let description: String
}

// MARK: - Setting Option Card

struct SettingOptionCard: View {
    let option: SettingOption
    let index: Int

    var body: some View {
        HStack(spacing: AppTheme.Spacing.lg) {
            // 圖標
            ZStack {
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                    .fill(Color.white.opacity(0.2))
                    .frame(width: 56, height: 56)

                Image(systemName: option.icon)
                    .font(.system(size: 28))
                    .foregroundColor(AppTheme.dark)
            }

            // 內容
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text(option.title)
                    .font(.system(size: AppTheme.FontSize.headline, weight: .bold))
                    .foregroundColor(AppTheme.dark)

                Text(option.description)
                    .font(.system(size: AppTheme.FontSize.caption))
                    .foregroundColor(AppTheme.dark.opacity(0.7))
                    .lineLimit(1)
            }

            Spacer()

            // 箭頭
            Image(systemName: "chevron.right")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(AppTheme.dark.opacity(0.6))
        }
        .padding(AppTheme.Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                .fill(Color.white.opacity(0.8))
                .shadow(
                    color: AppTheme.dark.opacity(0.2),
                    radius: 8,
                    x: 0,
                    y: 4
                )
        )
    }
}

// MARK: - Preview

#Preview {
    SettingsView()
}
