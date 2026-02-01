import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockPilgrimageVisits } from '../../mocks/templeAdminMockData';
import './PilgrimageVisitDetail.css';

const USE_MOCK = true; // 設為 false 使用真實 API

// 本地 mock 資料（可修改）
let mockVisitsData = [...mockPilgrimageVisits];

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

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));

        // 從 mock 資料中找到對應的登記
        const mockVisit = mockVisitsData.find(v => v.id === parseInt(visitId));

        if (mockVisit) {
          // 轉換欄位名稱以匹配頁面期望的格式
          const formattedVisit = {
            id: mockVisit.id,
            contactName: mockVisit.contact_name,
            contactPhone: mockVisit.contact_phone,
            contactEmail: mockVisit.contact_email,
            groupName: mockVisit.organization_name,
            peopleCount: mockVisit.estimated_people,
            visitStartAt: `${mockVisit.expected_date}T${mockVisit.expected_time}`,
            purpose: mockVisit.purpose || '進香祈福',
            needs: mockVisit.notes || '',
            status: mockVisit.status,
            createdAt: mockVisit.created_at,
            updatedAt: mockVisit.updated_at,
            assignedStaff: mockVisit.assigned_staff || '',
            adminNote: mockVisit.admin_note || '',
            replyMessage: mockVisit.reply_message || '',
            transportation: mockVisit.transportation,
            busCount: mockVisit.bus_count,
          };

          setVisit(formattedVisit);
          setEditData({
            status: formattedVisit.status || 'pending',
            assignedStaff: formattedVisit.assignedStaff || '',
            adminNote: formattedVisit.adminNote || '',
            replyMessage: formattedVisit.replyMessage || '',
          });
        } else {
          setError('找不到此進香登記');
        }
      } else {
        const templeAdminApi = await import('../../services/templeAdminApi').then(m => m.default);
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

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));

        // 更新 mock 資料
        const index = mockVisitsData.findIndex(v => v.id === parseInt(visitId));
        if (index !== -1) {
          mockVisitsData[index] = {
            ...mockVisitsData[index],
            status: editData.status,
            assigned_staff: editData.assignedStaff,
            admin_note: editData.adminNote,
            reply_message: editData.replyMessage,
            updated_at: new Date().toISOString(),
          };
        }

        setIsEditing(false);
        await fetchVisitDetail();
      } else {
        const templeAdminApi = await import('../../services/templeAdminApi').then(m => m.default);
        await templeAdminApi.pilgrimageVisits.update(templeId, visitId, editData);
        setIsEditing(false);
        await fetchVisitDetail();
      }
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

        {visit.transportation && (
          <div className="info-item full-width">
            <label>交通方式</label>
            <span>
              {visit.transportation === 'bus' ? '遊覽車' : visit.transportation}
              {visit.busCount ? ` (${visit.busCount} 台)` : ''}
            </span>
          </div>
        )}

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
