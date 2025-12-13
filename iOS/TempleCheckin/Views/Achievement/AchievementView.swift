/**
 * 成就系統頁面
 * 參考：平安符打卡系統 PDF 第8頁
 */

import SwiftUI

struct AchievementView: View {
    // MARK: - State

    @State private var selectedAchievement: Achievement?

    // MARK: - Mock Data

    private let achievements = [
        Achievement(
            id: "1",
            title: "初心者",
            description: "完成第一次祈福",
            icon: "flame",
            unlocked: true,
            type: "祈福成就"
        ),
        Achievement(
            id: "2",
            title: "虔誠信徒",
            description: "連續打卡7天",
            icon: "calendar.badge.checkmark",
            unlocked: true,
            type: "打卡成就"
        ),
        Achievement(
            id: "3",
            title: "福報滿滿",
            description: "累積100點福報值",
            icon: "star.fill",
            unlocked: true,
            type: "福報成就"
        ),
        Achievement(
            id: "4",
            title: "探索者",
            description: "拜訪5間不同廟宇",
            icon: "building.2",
            unlocked: false,
            type: "探索成就"
        ),
        Achievement(
            id: "5",
            title: "收藏家",
            description: "收集10個不同平安符",
            icon: "scroll",
            unlocked: false,
            type: "收藏成就"
        ),
        Achievement(
            id: "6",
            title: "傳教士",
            description: "邀請3位好友加入",
            icon: "person.3",
            unlocked: false,
            type: "社交成就"
        )
    ]

    private var unlockedCount: Int {
        achievements.filter { $0.unlocked }.count
    }

    private var achievementTypes: Set<String> {
        Set(achievements.filter { $0.unlocked }.map { $0.type })
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                // 背景
                Color(hex: "E8F4F8")
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: AppTheme.Spacing.xxl) {
                        // 大型 NFT 卡片
                        if let selected = selectedAchievement ?? achievements.first(where: { $0.unlocked }) {
                            nftCard(achievement: selected)
                                .padding(.horizontal, AppTheme.Spacing.xl)
                                .padding(.top, AppTheme.Spacing.xxl)
                        }

                        // 統計資訊
                        statsView

                        // 成就網格
                        achievementGrid

                        Spacer(minLength: AppTheme.Spacing.xxxl)
                    }
                }
            }
            .navigationTitle("成就系統")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    // MARK: - Components

    private func nftCard(achievement: Achievement) -> some View {
        VStack(spacing: 0) {
            // NFT 圖片區域
            ZStack {
                // 背景漸層
                LinearGradient(
                    colors: achievement.unlocked ?
                        [AppTheme.gold, Color(hex: "D4B756")] :
                        [Color.gray.opacity(0.5), Color.gray.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                // 圖標
                Image(systemName: achievement.icon)
                    .font(.system(size: 100))
                    .foregroundColor(.white.opacity(achievement.unlocked ? 1.0 : 0.5))
                    .shadow(
                        color: .black.opacity(0.3),
                        radius: 10,
                        x: 0,
                        y: 5
                    )

                // 未解鎖鎖頭標記
                if !achievement.unlocked {
                    VStack {
                        Spacer()
                        HStack {
                            Spacer()
                            Image(systemName: "lock.fill")
                                .font(.system(size: 32))
                                .foregroundColor(.white.opacity(0.9))
                                .padding(AppTheme.Spacing.lg)
                        }
                    }
                }
            }
            .frame(height: 300)

            // 資訊區域
            VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                Text(achievement.title)
                    .font(.system(size: AppTheme.FontSize.title2, weight: .bold))
                    .foregroundColor(AppTheme.dark)

                Text(achievement.description)
                    .font(.system(size: AppTheme.FontSize.body))
                    .foregroundColor(AppTheme.dark.opacity(0.7))
                    .lineLimit(2)

                HStack {
                    Label(achievement.type, systemImage: "tag.fill")
                        .font(.system(size: AppTheme.FontSize.caption, weight: .medium))
                        .foregroundColor(AppTheme.gold)
                        .padding(.horizontal, AppTheme.Spacing.md)
                        .padding(.vertical, AppTheme.Spacing.xs)
                        .background(
                            Capsule()
                                .fill(AppTheme.gold.opacity(0.1))
                        )

                    Spacer()

                    if achievement.unlocked {
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 16))
                                .foregroundColor(.green)
                            Text("已解鎖")
                                .font(.system(size: AppTheme.FontSize.caption, weight: .semibold))
                                .foregroundColor(.green)
                        }
                    }
                }
            }
            .padding(AppTheme.Spacing.lg)
            .background(Color.white)
        }
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(
            color: Color.black.opacity(0.15),
            radius: 12,
            x: 0,
            y: 4
        )
    }

    private var statsView: some View {
        HStack(spacing: AppTheme.Spacing.lg) {
            // 解鎖數量
            StatCard(
                icon: "trophy.fill",
                value: "\(unlockedCount)",
                label: "已解鎖"
            )

            // 成就類型
            StatCard(
                icon: "star.fill",
                value: "\(achievementTypes.count)",
                label: "成就類型"
            )

            // 總數量
            StatCard(
                icon: "square.grid.3x3.fill",
                value: "\(achievements.count)",
                label: "總成就"
            )
        }
        .padding(.horizontal, AppTheme.Spacing.xl)
    }

    private var achievementGrid: some View {
        LazyVGrid(
            columns: [
                GridItem(.flexible(), spacing: AppTheme.Spacing.md),
                GridItem(.flexible(), spacing: AppTheme.Spacing.md),
                GridItem(.flexible(), spacing: AppTheme.Spacing.md)
            ],
            spacing: AppTheme.Spacing.md
        ) {
            ForEach(achievements) { achievement in
                AchievementGridItem(achievement: achievement)
                    .onTapGesture {
                        withAnimation(.spring(response: 0.3)) {
                            selectedAchievement = achievement
                        }
                    }
            }
        }
        .padding(.horizontal, AppTheme.Spacing.xl)
    }
}

// MARK: - Achievement Model

struct Achievement: Identifiable {
    let id: String
    let title: String
    let description: String
    let icon: String
    let unlocked: Bool
    let type: String
}

// MARK: - Stat Card Component

struct StatCard: View {
    let icon: String
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: AppTheme.Spacing.xs) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(AppTheme.gold)

            Text(value)
                .font(.system(size: AppTheme.FontSize.title3, weight: .bold))
                .foregroundColor(AppTheme.dark)

            Text(label)
                .font(.system(size: AppTheme.FontSize.caption2))
                .foregroundColor(AppTheme.dark.opacity(0.6))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppTheme.Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                .fill(Color.white)
                .shadow(
                    color: Color.black.opacity(0.1),
                    radius: 8,
                    x: 0,
                    y: 2
                )
        )
    }
}

// MARK: - Achievement Grid Item

struct AchievementGridItem: View {
    let achievement: Achievement

    var body: some View {
        VStack(spacing: AppTheme.Spacing.sm) {
            ZStack {
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                    .fill(
                        achievement.unlocked ?
                            AppTheme.goldGradient :
                            LinearGradient(
                                colors: [Color.gray.opacity(0.3), Color.gray.opacity(0.2)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                    )
                    .frame(height: 80)

                Image(systemName: achievement.icon)
                    .font(.system(size: 32))
                    .foregroundColor(.white.opacity(achievement.unlocked ? 1.0 : 0.5))

                if !achievement.unlocked {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 16))
                        .foregroundColor(.white.opacity(0.8))
                        .offset(x: 25, y: -25)
                }
            }

            Text(achievement.title)
                .font(.system(size: AppTheme.FontSize.caption, weight: .semibold))
                .foregroundColor(AppTheme.dark)
                .lineLimit(1)
        }
    }
}

// MARK: - Preview

#Preview {
    AchievementView()
}
