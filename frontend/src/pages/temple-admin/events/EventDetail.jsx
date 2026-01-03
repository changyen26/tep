import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getEvent,
  publishEvent,
  closeEvent,
  cancelEvent,
} from '../../../services/templeEventsService';
import Modal from '../../../components/Modal';
import './Events.css';

const EventDetail = () => {
  const { templeId, eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 確認 Modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // 載入活動資料
  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getEvent(eventId);

      if (response.success) {
        setEvent(response.data);
      } else {
        setError(response.message || '載入活動失敗');
      }
    } catch (err) {
      console.error('載入活動失敗:', err);
      setError('載入活動失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  // 狀態 badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: '草稿', className: 'status-draft' },
      published: { label: '已發布', className: 'status-published' },
      closed: { label: '已截止', className: 'status-closed' },
      canceled: { label: '已取消', className: 'status-canceled' },
    };

    const config = statusConfig[status] || { label: status, className: '' };
    return (
      <span className={`status-badge ${config.className}`}>{config.label}</span>
    );
  };

  // 格式化日期時間
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 處理發布
  const handlePublish = async () => {
    setConfirmAction({
      title: '確認發布',
      message: '確定要發布此活動嗎？發布後使用者即可報名。',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const response = await publishEvent(eventId);
          if (response.success) {
            alert('活動已發布');
            fetchEvent(); // 重新載入
          } else {
            alert(response.message || '發布失敗');
          }
        } catch (error) {
          console.error('發布失敗:', error);
          alert('發布失敗');
        } finally {
          setActionLoading(false);
          setShowConfirm(false);
        }
      },
    });
    setShowConfirm(true);
  };

  // 處理提前截止
  const handleClose = async () => {
    setConfirmAction({
      title: '確認提前截止',
      message: '確定要提前截止報名嗎？截止後將無法報名。',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const response = await closeEvent(eventId);
          if (response.success) {
            alert('報名已截止');
            fetchEvent();
          } else {
            alert(response.message || '截止失敗');
          }
        } catch (error) {
          console.error('截止失敗:', error);
          alert('截止失敗');
        } finally {
          setActionLoading(false);
          setShowConfirm(false);
        }
      },
    });
    setShowConfirm(true);
  };

  // 處理取消活動
  const handleCancel = async () => {
    setConfirmAction({
      title: '確認取消活動',
      message: '確定要取消此活動嗎？此操作無法復原。',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const response = await cancelEvent(eventId);
          if (response.success) {
            alert('活動已取消');
            fetchEvent();
          } else {
            alert(response.message || '取消失敗');
          }
        } catch (error) {
          console.error('取消失敗:', error);
          alert('取消失敗');
        } finally {
          setActionLoading(false);
          setShowConfirm(false);
        }
      },
    });
    setShowConfirm(true);
  };

  // 導向編輯頁
  const handleEdit = () => {
    navigate(`/temple-admin/${templeId}/events/${eventId}/edit`);
  };

  // 導向報名名單頁
  const handleViewRegistrations = () => {
    navigate(`/temple-admin/${templeId}/events/${eventId}/registrations`);
  };

  // 返回列表
  const handleBack = () => {
    navigate(`/temple-admin/${templeId}/events`);
  };

  if (loading) {
    return <div className="loading-state">載入中...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  if (!event) {
    return <div className="empty-state">活動不存在</div>;
  }

  return (
    <div className="event-detail-container">
      {/* 頁面標題與操作 */}
      <div className="event-detail-header">
        <div className="event-detail-title">
          <h2>{event.title}</h2>
          <div className="event-detail-meta">
            {getStatusBadge(event.status)}
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              報名人數：{event.registeredCount || 0} / {event.capacity}
            </span>
          </div>
        </div>

        <div className="event-detail-actions">
          <button className="btn-secondary" onClick={handleBack}>
            返回列表
          </button>

          {/* 根據狀態顯示不同的按鈕 */}
          {event.status === 'draft' && (
            <>
              <button className="btn-primary" onClick={handleEdit}>
                編輯
              </button>
              <button
                className="btn-primary"
                onClick={handlePublish}
                disabled={actionLoading}
              >
                發布
              </button>
            </>
          )}

          {event.status === 'published' && (
            <>
              <button className="btn-primary" onClick={handleEdit}>
                編輯
              </button>
              <button
                className="btn-secondary"
                onClick={handleClose}
                disabled={actionLoading}
              >
                提前截止
              </button>
              <button
                className="btn-danger"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                取消活動
              </button>
              <button className="btn-primary" onClick={handleViewRegistrations}>
                查看報名名單
              </button>
            </>
          )}

          {event.status === 'closed' && (
            <>
              <button
                className="btn-danger"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                取消活動
              </button>
              <button className="btn-primary" onClick={handleViewRegistrations}>
                查看報名名單
              </button>
            </>
          )}
        </div>
      </div>

      {/* 活動內容 */}
      <div className="event-detail-content">
        {event.coverImageUrl && (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="event-cover-image"
          />
        )}

        <div className="event-detail-info">
          <div className="info-row">
            <div className="info-label">活動時間</div>
            <div className="info-value">
              {formatDateTime(event.startAt)} ~ {formatDateTime(event.endAt)}
            </div>
          </div>

          <div className="info-row">
            <div className="info-label">報名截止</div>
            <div className="info-value">{formatDateTime(event.signupEndAt)}</div>
          </div>

          <div className="info-row">
            <div className="info-label">地點</div>
            <div className="info-value">{event.location}</div>
          </div>

          <div className="info-row">
            <div className="info-label">名額</div>
            <div className="info-value">
              {event.registeredCount || 0} / {event.capacity}
            </div>
          </div>

          <div className="info-row">
            <div className="info-label">費用</div>
            <div className="info-value">
              {event.fee === 0 ? '免費' : `NT$ ${event.fee}`}
            </div>
          </div>

          <div className="info-row">
            <div className="info-label">活動說明</div>
            <div className="info-value description">{event.description}</div>
          </div>
        </div>
      </div>

      {/* 確認 Modal */}
      {showConfirm && confirmAction && (
        <Modal
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          title={confirmAction.title}
        >
          <div className="confirm-modal-content">
            <p>{confirmAction.message}</p>
          </div>
          <div className="confirm-modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowConfirm(false)}
              disabled={actionLoading}
            >
              取消
            </button>
            <button
              className="btn-danger"
              onClick={confirmAction.onConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? '處理中...' : '確認'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EventDetail;
