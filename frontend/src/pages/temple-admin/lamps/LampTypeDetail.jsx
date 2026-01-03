import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLampType, toggleLampTypeActive } from '../../../services/templeLampsService';
import './Lamps.css';

const LampTypeDetail = () => {
  const { templeId, lampTypeId } = useParams();
  const navigate = useNavigate();

  // 狀態
  const [lampType, setLampType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [toggleAction, setToggleAction] = useState(null); // 'open' or 'close'

  // 載入燈種資料
  const fetchLampType = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getLampType(templeId, lampTypeId);

      if (response.success) {
        setLampType(response.data);
      } else {
        setError(response.message || '載入燈種資料失敗');
      }
    } catch (err) {
      console.error('載入燈種資料失敗:', err);
      setError('載入燈種資料失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLampType();
  }, [templeId, lampTypeId]);

  // 處理編輯按鈕
  const handleEdit = () => {
    navigate(`/temple-admin/${templeId}/lamps/${lampTypeId}/edit`);
  };

  // 處理查看申請名冊
  const handleViewApplications = () => {
    navigate(`/temple-admin/${templeId}/lamps/${lampTypeId}/applications`);
  };

  // 處理返回列表
  const handleBack = () => {
    navigate(`/temple-admin/${templeId}/lamps`);
  };

  // 顯示切換狀態確認對話框
  const handleShowToggleModal = (action) => {
    setToggleAction(action);
    setShowToggleModal(true);
  };

  // 確認切換狀態
  const handleConfirmToggle = async () => {
    try {
      const newStatus = toggleAction === 'open';

      const response = await toggleLampTypeActive(templeId, lampTypeId, newStatus);

      if (response.success) {
        alert(response.message || `燈種已${newStatus ? '開放' : '關閉'}`);
        setShowToggleModal(false);
        fetchLampType(); // 重新載入資料
      } else {
        alert(response.message || '操作失敗');
      }
    } catch (err) {
      console.error('切換狀態失敗:', err);
      alert('操作失敗');
    }
  };

  // 取消切換狀態
  const handleCancelToggle = () => {
    setShowToggleModal(false);
    setToggleAction(null);
  };

  if (loading) {
    return (
      <div className="lamps-container">
        <div className="loading-state">載入中...</div>
      </div>
    );
  }

  if (error || !lampType) {
    return (
      <div className="lamps-container">
        <div className="error-state">{error || '燈種不存在'}</div>
        <button className="btn-secondary" onClick={handleBack}>
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="lamps-container">
      {/* 頁面標題與操作 */}
      <div className="lamps-header">
        <h2>燈種詳情</h2>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleBack}>
            返回列表
          </button>
          <button className="btn-info" onClick={handleEdit}>
            編輯
          </button>
          <button className="btn-primary" onClick={handleViewApplications}>
            查看申請名冊
          </button>
        </div>
      </div>

      {/* 燈種詳細資訊 */}
      <div className="lamps-detail-wrapper">
        <div className="detail-section">
          <h3>基本資訊</h3>

          <div className="detail-row">
            <span className="detail-label">燈種名稱：</span>
            <span className="detail-value">{lampType.name}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">年度：</span>
            <span className="detail-value">{lampType.year}年</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">開放狀態：</span>
            <span className="detail-value">
              <span
                className={`status-badge ${
                  lampType.isActive ? 'status-published' : 'status-closed'
                }`}
              >
                {lampType.isActive ? '開放中' : '已關閉'}
              </span>
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">燈種說明：</span>
            <span className="detail-value">{lampType.description}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">價格：</span>
            <span className="detail-value">${lampType.price}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">名額限制：</span>
            <span className="detail-value">{lampType.capacity || '不限'}</span>
          </div>

          {lampType.imageUrl && (
            <div className="detail-row">
              <span className="detail-label">圖片：</span>
              <span className="detail-value">
                <img
                  src={lampType.imageUrl}
                  alt={lampType.name}
                  className="lamp-image"
                  style={{ maxWidth: '400px', marginTop: '10px' }}
                />
              </span>
            </div>
          )}
        </div>

        {/* 統計資訊 */}
        {lampType.stats && (
          <div className="detail-section">
            <h3>申請統計</h3>

            <div className="detail-row">
              <span className="detail-label">總申請數：</span>
              <span className="detail-value">{lampType.stats.totalApplications}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">待處理：</span>
              <span className="detail-value">
                {lampType.stats.totalApplications -
                  lampType.stats.paidCount -
                  lampType.stats.completedCount -
                  lampType.stats.canceledCount}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">已付款：</span>
              <span className="detail-value">{lampType.stats.paidCount}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">已完成：</span>
              <span className="detail-value">{lampType.stats.completedCount}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">已取消：</span>
              <span className="detail-value">{lampType.stats.canceledCount}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">剩餘名額：</span>
              <span className="detail-value">
                {lampType.stats.remaining !== null ? lampType.stats.remaining : '不限'}
              </span>
            </div>
          </div>
        )}

        {/* 狀態操作區 */}
        <div className="detail-section">
          <h3>狀態管理</h3>
          <div className="status-actions">
            {lampType.isActive ? (
              <button
                className="btn-warning"
                onClick={() => handleShowToggleModal('close')}
              >
                關閉燈種
              </button>
            ) : (
              <button
                className="btn-success"
                onClick={() => handleShowToggleModal('open')}
              >
                開放燈種
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 切換狀態確認對話框 */}
      {showToggleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>確認{toggleAction === 'open' ? '開放' : '關閉'}燈種</h3>
            <p>
              確定要{toggleAction === 'open' ? '開放' : '關閉'}「{lampType.name}」嗎？
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleCancelToggle}>
                取消
              </button>
              <button
                className={toggleAction === 'open' ? 'btn-success' : 'btn-warning'}
                onClick={handleConfirmToggle}
              >
                確認{toggleAction === 'open' ? '開放' : '關閉'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LampTypeDetail;
