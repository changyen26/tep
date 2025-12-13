/**
 * 登入/註冊頁面
 * 參考：平安符打卡系統 PDF 第8頁第2張
 */

import SwiftUI

struct LoginView: View {
    // MARK: - Properties

    @Binding var isLoggedIn: Bool

    // MARK: - State

    @State private var isLoginMode = true
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var confirmPassword = ""
    @State private var showingAlert = false
    @State private var alertMessage = ""

    // MARK: - Body

    var body: some View {
        ZStack {
            // 背景漸層
            AppTheme.darkGradient
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: AppTheme.Spacing.xxl) {
                    // Logo 區域
                    VStack(spacing: AppTheme.Spacing.lg) {
                        Image(systemName: "scroll.fill")
                            .font(.system(size: 80))
                            .foregroundStyle(AppTheme.goldGradient)
                            .shadow(
                                color: AppTheme.gold.opacity(0.5),
                                radius: 20,
                                x: 0,
                                y: 10
                            )

                        Text("平安符打卡")
                            .font(.system(size: AppTheme.FontSize.title1, weight: .bold))
                            .foregroundColor(AppTheme.gold)
                            .tracking(4)

                        Text(isLoginMode ? "歡迎回來" : "加入我們")
                            .font(.system(size: AppTheme.FontSize.body))
                            .foregroundColor(AppTheme.whiteAlpha06)
                    }
                    .padding(.top, 60)

                    // 登入/註冊表單
                    VStack(spacing: AppTheme.Spacing.lg) {
                        // 註冊模式顯示姓名欄位
                        if !isLoginMode {
                            CustomTextField(
                                icon: "person.fill",
                                placeholder: "姓名",
                                text: $name
                            )
                        }

                        // Email 欄位
                        CustomTextField(
                            icon: "envelope.fill",
                            placeholder: "電子郵件",
                            text: $email,
                            keyboardType: .emailAddress
                        )

                        // 密碼欄位
                        CustomTextField(
                            icon: "lock.fill",
                            placeholder: "密碼",
                            text: $password,
                            isSecure: true
                        )

                        // 註冊模式顯示確認密碼
                        if !isLoginMode {
                            CustomTextField(
                                icon: "lock.fill",
                                placeholder: "確認密碼",
                                text: $confirmPassword,
                                isSecure: true
                            )
                        }

                        // 登入/註冊按鈕
                        Button(action: handleSubmit) {
                            Text(isLoginMode ? "登入" : "註冊")
                                .font(.system(size: AppTheme.FontSize.headline, weight: .semibold))
                                .foregroundColor(AppTheme.dark)
                                .frame(maxWidth: .infinity)
                                .frame(height: 56)
                                .background(AppTheme.goldGradient)
                                .cornerRadius(AppTheme.CornerRadius.md)
                                .shadow(
                                    color: AppTheme.gold.opacity(0.3),
                                    radius: 12,
                                    x: 0,
                                    y: 4
                                )
                        }
                        .padding(.top, AppTheme.Spacing.lg)

                        // 切換登入/註冊模式
                        Button(action: {
                            withAnimation(.spring(response: 0.3)) {
                                isLoginMode.toggle()
                            }
                        }) {
                            HStack(spacing: 4) {
                                Text(isLoginMode ? "還沒有帳號？" : "已有帳號？")
                                    .foregroundColor(AppTheme.whiteAlpha06)
                                Text(isLoginMode ? "立即註冊" : "立即登入")
                                    .foregroundColor(AppTheme.gold)
                                    .fontWeight(.semibold)
                            }
                            .font(.system(size: AppTheme.FontSize.callout))
                        }
                        .padding(.top, AppTheme.Spacing.sm)
                    }
                    .padding(.horizontal, AppTheme.Spacing.xxl)

                    Spacer()
                }
            }
        }
        .alert("提示", isPresented: $showingAlert) {
            Button("確定", role: .cancel) { }
        } message: {
            Text(alertMessage)
        }
    }

    // MARK: - Methods

    private func handleSubmit() {
        // 驗證輸入
        if email.isEmpty || password.isEmpty {
            alertMessage = "請填寫所有必填欄位"
            showingAlert = true
            return
        }

        if !isLoginMode {
            if name.isEmpty {
                alertMessage = "請輸入姓名"
                showingAlert = true
                return
            }
            if password != confirmPassword {
                alertMessage = "密碼與確認密碼不相符"
                showingAlert = true
                return
            }
        }

        // 模擬登入/註冊成功
        withAnimation(.spring(response: 0.4)) {
            isLoggedIn = true
        }
    }
}

// MARK: - Custom TextField Component

struct CustomTextField: View {
    let icon: String
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var keyboardType: UIKeyboardType = .default

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(AppTheme.gold)
                .frame(width: 24)

            if isSecure {
                SecureField(placeholder, text: $text)
                    .font(.system(size: AppTheme.FontSize.body))
                    .foregroundColor(AppTheme.white)
            } else {
                TextField(placeholder, text: $text)
                    .font(.system(size: AppTheme.FontSize.body))
                    .foregroundColor(AppTheme.white)
                    .keyboardType(keyboardType)
                    .autocapitalization(.none)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                .fill(Color.white.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                        .stroke(AppTheme.gold.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

// MARK: - Preview

#Preview {
    LoginView(isLoggedIn: .constant(false))
}
