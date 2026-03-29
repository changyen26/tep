/**
 * 活動一覽頁面
 */
import { useOutletContext } from 'react-router-dom';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import './EventsPage.css';

const EventsPage = () => {
  const { mockData } = useOutletContext();
  const { events } = mockData;

  const getStatusLabel = (status) => {
    switch (status) {
      case 'upcoming':
        return { label: '即將舉行', className: 'upcoming' };
      case 'ongoing':
        return { label: '進行中', className: 'ongoing' };
      case 'ended':
        return { label: '已結束', className: 'ended' };
      default:
        return { label: '即將舉行', className: 'upcoming' };
    }
  };

  return (
    <div className="temple-events-page">
      {/* 頁面標題區 */}
      <div className="temple-page-header">
        <h1>活動一覽</h1>
        <p>本宮年度祭典與法會活動</p>
      </div>

      {/* 內容區 */}
      <div className="events-page-content">
        <div className="events-container">
          <div className="events-grid">
            {events.map((event) => {
              const status = getStatusLabel(event.status);
              return (
                <div key={event.id} className="event-card">
                  <div className="event-card-image">
                    <img src={event.image} alt={event.title} />
                    <span className={`event-status ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="event-card-content">
                    <h3 className="event-title">{event.title}</h3>
                    <div className="event-meta">
                      <div className="event-meta-item">
                        <CalendarOutlined />
                        <span>{event.startDate} ~ {event.endDate}</span>
                      </div>
                      <div className="event-meta-item">
                        <EnvironmentOutlined />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <p className="event-description">{event.description}</p>
                    <button className="event-btn">
                      <ClockCircleOutlined />
                      加入行事曆
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 無活動提示 */}
          {events.length === 0 && (
            <div className="events-empty">
              <CalendarOutlined />
              <p>目前沒有活動資訊</p>
            </div>
          )}
        </div>
      </div>

      {/* 年度行事曆 */}
      <section className="annual-calendar-section">
        <div className="events-container">
          <h2 className="calendar-title">年度祭典行事曆</h2>
          <div className="calendar-list">
            <div className="calendar-item">
              <div className="calendar-date">正月初一 ~ 初五</div>
              <div className="calendar-event">新春團拜祈福法會</div>
            </div>
            <div className="calendar-item">
              <div className="calendar-date">正月十五</div>
              <div className="calendar-event">元宵節燈會</div>
            </div>
            <div className="calendar-item">
              <div className="calendar-date">三月初三</div>
              <div className="calendar-event">玄天上帝聖誕千秋</div>
            </div>
            <div className="calendar-item">
              <div className="calendar-date">七月十五</div>
              <div className="calendar-event">中元普渡法會</div>
            </div>
            <div className="calendar-item">
              <div className="calendar-date">九月初九</div>
              <div className="calendar-event">玄天上帝飛昇紀念日</div>
            </div>
            <div className="calendar-item">
              <div className="calendar-date">十二月</div>
              <div className="calendar-event">歲末謝平安法會</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
