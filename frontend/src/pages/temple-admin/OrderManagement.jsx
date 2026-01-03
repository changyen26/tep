import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import templeAdminApi from '../../services/templeAdminApi';
import './OrderManagement.css';

const OrderManagement = () => {
  const { templeId } = useParams();

  // 訂單列表狀態
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // 篩選狀態
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal 狀態
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 狀態更新
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // 匯出狀態
  const [exporting, setExporting] = useState(false);

  // 訂單狀態選項
  const statusOptions = [
    { value: 'pending', label: '待處理' },
    { value: 'processing', label: '處理中' },
    { value: 'shipped', label: '已出貨' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ];

  // 載入訂單列表
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: pageSize,
      };

      if (keyword) params.keyword = keyword;
      if (selectedStatus) params.status = selectedStatus;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await templeAdminApi.orders.list(templeId, params);

      if (response.success) {
        setOrders(response.data.orders || []);
        setTotal(response.data.total || 0);
        setTotalPages(Math.ceil((response.data.total || 0) / pageSize));
      }
    } catch (err) {
      console.error('載入訂單列表失敗:', err);
      setError('載入訂單列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 初始載入和篩選變更時重新載入
  useEffect(() => {
    if (templeId) {
      fetchOrders();
    }
  }, [templeId, currentPage, selectedStatus, startDate, endDate]);

  // 開啟訂單詳情
  const handleViewDetail = async (order) => {
    setCurrentOrder(order);
    setShowDetailModal(true);
    setLoadingDetail(true);
    setOrderDetail(null);

    try {
      const response = await templeAdminApi.orders.get(templeId, order.id);
      if (response.success) {
        setOrderDetail(response.data);
        setNewStatus(response.data.status || '');
        setStatusNote(response.data.temple_note || '');
        setTrackingNumber(response.data.tracking_number || '');
      }
    } catch (err) {
      console.error('載入訂單詳情失敗:', err);
      alert('載入訂單詳情失敗');
    } finally {
      setLoadingDetail(false);
    }
  };

  // 關閉詳情 Modal
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setCurrentOrder(null);
    setOrderDetail(null);
    setNewStatus('');
    setStatusNote('');
    setTrackingNumber('');
  };

  // 更新訂單狀態
  const handleUpdateStatus = async () => {
    if (!newStatus) {
      alert('請選擇訂單狀態');
      return;
    }

    try {
      setUpdatingStatus(true);

      const data = {
        status: newStatus,
      };

      if (statusNote) data.note = statusNote;
      if (trackingNumber) data.tracking_number = trackingNumber;

      const response = await templeAdminApi.orders.updateStatus(templeId, currentOrder.id, data.status, data.note);

      if (response.success) {
        alert('訂單狀態更新成功');
        handleCloseDetail();
        fetchOrders();
      }
    } catch (err) {
      console.error('更新訂單狀態失敗:', err);
      alert('更新訂單狀態失敗');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // 搜尋處理
  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  // 重置篩選
  const handleReset = () => {
    setKeyword('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // 匯出 CSV（TODO: 待後端實作）
  const handleExport = async () => {
    try {
      setExporting(true);
      // await templeAdminApi.orders.export(templeId, { start_date: startDate, end_date: endDate, status: selectedStatus });
      alert('匯出功能尚未開放，敬請期待');
    } catch (err) {
      console.error('匯出失敗:', err);
      alert('匯出失敗，請稍後再試');
    } finally {
      setExporting(false);
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

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 獲取狀態文字
  const getStatusLabel = (value) => {
    const status = statusOptions.find((s) => s.value === value);
    return status ? status.label : value;
  };

  return (
    <div className="order-management">
      {/* 頁面標題與操作 */}
      <div className="page-header">
        <h1 className="page-title">訂單管理</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? '匯出中...' : '匯出訂單 CSV'}
        </button>
      </div>

      {/* 搜尋與篩選 */}
      <div className="filter-section">
        <div className="filter-form">
          <div className="filter-group">
            <label>搜尋</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="訂單編號或使用者姓名"
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>訂單狀態</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">全部狀態</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>開始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>結束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-actions">
            <button type="button" className="btn-secondary" onClick={handleSearch}>
              搜尋
            </button>
            <button type="button" className="btn-ghost" onClick={handleReset}>
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 訂單列表 */}
      <div className="orders-section">
        {loading ? (
          <p className="loading-message">載入中...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : orders.length === 0 ? (
          <p className="empty-message">目前沒有訂單</p>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>訂單編號</th>
                    <th>商品名稱</th>
                    <th>數量</th>
                    <th>使用者姓名</th>
                    <th>功德點數</th>
                    <th>狀態</th>
                    <th>建立時間</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.product_name || '-'}</td>
                      <td>{order.quantity || 1}</td>
                      <td>{order.user_name || order.recipient_name || '-'}</td>
                      <td>{order.merit_points_used || 0}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td>{formatDateTime(order.redeemed_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="btn-link"
                            onClick={() => handleViewDetail(order)}
                          >
                            檢視
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  上一頁
                </button>
                <span className="pagination-info">
                  第 {currentPage} / {totalPages} 頁（共 {total} 筆）
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一頁
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 訂單詳情 Modal */}
      {showDetailModal && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">訂單詳情 #{currentOrder?.id}</h2>
              <button type="button" className="modal-close" onClick={handleCloseDetail}>
                關閉
              </button>
            </div>

            <div className="modal-body">
              {loadingDetail ? (
                <p className="loading-message">載入中...</p>
              ) : orderDetail ? (
                <div className="order-detail-content">
                  {/* 訂單基本資訊 */}
                  <div className="detail-section">
                    <h3 className="section-title">訂單資訊</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">訂單編號</span>
                        <span className="info-value">#{orderDetail.id}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">建立時間</span>
                        <span className="info-value">
                          {formatDateTime(orderDetail.redeemed_at)}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">商品名稱</span>
                        <span className="info-value">{orderDetail.product_name || '-'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">數量</span>
                        <span className="info-value">{orderDetail.quantity || 1}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">使用功德點數</span>
                        <span className="info-value">{orderDetail.merit_points_used || 0}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">當前狀態</span>
                        <span className={`status-badge status-${orderDetail.status}`}>
                          {getStatusLabel(orderDetail.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 使用者資訊 */}
                  <div className="detail-section">
                    <h3 className="section-title">收件資訊</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">收件人姓名</span>
                        <span className="info-value">{orderDetail.recipient_name || '-'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">聯絡電話</span>
                        <span className="info-value">{orderDetail.recipient_phone || '-'}</span>
                      </div>
                      <div className="info-item full-width">
                        <span className="info-label">收件地址</span>
                        <span className="info-value">{orderDetail.recipient_address || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 訂單狀態時間軸 */}
                  <div className="detail-section">
                    <h3 className="section-title">狀態記錄</h3>
                    <div className="status-timeline">
                      <div className="timeline-item">
                        <span className="timeline-label">訂單建立</span>
                        <span className="timeline-time">
                          {formatDateTime(orderDetail.redeemed_at)}
                        </span>
                      </div>
                      {orderDetail.processed_at && (
                        <div className="timeline-item">
                          <span className="timeline-label">開始處理</span>
                          <span className="timeline-time">
                            {formatDateTime(orderDetail.processed_at)}
                          </span>
                        </div>
                      )}
                      {orderDetail.shipped_at && (
                        <div className="timeline-item">
                          <span className="timeline-label">已出貨</span>
                          <span className="timeline-time">
                            {formatDateTime(orderDetail.shipped_at)}
                          </span>
                        </div>
                      )}
                      {orderDetail.completed_at && (
                        <div className="timeline-item">
                          <span className="timeline-label">已完成</span>
                          <span className="timeline-time">
                            {formatDateTime(orderDetail.completed_at)}
                          </span>
                        </div>
                      )}
                      {orderDetail.cancelled_at && (
                        <div className="timeline-item">
                          <span className="timeline-label">已取消</span>
                          <span className="timeline-time">
                            {formatDateTime(orderDetail.cancelled_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 狀態更新表單 */}
                  <div className="detail-section">
                    <h3 className="section-title">更新訂單</h3>
                    <div className="form-group">
                      <label>訂單狀態</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="form-select"
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>物流單號</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="form-input"
                        placeholder="請輸入物流單號（選填）"
                      />
                    </div>

                    <div className="form-group">
                      <label>廟方備註</label>
                      <textarea
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="form-textarea"
                        rows="4"
                        placeholder="請輸入備註（選填）"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="error-message">載入訂單詳情失敗</p>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-ghost"
                onClick={handleCloseDetail}
                disabled={updatingStatus}
              >
                關閉
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleUpdateStatus}
                disabled={updatingStatus || loadingDetail}
              >
                {updatingStatus ? '更新中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
