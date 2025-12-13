/**
 * 個人帳號頁面
 * 參考：平安符打卡系統 PDF 第8頁第1張
 */

import SwiftUI

struct ProfileView: View {
    // MARK: - State

    @State private var showingAlert = false
    @State private var alertMessage = ""
    @Environment(\.dismiss) private var dismiss

    // MARK: - Mock Data

    private let userData = (
        name: "王曉明",
        nickname: "信友",
        avatar: nil as String?
    )

    private let profileOptions = [
        ProfileOption(
            id: "info",
            icon: "person.fill",
            title: "個人資訊",
            description: "編輯姓名、生日等基本資料"
        ),
        ProfileOption(
            id: "account",
            icon: "lock.fill",
            title: "帳號與密碼",
            description: "修改帳號、密碼等安全設定"
        ),
        ProfileOption(
            id: "privacy",
            icon: "hand.raised.fill",
            title: "資料與隱私",
            description: "管理隱私設定與資料使用"
        ),
        ProfileOption(
            id: "family",
            icon: "person.3.fill",
            title: "家人好友系統",
            description: "管理家人好友關係"
        ),
        ProfileOption(
            id: "payment",
            icon: "creditcard.fill",
            title: "付款與訂閱",
            description: "管理付款方式與訂閱服務"
        )
    ]

    // MARK: - Body

    var body: some View {
        ZStack {
            // 背景漸層
            AppTheme.darkGradient
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: AppTheme.Spacing.xxxl) {
                    // 頂部用戶資訊區域
                    userHeader
                        .padding(.top, AppTheme.Spacing.xxxl)

                    // 個人帳號選項列表
                    VStack(spacing: AppTheme.Spacing.md) {
                        ForEach(Array(profileOptions.enumerated()), id: \.element.id) { index, option in
                            ProfileOptionCard(
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

            // 右上角資訊圖標
            VStack {
                HStack {
                    Spacer()
                    Button(action: {
                        alertMessage = "這裡可以查看更多資訊"
                        showingAlert = true
                    }) {
                        ZStack {
                            Circle()
                                .fill(AppTheme.gold.opacity(0.2))
                                .frame(width: 40, height: 40)
                                .overlay(
                                    Circle()
                                        .stroke(AppTheme.gold.opacity(0.3), lineWidth: 1)
                                )

                            Image(systemName: "info.circle.fill")
                                .font(.system(size: 20))
                                .foregroundColor(AppTheme.gold)
                        }
                    }
                    .padding(.top, AppTheme.Spacing.lg)
                    .padding(.trailing, AppTheme.Spacing.lg)
                }
                Spacer()
            }
        }
        .navigationBarBackButtonHidden(false)
        .alert("提示", isPresented: $showingAlert) {
            Button("確定", role: .cancel) { }
        } message: {
            Text(alertMessage)
        }
    }

    // MARK: - Components

    private var userHeader: some View {
        VStack(spacing: AppTheme.Spacing.xxl) {
            // 用戶頭像
            ZStack {
                Circle()
                    .fill(AppTheme.goldGradient)
                    .frame(width: 100, height: 100)
                    .shadow(
                        color: AppTheme.gold.opacity(0.3),
                        radius: 12,
                        x: 0,
                        y: 8
                    )

                if let _ = userData.avatar {
                    // 如果有頭像，這裡顯示圖片
                    Image(systemName: "person.fill")
                        .font(.system(size: 48))
                        .foregroundColor(AppTheme.dark)
                } else {
                    Image(systemName: "person.fill")
                        .font(.system(size: 48))
                        .foregroundColor(AppTheme.dark)
                }
            }

            // 用戶資訊
            VStack(spacing: AppTheme.Spacing.xs) {
                Text(userData.name)
                    .font(.system(size: AppTheme.FontSize.title2, weight: .bold))
                    .foregroundColor(AppTheme.gold)

                Text(userData.nickname)
                    .font(.system(size: AppTheme.FontSize.callout))
                    .foregroundColor(AppTheme.whiteAlpha06)
            }

            // 問候語
            VStack(spacing: AppTheme.Spacing.xs) {
                Text("【祝您有個美好的一天】")
                    .font(.system(size: AppTheme.FontSize.callout, weight: .medium))
                    .foregroundColor(AppTheme.whiteAlpha08)

                Text("祝您身體健康 福運滿滿")
                    .font(.system(size: AppTheme.FontSize.callout, weight: .medium))
                    .foregroundColor(AppTheme.whiteAlpha08)
            }
            .padding(AppTheme.Spacing.lg)
            .background(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                    .fill(Color.white.opacity(0.05))
                    .overlay(
                        RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                            .stroke(AppTheme.gold.opacity(0.3), lineWidth: 1)
                    )
            )
            .padding(.horizontal, AppTheme.Spacing.xl)
        }
    }

    // MARK: - Methods

    private func handleOptionTap(_ option: ProfileOption) {
        alertMessage = "\(option.title)功能開發中"
        showingAlert = true
    }
}

// MARK: - Profile Option Model

struct ProfileOption: Identifiable {
    let id: String
    let icon: String
    let title: String
    let description: String
}

// MARK: - Profile Option Card

struct ProfileOptionCard: View {
    let option: ProfileOption
    let index: Int

    var body: some View {
        HStack(spacing: AppTheme.Spacing.lg) {
            // 圖標
            ZStack {
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                    .fill(AppTheme.gold.opacity(0.15))
                    .frame(width: 48, height: 48)

                Image(systemName: option.icon)
                    .font(.system(size: 24))
                    .foregroundColor(AppTheme.gold)
            }

            // 內容
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text(option.title)
                    .font(.system(size: AppTheme.FontSize.body, weight: .semibold))
                    .foregroundColor(AppTheme.gold)

                Text(option.description)
                    .font(.system(size: AppTheme.FontSize.caption))
                    .foregroundColor(AppTheme.whiteAlpha06)
                    .lineLimit(1)
            }

            Spacer()

            // 箭頭
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(AppTheme.gold.opacity(0.6))
        }
        .padding(AppTheme.Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                .fill(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                        .stroke(AppTheme.gold.opacity(0.2), lineWidth: 1)
                )
        )
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        ProfileView()
    }
}
