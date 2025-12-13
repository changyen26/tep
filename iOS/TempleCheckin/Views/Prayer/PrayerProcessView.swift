/**
 * 祈福進度頁面
 * 參考：平安符打卡系統 PDF 第7頁第3張
 */

import SwiftUI

struct PrayerProcessView: View {
    // MARK: - State

    @State private var progress: Double = 0
    @State private var navigateToAmulet = false
    @State private var timer: Timer?
    @Environment(\.dismiss) private var dismiss

    // MARK: - Body

    var body: some View {
        ZStack {
            // 背景漸層
            AppTheme.darkGradient
                .ignoresSafeArea()

            VStack(spacing: AppTheme.Spacing.xxxl) {
                Spacer()

                // 標題
                Text("祈福加持中...")
                    .font(.system(size: AppTheme.FontSize.title2, weight: .bold))
                    .foregroundColor(AppTheme.gold)
                    .tracking(2)

                // 彩虹圓環進度條
                ZStack {
                    // 背景圓環
                    Circle()
                        .stroke(
                            Color.white.opacity(0.1),
                            lineWidth: 12
                        )
                        .frame(width: 280, height: 280)

                    // 進度圓環 - 彩虹漸層
                    Circle()
                        .trim(from: 0, to: progress / 100)
                        .stroke(
                            AngularGradient(
                                gradient: Gradient(colors: [
                                    Color(hex: "FF6B6B"),
                                    Color(hex: "FFD93D"),
                                    Color(hex: "6BCF7F"),
                                    Color(hex: "4D96FF"),
                                    Color(hex: "A084DC"),
                                    Color(hex: "FF6B6B")
                                ]),
                                center: .center,
                                startAngle: .degrees(0),
                                endAngle: .degrees(360)
                            ),
                            style: StrokeStyle(
                                lineWidth: 12,
                                lineCap: .round
                            )
                        )
                        .frame(width: 280, height: 280)
                        .rotationEffect(.degrees(-90))
                        .animation(.linear(duration: 0.1), value: progress)

                    // 中心香爐圖案
                    VStack(spacing: AppTheme.Spacing.md) {
                        // 香爐圖標
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
                                color: Color.orange.opacity(0.6),
                                radius: 20,
                                x: 0,
                                y: 10
                            )
                            .scaleEffect(1.0 + sin(progress * 0.1) * 0.05)
                            .animation(.easeInOut(duration: 1).repeatForever(autoreverses: true), value: progress)

                        // 百分比
                        Text("\(Int(progress))%")
                            .font(.system(size: AppTheme.FontSize.title1, weight: .bold))
                            .foregroundColor(AppTheme.gold)
                    }
                }

                // 提示文字
                Text("請保持虔誠的心")
                    .font(.system(size: AppTheme.FontSize.body))
                    .foregroundColor(AppTheme.whiteAlpha06)

                Spacer()
            }
        }
        .navigationBarBackButtonHidden(true)
        .onAppear {
            startProgress()
        }
        .onDisappear {
            timer?.invalidate()
        }
        .navigationDestination(isPresented: $navigateToAmulet) {
            AmuletInfoView()
        }
    }

    // MARK: - Methods

    private func startProgress() {
        timer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { _ in
            if progress < 100 {
                progress += 1
            } else {
                timer?.invalidate()
                // 完成後導航到平安符頁面
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    navigateToAmulet = true
                }
            }
        }
    }
}

// MARK: - Preview

#Preview {
    NavigationStack {
        PrayerProcessView()
    }
}
