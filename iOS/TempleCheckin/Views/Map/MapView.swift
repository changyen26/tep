/**
 * 地圖搜尋頁面
 * 參考：平安符打卡系統 PDF 第8頁第3張
 */

import SwiftUI
import MapKit

struct MapView: View {
    // MARK: - State

    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 25.0330, longitude: 121.5654),
        span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
    )

    @State private var selectedTemple: Temple?
    @State private var searchText = ""

    // MARK: - Mock Data

    private let temples = [
        Temple(
            id: "1",
            name: "行天宮",
            description: "供奉關聖帝君的知名廟宇，香火鼎盛",
            coordinate: CLLocationCoordinate2D(latitude: 25.0632, longitude: 121.5333),
            distance: 3.2
        ),
        Temple(
            id: "2",
            name: "龍山寺",
            description: "台北最古老的寺廟之一，觀音菩薩道場",
            coordinate: CLLocationCoordinate2D(latitude: 25.0369, longitude: 121.5000),
            distance: 5.8
        ),
        Temple(
            id: "3",
            name: "玄天上帝廟",
            description: "供奉北極玄天上帝的廟宇",
            coordinate: CLLocationCoordinate2D(latitude: 25.0500, longitude: 121.5500),
            distance: 2.1
        )
    ]

    private let userLocation = CLLocationCoordinate2D(
        latitude: 25.0330,
        longitude: 121.5654
    )

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                // 地圖
                Map(coordinateRegion: $region, annotationItems: temples) { temple in
                    MapAnnotation(coordinate: temple.coordinate) {
                        TempleMapMarker(
                            isSelected: selectedTemple?.id == temple.id
                        )
                        .onTapGesture {
                            withAnimation(.spring(response: 0.3)) {
                                selectedTemple = temple
                            }
                        }
                    }
                }
                .ignoresSafeArea()

                // 搜尋欄
                VStack {
                    searchBar
                        .padding(.horizontal, AppTheme.Spacing.xl)
                        .padding(.top, AppTheme.Spacing.md)

                    Spacer()

                    // 廟宇資訊卡片
                    if let temple = selectedTemple {
                        templeCard(temple: temple)
                            .padding(.horizontal, AppTheme.Spacing.xl)
                            .padding(.bottom, 100)
                            .transition(.move(edge: .bottom).combined(with: .opacity))
                    }
                }
            }
        }
    }

    // MARK: - Components

    private var searchBar: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 18))
                .foregroundColor(AppTheme.gold)

            TextField("搜尋廟宇...", text: $searchText)
                .font(.system(size: AppTheme.FontSize.callout))
        }
        .padding(AppTheme.Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                .fill(Color.white)
                .shadow(
                    color: Color.black.opacity(0.15),
                    radius: 8,
                    x: 0,
                    y: 2
                )
        )
    }

    private func templeCard(temple: Temple) -> some View {
        VStack(spacing: 0) {
            // 廟宇圖片 (使用漸層模擬)
            ZStack(alignment: .bottomLeading) {
                LinearGradient(
                    colors: [AppTheme.gold, Color(hex: "D4B756")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .frame(height: 180)
                .overlay(
                    Image(systemName: "building.columns.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.white.opacity(0.3))
                )

                // 覆蓋層
                LinearGradient(
                    colors: [Color.clear, Color.black.opacity(0.7)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 180)

                // 廟宇名稱和距離
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                    Text(temple.name)
                        .font(.system(size: AppTheme.FontSize.title3, weight: .bold))
                        .foregroundColor(.white)

                    HStack(spacing: 4) {
                        Image(systemName: "location.fill")
                            .font(.system(size: 14))
                        Text(String(format: "%.1f km", temple.distance))
                            .font(.system(size: AppTheme.FontSize.callout, weight: .medium))
                    }
                    .foregroundColor(.white.opacity(0.9))
                }
                .padding(AppTheme.Spacing.lg)
            }

            // 廟宇資訊
            VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                Text(temple.description)
                    .font(.system(size: AppTheme.FontSize.callout))
                    .foregroundColor(AppTheme.dark.opacity(0.7))
                    .lineLimit(2)

                // 導航按鈕
                Button(action: {
                    openInMaps(temple: temple)
                }) {
                    HStack {
                        Image(systemName: "location.fill")
                            .font(.system(size: 18))
                        Text("前往此廟宇")
                            .font(.system(size: AppTheme.FontSize.body, weight: .semibold))
                    }
                    .foregroundColor(AppTheme.dark)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(
                        RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                            .fill(AppTheme.goldGradient)
                            .shadow(
                                color: AppTheme.gold.opacity(0.3),
                                radius: 8,
                                x: 0,
                                y: 2
                            )
                    )
                }
            }
            .padding(AppTheme.Spacing.lg)
        }
        .background(Color.white)
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(
            color: Color.black.opacity(0.2),
            radius: 12,
            x: 0,
            y: 4
        )
    }

    // MARK: - Methods

    private func openInMaps(temple: Temple) {
        let coordinate = temple.coordinate
        let mapItem = MKMapItem(
            placemark: MKPlacemark(
                coordinate: coordinate,
                addressDictionary: nil
            )
        )
        mapItem.name = temple.name
        mapItem.openInMaps(launchOptions: [
            MKLaunchOptionsDirectionsModeKey: MKLaunchOptionsDirectionsModeDriving
        ])
    }
}

// MARK: - Temple Model

struct Temple: Identifiable {
    let id: String
    let name: String
    let description: String
    let coordinate: CLLocationCoordinate2D
    let distance: Double
}

// MARK: - Temple Map Marker

struct TempleMapMarker: View {
    let isSelected: Bool

    var body: some View {
        ZStack {
            // 標記底座
            Circle()
                .fill(
                    isSelected ?
                        AppTheme.goldGradient :
                        LinearGradient(
                            colors: [Color.red, Color.red.opacity(0.8)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                )
                .frame(width: isSelected ? 48 : 40, height: isSelected ? 48 : 40)
                .shadow(
                    color: (isSelected ? AppTheme.gold : Color.red).opacity(0.5),
                    radius: isSelected ? 12 : 8,
                    x: 0,
                    y: 4
                )

            // 圖標
            Image(systemName: "building.columns.fill")
                .font(.system(size: isSelected ? 24 : 20))
                .foregroundColor(.white)
        }
        .animation(.spring(response: 0.3), value: isSelected)
    }
}

// MARK: - Preview

#Preview {
    MapView()
}
