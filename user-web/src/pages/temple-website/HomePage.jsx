/**
 * 廟宇網站首頁
 */
import { useOutletContext } from 'react-router-dom';
import HeroCarousel from '../../components/temple-website/sections/HeroCarousel';
import NewsSection from '../../components/temple-website/sections/NewsSection';
import ServiceGrid from '../../components/temple-website/sections/ServiceGrid';
import PilgrimageInfo from '../../components/temple-website/sections/PilgrimageInfo';

const HomePage = () => {
  const { basePath, mockData } = useOutletContext();
  const { carousel, news, services, pilgrimage } = mockData;

  return (
    <div className="temple-home-page">
      {/* 輪播圖 */}
      <HeroCarousel
        slides={carousel}
        basePath={basePath}
        autoPlayInterval={5000}
      />

      {/* 最新消息 */}
      <NewsSection
        news={news}
        basePath={basePath}
        showCount={3}
      />

      {/* 服務項目 */}
      <ServiceGrid
        services={services}
        basePath={basePath}
        showCount={8}
      />

      {/* 進香資訊 */}
      <PilgrimageInfo
        pilgrimage={pilgrimage}
      />
    </div>
  );
};

export default HomePage;
