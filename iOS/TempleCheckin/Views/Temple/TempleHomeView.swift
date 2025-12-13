/**
 * 廟宇首頁
 * 參考：平安符打卡系統 PDF 第7頁
 */

import SwiftUI

struct TempleHomeView: View {
    // MARK: - State

    @State private var navigateToPrayer = false
    @State private var navigateToProfile = false

    // MARK: - Mock Data

    private let templeData = (
        name: "玄天上帝廟",
        location: "台北市中山區",
        image: "temple-bg"
    )

    private let airQuality = (
        aqi: 45,
        level: "良好",
        color: Color.green
    )

    private let lunarDate = (
        year: "甲辰年",
        month: "十一月",
        day: "初五"
    )

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                // 背景
                Color(hex: "E8F4F8")
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 0) {
                        // 廟宇頭部區域
                        templeHeader

                        // 內容區域
                        VStack(spacing: AppTheme.Spacing.lg) {
                            // 空氣品質和農曆日期卡片
                            HStack(spacing: AppTheme.Spacing.md) {
                                airQualityCard
                                lunarDateCard
                            }
                            .padding(.horizontal, AppTheme.Spacing.xl)

                            // 祈福按鈕
                            prayButton
                                .padding(.horizontal, AppTheme.Spacing.xl)
                                .padding(.top, AppTheme.Spacing.lg)
                        }
                        .padding(.top, AppTheme.Spacing.xxl)
                        .padding(.bottom, AppTheme.Spacing.xxxl)
                    }
                }
                .ignoresSafeArea(edges: .top)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { navigateToProfile = true }) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(AppTheme.gold)
                    }
                }
            }
            .navigationDestination(isPresented: $navigateToPrayer) {
                PrayerInstructionView()
            }
            .navigationDestination(isPresented: $navigateToProfile) {
                ProfileView()
            }
        }
    }

    // MARK: - Components

    private var templeHeader: some View {
        ZStack(alignment: .bottom) {
            // 背景圖片 (使用漸層模擬)
            LinearGradient(
                colors: [Color(hex: "BDA138"), Color(hex: "D4B756")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 300)
            .overlay(
                Image(systemName: "building.columns.fill")
                    .font(.system(size: 100))
                    .foregroundColor(.white.opacity(0.3))
            )

            // 覆蓋層
            LinearGradient(
                colors: [Color.clear, Color.black.opacity(0.7)],
                startPoint: .top,
                endPoint: .bottom
            )
            .frame(height: 300)

            // 廟宇資訊
            VStack(spacing: AppTheme.Spacing.sm) {
                Text(templeData.name)
                    .font(.system(size: AppTheme.FontSize.title1, weight: .bold))
                    .foregroundColor(.white)

                HStack(spacing: 4) {
                    Image(systemName: "location.fill")
                        .font(.system(size: 14))
                    Text(templeData.location)
                        .font(.system(size: AppTheme.FontSize.callout))
                }
                .foregroundColor(.white.opacity(0.9))
            }
            .padding(.bottom, AppTheme.Spacing.xxl)
        }
    }

    private var airQualityCard: some View {
        VStack(spacing: AppTheme.Spacing.md) {
            HStack {
                Image(systemName: "aqi.medium")
                    .font(.system(size: 20))
                    .foregroundColor(airQuality.color)

                Spacer()

                Text("\(airQuality.aqi)")
                    .font(.system(size: AppTheme.FontSize.title2, weight: .bold))
                    .foregroundColor(airQuality.color)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("空氣品質")
                    .font(.system(size: AppTheme.FontSize.caption, weight: .medium))
                    .foregroundColor(.black.opacity(0.6))

                Text(airQuality.level)
                    .font(.system(size: AppTheme.FontSize.body, weight: .semibold))
                    .foregroundColor(.black.opacity(0.8))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(AppTheme.Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                .fill(Color.white)
                .shadow(
                    color: Color.black.opacity(0.1),
                    radius: 8,
                    x: 0,
                    y: 2
                )
        )
    }

    private var lunarDateCard: some View {
        VStack(spacing: AppTheme.Spacing.md) {
            HStack {
                Image(systemName: "calendar")
                    .font(.system(size: 20))
                    .foregroundColor(AppTheme.gold)

                Spacer()

                Text(lunarDate.day)
                    .font(.system(size: AppTheme.FontSize.title2, weight: .bold))
                    .foregroundColor(AppTheme.gold)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("農曆日期")
                    .font(.system(size: AppTheme.FontSize.caption, weight: .medium))
                    .foregroundColor(.black.opacity(0.6))

                Text("\(lunarDate.year) \(lunarDate.month)")
                    .font(.system(size: AppTheme.FontSize.callout, weight: .semibold))
                    .foregroundColor(.black.opacity(0.8))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(AppTheme.Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                .fill(Color.white)
                .shadow(
                    color: Color.black.opacity(0.1),
                    radius: 8,
                    x: 0,
                    y: 2
                )
        )
    }

    private var prayButton: some View {
        Button(action: { navigateToPrayer = true }) {
            VStack(spacing: AppTheme.Spacing.md) {
                // 香爐圖標
                Image(systemName: "flame.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Color(hex: "FF6B6B"), Color(hex: "FFD93D")],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .shadow(
                        color: Color.orange.opacity(0.5),
                        radius: 15,
                        x: 0,
                        y: 5
                    )

                Text("開始祈福")
                    .font(.system(size: AppTheme.FontSize.title3, weight: .bold))
                    .foregroundColor(AppTheme.dark)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppTheme.Spacing.xxxl)
            .background(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.xl)
                    .fill(AppTheme.goldGradient)
                    .shadow(
                        color: AppTheme.gold.opacity(0.3),
                        radius: 12,
                        x: 0,
                        y: 4
                    )
            )
        }
    }
}

// MARK: - Preview

#Preview {
    TempleHomeView()
}
