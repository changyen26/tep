import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import templeAdminApi from '../../services/templeAdminApi';
import './PilgrimageVisitDetail.css';

const PilgrimageVisitDetail = () => {
  const { templeId, visitId } = useParams();
  const navigate = useNavigate();

  // 資料狀態
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 編輯模式
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    assignedStaff: '',
    adminNote: '',
    replyMessage: '',
  });

  // 載入進香登記詳情
  const fetchVisitDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await templeAdminApi.pilgrimageVisits.get(templeId, visitId);

      if (response.success || response.data) {
        const data = response.data || response;
        setVisit(data);
        setEditData({
          status: data.status || 'pending',
          assignedStaff: data.assignedStaff || '',
          adminNote: data.adminNote || '',
          replyMessage: data.replyMessage || '',
        });
      }
    } catch (err) {
      console.error('載入進香登記詳情失敗:', err);
      setError(err.message || '載入資料失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (templeId && visitId) {
      fetchVisitDetail();
    }
  }, [templeId, visitId]);

  // 處理更新
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await templeAdminApi.pilgrimageVisits.update(templeId, visitId, editData);
      setIsEditing(false);
      await fetchVisitDetail();
    } catch (err) {
      console.error('更新進香登記失敗:', err);
      alert(err.message || '更新失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

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

  // 狀態標籤
  const statusLabels = {
    pending: '待處理',
    confirmed: '已確認',
    rejected: '已拒絕',
    completed: '已完成',
    canceled: '已取消',
  };

  const statusColors = {
    pending: '#ff9800',
    confirmed: '#4caf50',
    rejected: '#f44336',
    completed: '#9e9e9e',
    canceled: '#607d8b',
  };

  if (loading && !visit) {
    return (
      <div className="pilgrimage-visit-detail">
        <div className="loading-message">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pilgrimage-visit-detail">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <div className="error-actions">
            <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
              返回列表
            </button>
            <button type="button" className="btn-primary" onClick={fetchVisitDetail}>
              重試
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="pilgrimage-visit-detail">
        <div className="empty-message">找不到此進香登記</div>
      </div>
    );
  }

  return (
    <div className="pilgrimage-visit-detail">
      <div className="page-header">
        <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
          ← 返回列表
        </button>
        <h1 className="page-title">進香登記詳情</h1>
        {!isEditing && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsEditing(true)}
          >
            編輯
          </button>
        )}
      </div>

      {/* 基本資訊 */}
      <div className="info-card">
        <div className="section-title">基本資訊</div>
        <div className="info-grid">
          <div className="info-item">
            <label>聯絡人</label>
            <span>{visit.contactName}</span>
          </div>
          <div className="info-item">
            <label>聯絡電話</label>
            <span>{visit.contactPhone}</span>
          </div>
          <div className="info-item">
            <label>團體名稱</label>
            <span>{visit.groupName || '-'}</span>
          </div>
          <div className="info-item">
            <label>預計人數</label>
            <span>{visit.peopleCount} 人</span>
          </div>
          <div className="info-item">
            <label>來訪時間</label>
            <span>{formatDateTime(visit.visitStartAt)}</span>
          </div>
          <div className="info-item">
            <label>目前狀態</label>
            <span
              className="status-badge"
              style={{ backgroundColor: statusColors[visit.status] }}
            >
              {statusLabels[visit.status] || visit.status}
            </span>
          </div>
        </div>

        {visit.purpose && (
          <div className="info-item full-width">
            <label>來訪目的</label>
            <span>{visit.purpose}</span>
          </div>
        )}

        {visit.needs && (
          <div className="info-item full-width">
            <label>特殊需求</label>
            <span className="multiline">{visit.needs}</span>
          </div>
        )}

        <div className="info-meta">
          <span>登記時間：{formatDateTime(visit.createdAt)}</span>
          {visit.updatedAt && visit.updatedAt !== visit.createdAt && (
            <span>最後更新：{formatDateTime(visit.updatedAt)}</span>
          )}
        </div>
      </div>

      {/* 管理資訊（編輯表單） */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="manage-card">
          <div className="section-title">管理資訊</div>

          <div className="form-group">
            <label htmlFor="status">
              狀態 <span className="required">*</span>
            </label>
            <select
              id="status"
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              required
            >
              <option value="pending">待處理</option>
              <option value="confirmed">已確認</option>
              <option value="rejected">已拒絕</option>
              <option value="completed">已完成</option>
              <option value="canceled">已取消</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assignedStaff">指派負責人員</label>
            <input
              type="text"
              id="assignedStaff"
              value={editData.assignedStaff}
              onChange={(e) =>
                setEditData({ ...editData, assignedStaff: e.target.value })
              }
              placeholder="例如：王師兄、李師姐"
            />
          </div>

          <div className="form-group">
            <label htmlFor="replyMessage">回覆訊息（給信眾）</label>
            <textarea
              id="replyMessage"
              rows="4"
              value={editData.replyMessage}
              onChange={(e) =>
                setEditData({ ...editData, replyMessage: e.target.value })
              }
              placeholder="此訊息將回覆給信眾"
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminNote">內部備註（僅廟方可見）</label>
            <textarea
              id="adminNote"
              rows="4"
              value={editData.adminNote}
              onChange={(e) => setEditData({ ...editData, adminNote: e.target.value })}
              placeholder="內部備註，信眾無法看到"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setIsEditing(false);
                setEditData({
                  status: visit.status || 'pending',
                  assignedStaff: visit.assignedStaff || '',
                  adminNote: visit.adminNote || '',
                  replyMessage: visit.replyMessage || '',
                });
              }}
            >
              取消
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        </form>
      ) : (
        <div className="manage-card">
          <div className="section-title">管理資訊</div>
          <div className="info-grid">
            <div className="info-item">
              <label>指派負責人員</label>
              <span>{visit.assignedStaff || '-'}</span>
            </div>
          </div>

          {visit.replyMessage && (
            <div className="info-item full-width">
              <label>回覆訊息</label>
              <span className="multiline">{visit.replyMessage}</span>
            </div>
          )}

          {visit.adminNote && (
            <div className="info-item full-width">
              <label>內部備註</label>
              <span className="multiline">{visit.adminNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PilgrimageVisitDetail;
