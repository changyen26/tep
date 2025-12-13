/**
 * 主題顏色設定
 * 富貴金 (Wealth Gold): #BDA138 - 象徵神聖、光明、富貴
 * 玄帝黑 (Xuandi Black): #242428 - 象徵北方、水、玄天上帝
 */

import SwiftUI

struct AppTheme {
    // MARK: - 主要顏色

    /// 富貴金 - 主要品牌色
    static let gold = Color(hex: "BDA138")

    /// 玄帝黑 - 主要深色背景
    static let dark = Color(hex: "242428")

    /// 淺色玄帝黑
    static let darkLight = Color(hex: "1A1A1D")

    /// 白色
    static let white = Color.white

    /// 半透明白色
    static let whiteAlpha06 = Color.white.opacity(0.6)
    static let whiteAlpha08 = Color.white.opacity(0.8)

    // MARK: - 漸層色

    /// 金色漸層
    static let goldGradient = LinearGradient(
        colors: [Color(hex: "BDA138"), Color(hex: "D4B756")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    /// 深色漸層
    static let darkGradient = LinearGradient(
        colors: [Color(hex: "242428"), Color(hex: "1A1A1D")],
        startPoint: .top,
        endPoint: .bottom
    )

    // MARK: - 字體大小

    struct FontSize {
        static let title1: CGFloat = 32
        static let title2: CGFloat = 28
        static let title3: CGFloat = 24
        static let headline: CGFloat = 20
        static let body: CGFloat = 16
        static let callout: CGFloat = 14
        static let caption: CGFloat = 12
        static let caption2: CGFloat = 11
    }

    // MARK: - 間距

    struct Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 24
        static let xxxl: CGFloat = 32
    }

    // MARK: - 圓角

    struct CornerRadius {
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 24
    }

    // MARK: - 陰影

    struct Shadow {
        static let small = (color: Color.black.opacity(0.1), radius: CGFloat(4), x: CGFloat(0), y: CGFloat(2))
        static let medium = (color: Color.black.opacity(0.15), radius: CGFloat(8), x: CGFloat(0), y: CGFloat(4))
        static let large = (color: Color.black.opacity(0.2), radius: CGFloat(12), x: CGFloat(0), y: CGFloat(6))
    }
}

// MARK: - Color Extension

extension Color {
    /// 從 HEX 字串建立顏色
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
