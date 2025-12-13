/**
 * 地圖搜尋頁面
 * 參考：平安符打卡系統 PDF 第8頁第3張
 */
import { useState } from 'react';
import { EnvironmentOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './MapPage.css';

const MapPage = () => {
  // 模擬數據 - 附近廟宇列表
  const nearbyTemples = [
    {
      id: 1,
      name: '松柏嶺受天宮',
      distance: 35.5,
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
      description: '松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮松柏嶺受天宮',
      lat: 23.8,
      lng: 120.7,
    },
    {
      id: 2,
      name: '南投紫南宮',
      distance: 42.3,
      image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800',
      description: '求財靈驗的土地公廟，香火鼎盛',
      lat: 23.75,
      lng: 120.65,
    },
    {
      id: 3,
      name: '日月潭文武廟',
      distance: 58.7,
      image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800',
      description: '俯瞰日月潭美景的文武聖廟',
      lat: 23.87,
      lng: 120.92,
    },
  ];

  const [selectedTemple, setSelectedTemple] = useState(nearbyTemples[0]);

  return (
    <div className="map-page">
      {/* 地圖背景區域 */}
      <div className="map-container">
        {/* 簡化的地圖背景 */}
        <div className="map-background">
          <div className="map-grid"></div>

          {/* 地圖標記點 */}
          {nearbyTemples.map((temple, index) => (
            <div
              key={temple.id}
              className={`map-marker ${selectedTemple.id === temple.id ? 'active' : ''}`}
              style={{
                top: `${30 + index * 20}%`,
                left: `${40 + index * 10}%`,
              }}
              onClick={() => setSelectedTemple(temple)}
            >
              <div className="marker-pin">
                <EnvironmentOutlined />
              </div>
              {selectedTemple.id === temple.id && (
                <div className="marker-pulse"></div>
              )}
            </div>
          ))}

          {/* 用戶位置標記 */}
          <div className="user-location-marker">
            <div className="user-dot"></div>
            <div className="user-pulse"></div>
          </div>
        </div>

        {/* 廟宇資訊卡片 */}
        <div className="temple-card-container">
          <div className="temple-card">
            {/* 廟宇圖片 */}
            <div
              className="temple-card-image"
              style={{ backgroundImage: `url(${selectedTemple.image})` }}
            >
              <div className="temple-card-overlay">
                <div className="temple-name">{selectedTemple.name}</div>
                <div className="temple-distance">
                  <EnvironmentOutlined />
                  <span>距離 {selectedTemple.distance}km</span>
                </div>
              </div>
            </div>

            {/* 廟宇資訊 */}
            <div className="temple-card-content">
              <div className="temple-description">
                {selectedTemple.description}
              </div>

              {/* 前往按鈕 */}
              <div
                className="navigate-button"
                onClick={() => {
                  // TODO: 開啟導航
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedTemple.lat},${selectedTemple.lng}`,
                    '_blank'
                  );
                }}
              >
                <span>前往</span>
                <ArrowRightOutlined />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 搜尋欄（裝飾用） */}
      <div className="search-bar">
        <EnvironmentOutlined className="search-icon" />
        <input
          type="text"
          placeholder="搜尋附近廟宇..."
          className="search-input"
          readOnly
        />
      </div>
    </div>
  );
};

export default MapPage;
