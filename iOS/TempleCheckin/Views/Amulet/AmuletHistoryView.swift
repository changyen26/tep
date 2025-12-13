/**
 * 平安符歷史紀錄頁面
 * 參考：平安符打卡系統 PDF
 */

import SwiftUI

struct AmuletHistoryView: View {
    // MARK: - State

    @Environment(\.dismiss) private var dismiss

    // MARK: - Mock Data

    private let historyData = [
        (date: "12/01", points: 45),
        (date: "12/02", points: 60),
        (date: "12/03", points: 30),
        (date: "12/04", points: 75),
        (date: "12/05", points: 50)
    ]

    private var maxPoints: Int {
        historyData.map { $0.points }.max() ?? 100
    }

    private var totalPoints: Int {
        historyData.reduce(0) { $0 + $1.points }
    }

    // MARK: - Body

    var body: some View {
        ZStack {
            // 背景漸層
            AppTheme.darkGradient
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: AppTheme.Spacing.xxxl) {
                    // 標題
                    Text("福報值歷史紀錄")
                        .font(.system(size: AppTheme.FontSize.title2, weight: .bold))
                        .foregroundColor(AppTheme.gold)
                        .tracking(2)
                        .padding(.top, AppTheme.Spacing.xxl)

                    // 統計資訊卡片
                    statsCard

                    // 長條圖
                    barChart
                        .padding(.horizontal, AppTheme.Spacing.xl)

                    // 詳細紀錄列表
                    recordsList
                        .padding(.horizontal, AppTheme.Spacing.xl)
                        .padding(.bottom, AppTheme.Spacing.xxxl)
                }
            }
        }
        .navigationBarBackButtonHidden(false)
    }

    // MARK: - Components

    private var statsCard: some View {
        HStack(spacing: AppTheme.Spacing.xl) {
            // 總積分
            VStack(spacing: AppTheme.Spacing.xs) {
                Text("總累積")
                    .font(.system(size: AppTheme.FontSize.caption))
                    .foregroundColor(AppTheme.whiteAlpha06)

                Text("\(totalPoints)")
                    .font(.system(size: AppTheme.FontSize.title2, weight: .bold))
                    .foregroundColor(AppTheme.gold)

                Text("福報值")
                    .font(.system(size: AppTheme.FontSize.caption2))
                    .foregroundColor(AppTheme.whiteAlpha06)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppTheme.Spacing.lg)
            .background(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                    .fill(Color.white.opacity(0.05))
                    .overlay(
                        RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                            .stroke(AppTheme.gold.opacity(0.3), lineWidth: 1)
                    )
            )

            // 平均積分
            VStack(spacing: AppTheme.Spacing.xs) {
                Text("平均")
                    .font(.system(size: AppTheme.FontSize.caption))
                    .foregroundColor(AppTheme.whiteAlpha06)

                Text("\(totalPoints / historyData.count)")
                    .font(.system(size: AppTheme.FontSize.title2, weight: .bold))
                    .foregroundColor(AppTheme.gold)

                Text("福報值/日")
                    .font(.system(size: AppTheme.FontSize.caption2))
                    .foregroundColor(AppTheme.whiteAlpha06)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppTheme.Spacing.lg)
            .background(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                    .fill(Color.white.opacity(0.05))
                    .overlay(
                        RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                            .stroke(AppTheme.gold.opacity(0.3), lineWidth: 1)
                    )
            )
        }
        .padding(.horizontal, AppTheme.Spacing.xl)
    }

    private var barChart: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            Text("近5日福報值")
                .font(.system(size: AppTheme.FontSize.headline, weight: .semibold))
                .foregroundColor(AppTheme.gold)

            // 長條圖容器
            HStack(alignment: .bottom, spacing: AppTheme.Spacing.md) {
                ForEach(Array(historyData.enumerated()), id: \.offset) { index, data in
                    VStack(spacing: AppTheme.Spacing.xs) {
                        // 數值標籤
                        Text("\(data.points)")
                            .font(.system(size: AppTheme.FontSize.caption2, weight: .semibold))
                            .foregroundColor(AppTheme.gold)

                        // 長條
                        RoundedRectangle(cornerRadius: 6)
                            .fill(AppTheme.goldGradient)
                            .frame(
                                width: 50,
                                height: CGFloat(data.points) / CGFloat(maxPoints) * 150
                            )
                            .shadow(
                                color: AppTheme.gold.opacity(0.3),
                                radius: 8,
                                x: 0,
                                y: 2
                            )

                        // 日期標籤
                        Text(data.date)
                            .font(.system(size: AppTheme.FontSize.caption2))
                            .foregroundColor(AppTheme.whiteAlpha06)
                    }
                }
            }
            .frame(maxWidth: .infinity)
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

    private var recordsList: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            Text("詳細紀錄")
                .font(.system(size: AppTheme.FontSize.headline, weight: .semibold))
                .foregroundColor(AppTheme.gold)

            VStack(spacing: AppTheme.Spacing.sm) {
                ForEach(Array(historyData.enumerated()), id: \.offset) { index, data in
                    HStack {
                        // 日期
                        HStack(spacing: AppTheme.Spacing.xs) {
                            Image(systemName: "calendar")
                                .font(.system(size: 16))
                                .foregroundColor(AppTheme.gold.opacity(0.6))

                            Text(data.date)
                                .font(.system(size: AppTheme.FontSize.callout))
                                .foregroundColor(AppTheme.whiteAlpha08)
                        }

                        Spacer()

                        // 積分
                        HStack(spacing: 4) {
                            Text("+\(data.points)")
                                .font(.system(size: AppTheme.FontSize.body, weight: .bold))
                                .foregroundColor(AppTheme.gold)

                            Image(systemName: "arrow.up.circle.fill")
                                .font(.system(size: 16))
                                .foregroundColor(.green.opacity(0.8))
                        }
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(
                        RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                            .fill(Color.white.opacity(0.05))
                            .overlay(
                                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                                    .stroke(AppTheme.gold.opacity(0.2), lineWidth: 1)
                            )
                    )
                }
            }
        }
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        AmuletHistoryView()
    }
}
