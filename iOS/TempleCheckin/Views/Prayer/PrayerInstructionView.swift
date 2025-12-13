/**
 * 祈福說明頁面
 * 參考：平安符打卡系統 PDF 第7頁第2張
 */

import SwiftUI

struct PrayerInstructionView: View {
    // MARK: - State

    @State private var navigateToProcess = false
    @Environment(\.dismiss) private var dismiss

    // MARK: - Mock Data

    private let instructions = [
        (number: "1", title: "淨手淨心", description: "先淨手，保持心誠則靈"),
        (number: "2", title: "點香", description: "取三柱清香，點燃香火"),
        (number: "3", title: "參拜", description: "向神明行禮，心中默念祈願"),
        (number: "4", title: "稟告", description: "報上姓名、住址、生辰"),
        (number: "5", title: "祈願", description: "虔誠祈求心中所願"),
        (number: "6", title: "插香", description: "將香插入香爐，完成祈福")
    ]

    // MARK: - Body

    var body: some View {
        ZStack {
            // 背景漸層
            AppTheme.goldGradient
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: AppTheme.Spacing.xxxl) {
                    // 頭部標題
                    VStack(spacing: AppTheme.Spacing.md) {
                        Text("祈福說明")
                            .font(.system(size: AppTheme.FontSize.title1, weight: .bold))
                            .foregroundColor(AppTheme.dark)
                            .tracking(4)

                        Text("請依照以下步驟進行祈福")
                            .font(.system(size: AppTheme.FontSize.body))
                            .foregroundColor(AppTheme.dark.opacity(0.7))
                    }
                    .padding(.top, AppTheme.Spacing.xxxl)

                    // 說明步驟列表
                    VStack(spacing: AppTheme.Spacing.lg) {
                        ForEach(Array(instructions.enumerated()), id: \.offset) { index, instruction in
                            InstructionCard(
                                number: instruction.number,
                                title: instruction.title,
                                description: instruction.description
                            )
                            .transition(.asymmetric(
                                insertion: .move(edge: .trailing).combined(with: .opacity),
                                removal: .opacity
                            ))
                        }
                    }
                    .padding(.horizontal, AppTheme.Spacing.xl)

                    // 香爐圖案
                    Image(systemName: "flame.fill")
                        .font(.system(size: 80))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Color(hex: "FF6B6B"), Color(hex: "FFD93D")],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .shadow(
                            color: Color.orange.opacity(0.5),
                            radius: 20,
                            x: 0,
                            y: 10
                        )
                        .padding(.vertical, AppTheme.Spacing.lg)

                    // 開始按鈕
                    Button(action: { navigateToProcess = true }) {
                        Text("開始祈福")
                            .font(.system(size: AppTheme.FontSize.headline, weight: .bold))
                            .foregroundColor(AppTheme.gold)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(
                                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                                    .fill(AppTheme.dark)
                                    .shadow(
                                        color: AppTheme.dark.opacity(0.3),
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
        .navigationDestination(isPresented: $navigateToProcess) {
            PrayerProcessView()
        }
        .navigationBarBackButtonHidden(false)
    }
}

// MARK: - Instruction Card Component

struct InstructionCard: View {
    let number: String
    let title: String
    let description: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.lg) {
            // 步驟編號
            ZStack {
                Circle()
                    .fill(AppTheme.dark)
                    .frame(width: 56, height: 56)
                    .shadow(
                        color: AppTheme.dark.opacity(0.3),
                        radius: 8,
                        x: 0,
                        y: 2
                    )

                Text(number)
                    .font(.system(size: AppTheme.FontSize.title3, weight: .bold))
                    .foregroundColor(AppTheme.gold)
            }

            // 步驟內容
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text(title)
                    .font(.system(size: AppTheme.FontSize.headline, weight: .bold))
                    .foregroundColor(AppTheme.dark)

                Text(description)
                    .font(.system(size: AppTheme.FontSize.callout))
                    .foregroundColor(AppTheme.dark.opacity(0.7))
                    .lineLimit(2)
            }

            Spacer()
        }
        .padding(AppTheme.Spacing.lg)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                .fill(Color.white.opacity(0.9))
                .shadow(
                    color: Color.black.opacity(0.1),
                    radius: 8,
                    x: 0,
                    y: 2
                )
        )
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        PrayerInstructionView()
    }
}
