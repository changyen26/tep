import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import templeAdminApi from '../../services/templeAdminApi';
import './DevoteeDetail.css';

const DevoteeDetail = () => {
  const { templeId, publicUserId } = useParams();
  const navigate = useNavigate();

  // 資料狀態
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 載入信眾詳情
  const fetchDevoteeDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await templeAdminApi.devotees.get(templeId, publicUserId);

      if (response.success || response.data) {
        const data = response.data || response;
        setProfile(data.profile || {});
        setSummary(data.summary || {});
        setTimeline(data.timeline || []);
      }
    } catch (err) {
      console.error('載入信眾詳情失敗:', err);
      setError('載入信眾資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (templeId && publicUserId) {
      fetchDevoteeDetail();
    }
  }, [templeId, publicUserId]);

  // 格式化日期時間
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 渲染時間線項目
  const renderTimelineItem = (item) => {
    const typeLabels = {
      checkin: '打卡',
      order: '訂單',
      event_registration: '活動報名',
      lamp_application: '點燈申請',
    };

    const typeColors = {
      checkin: '#4caf50',
      order: '#2196f3',
      event_registration: '#ff9800',
      lamp_application: '#9c27b0',
    };

    return (
      <div key={`${item.type}-${item.at}`} className="timeline-item">
        <div className="timeline-marker" style={{ background: typeColors[item.type] || '#666' }} />
        <div className="timeline-content">
          <div className="timeline-header">
            <span className="timeline-type">{typeLabels[item.type] || item.type}</span>
            <span className="timeline-time">{formatDateTime(item.at)}</span>
          </div>
          <div className="timeline-meta">
            {item.type === 'checkin' && (
              <span>獲得福報：{item.meta?.merit_points || 0} 點</span>
            )}
            {item.type === 'order' && (
              <>
                <span>訂單 #{item.meta?.order_id}</span>
                {item.meta?.product_name && <span>商品：{item.meta.product_name}</span>}
                <span>金額：{item.meta?.amount || 0} 點</span>
                <span>狀態：{item.meta?.status || '-'}</span>
              </>
            )}
            {item.type === 'event_registration' && (
              <>
                <span>活動 ID：{item.meta?.event_id}</span>
                {item.meta?.event_name && <span>{item.meta.event_name}</span>}
              </>
            )}
            {item.type === 'lamp_application' && (
              <>
                <span>燈種 ID：{item.meta?.lamp_type_id}</span>
                <span>狀態：{item.meta?.status || '-'}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 返回列表
  const handleBack = () => {
    navigate(`/temple-admin/${templeId}/devotees`);
  };

  if (loading) {
    return (
      <div className="devotee-detail">
        <p className="loading-message">載入中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="devotee-detail">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button type="button" className="btn-primary" onClick={handleBack}>
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="devotee-detail">
      <div className="page-header">
        <h1 className="page-title">信眾詳情</h1>
        <button type="button" className="btn-ghost" onClick={handleBack}>
          返回列表
        </button>
      </div>

      {/* Profile 卡片 */}
      {profile && (
        <div className="profile-card">
          <h2 className="section-title">基本資料</h2>
          <div className="profile-grid">
            <div className="profile-item">
              <label>姓名</label>
              <span>{profile.name || '-'}</span>
            </div>
            <div className="profile-item">
              <label>Email</label>
              <span>{profile.email || '-'}</span>
            </div>
            <div className="profile-item">
              <label>註冊時間</label>
              <span>{formatDateTime(profile.created_at)}</span>
            </div>
            <div className="profile-item">
              <label>最後登入</label>
              <span>{formatDateTime(profile.last_login_at)}</span>
            </div>
            <div className="profile-item">
              <label>最後互動</label>
              <span>{formatDateTime(profile.last_seen_at)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary 卡片 */}
      {summary && (
        <div className="summary-card">
          <h2 className="section-title">互動統計</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-value">{summary.checkins_count || 0}</div>
              <div className="summary-label">打卡次數</div>
            </div>
            <div className="summary-item">
              <div className="summary-value">{summary.events_count || 0}</div>
              <div className="summary-label">活動報名</div>
            </div>
            <div className="summary-item">
              <div className="summary-value">{summary.lamps_count || 0}</div>
              <div className="summary-label">點燈申請</div>
            </div>
            <div className="summary-item">
              <div className="summary-value">{summary.orders_count || 0}</div>
              <div className="summary-label">訂單數量</div>
            </div>
            <div className="summary-item primary">
              <div className="summary-value">{summary.spend_total || 0}</div>
              <div className="summary-label">總消費（功德點）</div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="timeline-card">
        <h2 className="section-title">互動時間線</h2>
        {timeline.length === 0 ? (
          <p className="empty-message">暫無互動紀錄</p>
        ) : (
          <div className="timeline-container">
            {timeline.map((item) => renderTimelineItem(item))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevoteeDetail;
