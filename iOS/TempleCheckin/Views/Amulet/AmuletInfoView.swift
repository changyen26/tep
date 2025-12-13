/**
 * 平安符資訊頁面
 * 參考：平安符打卡系統 PDF 第7頁第4張
 */

import SwiftUI

struct AmuletInfoView: View {
    // MARK: - State

    @State private var navigateToHistory = false
    @State private var rotation: Double = 0

    // MARK: - Mock Data

    private let amuletData = (
        level: 1,
        currentPoints: 86,
        maxPoints: 100,
        totalPoints: 286
    )

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                // 背景漸層
                AppTheme.darkGradient
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: AppTheme.Spacing.xxxl) {
                        // 3D 平安符模型
                        amuletModel
                            .padding(.top, AppTheme.Spacing.xxxl)

                        // 等級與進度資訊
                        VStack(spacing: AppTheme.Spacing.xxl) {
                            // 等級顯示
                            levelDisplay

                            // 進度條
                            progressBar

                            // 積分累積說明
                            pointsDescription
                        }
                        .padding(.horizontal, AppTheme.Spacing.xl)

                        // 查看歷史紀錄按鈕
                        Button(action: { navigateToHistory = true }) {
                            HStack {
                                Image(systemName: "chart.bar.fill")
                                    .font(.system(size: 20))
                                Text("查看歷史紀錄")
                                    .font(.system(size: AppTheme.FontSize.headline, weight: .semibold))
                            }
                            .foregroundColor(AppTheme.dark)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(
                                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                                    .fill(AppTheme.goldGradient)
                                    .shadow(
                                        color: AppTheme.gold.opacity(0.3),
                                        radius: 12,
                                        x: 0,
                                        y: 4
                                    )
                            )
                        }
                        .padding(.horizontal, AppTheme.Spacing.xl)
                        .padding(.bottom, AppTheme.Spacing.xxxl)
                    }
                }
            }
            .navigationDestination(isPresented: $navigateToHistory) {
                AmuletHistoryView()
            }
        }
    }

    // MARK: - Components

    private var amuletModel: some View {
        ZStack {
            // 背景光暈
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            AppTheme.gold.opacity(0.3),
                            AppTheme.gold.opacity(0.1),
                            Color.clear
                        ],
                        center: .center,
                        startRadius: 50,
                        endRadius: 150
                    )
                )
                .frame(width: 300, height: 300)
                .blur(radius: 20)

            // 平安符圖案 - 使用 SF Symbol 模擬
            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .fill(AppTheme.goldGradient)
                    .frame(width: 180, height: 220)
                    .shadow(
                        color: AppTheme.gold.opacity(0.5),
                        radius: 20,
                        x: 0,
                        y: 10
                    )
                    .rotation3DEffect(
                        .degrees(rotation),
                        axis: (x: 0, y: 1, z: 0),
                        perspective: 0.5
                    )

                VStack(spacing: AppTheme.Spacing.md) {
                    Image(systemName: "scroll.fill")
                        .font(.system(size: 60))
                        .foregroundColor(AppTheme.dark)

                    Text("平安符")
                        .font(.system(size: AppTheme.FontSize.title3, weight: .bold))
                        .foregroundColor(AppTheme.dark)
                        .tracking(4)
                }
                .rotation3DEffect(
                    .degrees(rotation),
                    axis: (x: 0, y: 1, z: 0),
                    perspective: 0.5
                )
            }
            .onAppear {
                withAnimation(.linear(duration: 3).repeatForever(autoreverses: false)) {
                    rotation = 360
                }
            }
        }
    }

    private var levelDisplay: some View {
        HStack(spacing: AppTheme.Spacing.lg) {
            // 等級圖標
            ZStack {
                Circle()
                    .fill(AppTheme.goldGradient)
                    .frame(width: 80, height: 80)
                    .shadow(
                        color: AppTheme.gold.opacity(0.3),
                        radius: 8,
                        x: 0,
                        y: 4
                    )

                VStack(spacing: 2) {
                    Text("Lv")
                        .font(.system(size: AppTheme.FontSize.caption, weight: .semibold))
                        .foregroundColor(AppTheme.dark.opacity(0.8))

                    Text("\(amuletData.level)")
                        .font(.system(size: AppTheme.FontSize.title2, weight: .bold))
                        .foregroundColor(AppTheme.dark)
                }
            }

            // 等級說明
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text("當前等級")
                    .font(.system(size: AppTheme.FontSize.callout, weight: .medium))
                    .foregroundColor(AppTheme.whiteAlpha06)

                Text("初階信徒")
                    .font(.system(size: AppTheme.FontSize.headline, weight: .bold))
                    .foregroundColor(AppTheme.gold)

                Text("再累積 \(amuletData.maxPoints - amuletData.currentPoints) 點升級")
                    .font(.system(size: AppTheme.FontSize.caption))
                    .foregroundColor(AppTheme.whiteAlpha06)
            }

            Spacer()
        }
    }

    private var progressBar: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            // 進度標籤
            HStack {
                Text("福報值")
                    .font(.system(size: AppTheme.FontSize.callout, weight: .semibold))
                    .foregroundColor(AppTheme.gold)

                Spacer()

                Text("\(amuletData.currentPoints)/\(amuletData.maxPoints)")
                    .font(.system(size: AppTheme.FontSize.callout, weight: .bold))
                    .foregroundColor(AppTheme.gold)
            }

            // 進度條
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // 背景
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.white.opacity(0.1))
                        .frame(height: 16)

                    // 進度
                    RoundedRectangle(cornerRadius: 8)
                        .fill(AppTheme.goldGradient)
                        .frame(
                            width: geometry.size.width * CGFloat(amuletData.currentPoints) / CGFloat(amuletData.maxPoints),
                            height: 16
                        )
                        .shadow(
                            color: AppTheme.gold.opacity(0.5),
                            radius: 8,
                            x: 0,
                            y: 0
                        )
                }
            }
            .frame(height: 16)
        }
    }

    private var pointsDescription: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            // 總積分卡片
            HStack {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                    Text("總累積福報值")
                        .font(.system(size: AppTheme.FontSize.callout))
                        .foregroundColor(AppTheme.whiteAlpha06)

                    Text("\(amuletData.totalPoints)")
                        .font(.system(size: AppTheme.FontSize.title2, weight: .bold))
                        .foregroundColor(AppTheme.gold)
                }

                Spacer()

                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.system(size: 32))
                    .foregroundColor(AppTheme.gold.opacity(0.6))
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

            // 說明文字
            Text("每日打卡、祈福可累積福報值，福報值達到一定數量即可升級並解鎖更多功能")
                .font(.system(size: AppTheme.FontSize.caption))
                .foregroundColor(AppTheme.whiteAlpha06)
                .lineSpacing(4)
                .multilineTextAlignment(.center)
        }
    }
}

// MARK: - Preview

#Preview {
    AmuletInfoView()
}
