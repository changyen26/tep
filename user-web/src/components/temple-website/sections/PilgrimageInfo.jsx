/**
 * 進香資訊區塊組件
 * 農曆日期、今日進香團
 */
import { TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import './PilgrimageInfo.css';

const PilgrimageInfo = ({ pilgrimage }) => {
  if (!pilgrimage) {
    return null;
  }

  const { lunarDate, solarDate, todayGroups, upcomingEvents } = pilgrimage;

  return (
    <section className="pilgrimage-section">
      <div className="pilgrimage-inner">
        {/* 區塊標題 */}
        <div className="pilgrimage-header">
          <h2>進香資訊</h2>
          <p>歡迎各地宮廟團體蒞臨進香</p>
        </div>

        {/* 內容區 */}
        <div className="pilgrimage-content">
          {/* 日期區塊 */}
          <div className="pilgrimage-date-card">
            <h3 className="pilgrimage-lunar-date">{lunarDate}</h3>
            <p className="pilgrimage-solar-date">{solarDate}</p>

            {upcomingEvents && upcomingEvents.length > 0 && (
              <>
                <h4 className="pilgrimage-upcoming-title">
                  <CalendarOutlined /> 近期活動
                </h4>
                <div className="pilgrimage-upcoming-list">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="pilgrimage-upcoming-item">
                      <span className="pilgrimage-upcoming-date">{event.date}</span>
                      <span className="pilgrimage-upcoming-event">{event.event}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 進香團列表 */}
          <div className="pilgrimage-groups-card">
            <h3 className="pilgrimage-groups-title">今日進香團</h3>

            {todayGroups && todayGroups.length > 0 ? (
              <div className="pilgrimage-groups-list">
                {todayGroups.map((group, index) => (
                  <div key={index} className="pilgrimage-group-item">
                    <div className="pilgrimage-group-time">
                      <span>{group.time}</span>
                    </div>
                    <div className="pilgrimage-group-info">
                      <h4 className="pilgrimage-group-name">{group.name}</h4>
                      <p className="pilgrimage-group-members">
                        <TeamOutlined />
                        {group.members} 人
                      </p>
                    </div>
                    <span className="pilgrimage-group-status">進香中</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pilgrimage-no-groups">
                <TeamOutlined />
                <p>今日暫無進香團登記</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PilgrimageInfo;
