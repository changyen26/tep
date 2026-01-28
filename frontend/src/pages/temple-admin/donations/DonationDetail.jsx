/**
 * DonationDetail - 捐款詳情
 *
 * 查看捐款詳細資訊、對帳處理、開立收據
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Donations.css';

// Mock 捐款詳情
const mockDonationDetail = {
  id: 1,
  donorName: '陳大明',
  donorPhone: '0912-345-678',
  donorEmail: 'chen@example.com',
  donorAddress: '台北市信義區信義路五段7號',
  amount: 5000,
  paymentMethod: 'credit_card',
  paymentMethodLabel: '信用卡',
  cardLast4: '1234',
  purpose: 'general',
  purposeLabel: '一般捐款',
  transactionId: 'TXN20250129001',
  merchantOrderNo: 'DON20250129001',
  paymentStatus: 'paid',
  reconcileStatus: 'matched',
  receiptStatus: 'issued',
  receiptNo: 'R2025010001',
  receiptType: 'electronic',
  isAnonymous: false,
  dedicateTo: '闔家平安',
  note: '',
  paidAt: '2025-01-29T10:30:00',
  createdAt: '2025-01-29T10:25:00',
  updatedAt: '2025-01-29T10:35:00',
  // 金流資訊
  paymentInfo: {
    gateway: '綠界科技',
    tradeNo: '2501291030001',
    tradeDate: '2025-01-29',
    tradeTime: '10:30:00',
    paymentType: 'Credit_CreditCard',
    bankCode: null,
    authCode: '123456',
    amount: 5000,
    fee: 75,
    netAmount: 4925,
  },
  // 對帳記錄
  reconcileHistory: [
    {
      id: 1,
      action: '系統自動對帳',
      status: 'matched',
      note: '金流回報與訂單金額一致',
      createdAt: '2025-01-29T10:31:00',
      createdBy: '系統',
    },
  ],
  // 收據記錄
  receiptHistory: [
    {
      id: 1,
      action: '開立收據',
      receiptNo: 'R2025010001',
      receiptType: 'electronic',
      note: '電子收據已發送至 Email',
      createdAt: '2025-01-29T10:35:00',
      createdBy: '王小明',
    },
  ],
};

const DonationDetail = () => {
  const { templeId, donationId } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // Modal 狀態
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [reconcileNote, setReconcileNote] = useState('');
  const [receiptType, setReceiptType] = useState('electronic');

  // 載入資料
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setDonation(mockDonationDetail);
      } catch (err) {
        console.error('載入失敗:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [templeId, donationId]);

  // 格式化金額
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('zh-TW').format(amount);
  };

  // 格式化日期
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 狀態標籤
  const getPaymentStatusBadge = (status) => {
    const config = {
      pending: { label: '待付款', className: 'status-pending' },
      paid: { label: '已付款', className: 'status-paid' },
      failed: { label: '付款失敗', className: 'status-failed' },
      refunded: { label: '已退款', className: 'status-refunded' },
    };
    const { label, className } = config[status] || { label: status, className: '' };
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  const getReconcileStatusBadge = (status) => {
    const config = {
      pending: { label: '待對帳', className: 'reconcile-pending' },
      matched: { label: '已核對', className: 'reconcile-matched' },
      unmatched: { label: '異常', className: 'reconcile-unmatched' },
    };
    const { label, className } = config[status] || { label: status, className: '' };
    return <span className={`reconcile-badge ${className}`}>{label}</span>;
  };

  const getReceiptStatusBadge = (status) => {
    const config = {
      pending: { label: '待開立', className: 'receipt-pending' },
      issued: { label: '已開立', className: 'receipt-issued' },
      not_required: { label: '不需要', className: 'receipt-not-required' },
      cancelled: { label: '已作廢', className: 'receipt-cancelled' },
    };
    const { label, className } = config[status] || { label: status, className: '' };
    return <span className={`receipt-badge ${className}`}>{label}</span>;
  };

  // 處理對帳
  const handleReconcile = (status) => {
    // TODO: 呼叫 API
    setDonation(prev => ({
      ...prev,
      reconcileStatus: status,
      reconcileHistory: [
        ...prev.reconcileHistory,
        {
          id: prev.reconcileHistory.length + 1,
          action: status === 'matched' ? '手動確認對帳' : '標記異常',
          status,
          note: reconcileNote,
          createdAt: new Date().toISOString(),
          createdBy: '管理員',
        },
      ],
    }));
    setShowReconcileModal(false);
    setReconcileNote('');
    alert(status === 'matched' ? '對帳確認成功' : '已標記為異常');
  };

  // 開立收據
  const handleIssueReceipt = () => {
    // TODO: 呼叫 API
    const newReceiptNo = `R${new Date().getFullYear()}${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`;
    setDonation(prev => ({
      ...prev,
      receiptStatus: 'issued',
      receiptNo: newReceiptNo,
      receiptHistory: [
        ...prev.receiptHistory,
        {
          id: prev.receiptHistory.length + 1,
          action: '開立收據',
          receiptNo: newReceiptNo,
          receiptType: receiptType,
          note: receiptType === 'electronic' ? '電子收據已發送至 Email' : '紙本收據待寄送',
          createdAt: new Date().toISOString(),
          createdBy: '管理員',
        },
      ],
    }));
    setShowReceiptModal(false);
    alert('收據開立成功');
  };

  // 返回
  const handleBack = () => navigate(`/temple-admin/${templeId}/donations`);

  if (loading) {
    return (
      <div className="donations-container">
        <div className="loading-state">載入中...</div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="donations-container">
        <div className="error-state">找不到此捐款記錄</div>
      </div>
    );
  }

  return (
    <div className="donations-container">
      {/* 頁面標題 */}
      <div className="donations-header">
        <div className="header-left">
          <button className="btn-back" onClick={handleBack}>
            ← 返回
          </button>
          <h2>捐款詳情</h2>
        </div>
        <div className="header-actions">
          {donation.reconcileStatus === 'pending' && (
            <button
              className="btn-secondary"
              onClick={() => setShowReconcileModal(true)}
            >
              ✅ 對帳處理
            </button>
          )}
          {donation.receiptStatus === 'pending' && donation.paymentStatus === 'paid' && (
            <button
              className="btn-primary"
              onClick={() => setShowReceiptModal(true)}
            >
              📄 開立收據
            </button>
          )}
        </div>
      </div>

      {/* 捐款摘要卡片 */}
      <div className="donation-summary-card">
        <div className="summary-main">
          <div className="summary-amount">
            <span className="currency">NT$</span>
            <span className="value">{formatAmount(donation.amount)}</span>
          </div>
          <div className="summary-meta">
            <span className="order-no">{donation.merchantOrderNo}</span>
            <span className="purpose-badge">{donation.purposeLabel}</span>
          </div>
        </div>
        <div className="summary-status">
          <div className="status-item">
            <label>付款狀態</label>
            {getPaymentStatusBadge(donation.paymentStatus)}
          </div>
          <div className="status-item">
            <label>對帳狀態</label>
            {getReconcileStatusBadge(donation.reconcileStatus)}
          </div>
          <div className="status-item">
            <label>收據狀態</label>
            {getReceiptStatusBadge(donation.receiptStatus)}
            {donation.receiptNo && (
              <div className="receipt-no">{donation.receiptNo}</div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          📋 基本資料
        </button>
        <button
          className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          💳 金流資訊
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 處理紀錄
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="detail-section">
          <div className="info-grid">
            <div className="info-group">
              <h4>捐款人資料</h4>
              <div className="info-item">
                <label>姓名</label>
                <div>{donation.isAnonymous ? '匿名捐款' : donation.donorName}</div>
              </div>
              <div className="info-item">
                <label>電話</label>
                <div>{donation.donorPhone}</div>
              </div>
              <div className="info-item">
                <label>Email</label>
                <div>{donation.donorEmail}</div>
              </div>
              <div className="info-item">
                <label>地址</label>
                <div>{donation.donorAddress || '-'}</div>
              </div>
            </div>

            <div className="info-group">
              <h4>捐款資訊</h4>
              <div className="info-item">
                <label>捐款金額</label>
                <div className="highlight">${formatAmount(donation.amount)}</div>
              </div>
              <div className="info-item">
                <label>捐款用途</label>
                <div>{donation.purposeLabel}</div>
              </div>
              <div className="info-item">
                <label>迴向對象</label>
                <div>{donation.dedicateTo || '-'}</div>
              </div>
              <div className="info-item">
                <label>備註</label>
                <div>{donation.note || '-'}</div>
              </div>
            </div>

            <div className="info-group">
              <h4>時間資訊</h4>
              <div className="info-item">
                <label>建立時間</label>
                <div>{formatDateTime(donation.createdAt)}</div>
              </div>
              <div className="info-item">
                <label>付款時間</label>
                <div>{formatDateTime(donation.paidAt)}</div>
              </div>
              <div className="info-item">
                <label>更新時間</label>
                <div>{formatDateTime(donation.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payment' && donation.paymentInfo && (
        <div className="detail-section">
          <div className="info-grid">
            <div className="info-group">
              <h4>金流閘道資訊</h4>
              <div className="info-item">
                <label>金流商</label>
                <div>{donation.paymentInfo.gateway}</div>
              </div>
              <div className="info-item">
                <label>金流交易編號</label>
                <div className="mono">{donation.paymentInfo.tradeNo}</div>
              </div>
              <div className="info-item">
                <label>交易日期</label>
                <div>{donation.paymentInfo.tradeDate}</div>
              </div>
              <div className="info-item">
                <label>交易時間</label>
                <div>{donation.paymentInfo.tradeTime}</div>
              </div>
            </div>

            <div className="info-group">
              <h4>付款方式</h4>
              <div className="info-item">
                <label>付款類型</label>
                <div>{donation.paymentMethodLabel}</div>
              </div>
              {donation.cardLast4 && (
                <div className="info-item">
                  <label>卡號末四碼</label>
                  <div>**** **** **** {donation.cardLast4}</div>
                </div>
              )}
              {donation.paymentInfo.authCode && (
                <div className="info-item">
                  <label>授權碼</label>
                  <div className="mono">{donation.paymentInfo.authCode}</div>
                </div>
              )}
            </div>

            <div className="info-group">
              <h4>金額明細</h4>
              <div className="info-item">
                <label>交易金額</label>
                <div>${formatAmount(donation.paymentInfo.amount)}</div>
              </div>
              <div className="info-item">
                <label>手續費</label>
                <div className="fee">-${formatAmount(donation.paymentInfo.fee)}</div>
              </div>
              <div className="info-item">
                <label>實收金額</label>
                <div className="highlight">${formatAmount(donation.paymentInfo.netAmount)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="detail-section">
          <h4>對帳紀錄</h4>
          <div className="history-timeline">
            {donation.reconcileHistory.map(record => (
              <div key={record.id} className="timeline-item">
                <div className="timeline-icon">
                  {record.status === 'matched' ? '✅' : record.status === 'unmatched' ? '⚠️' : '🔄'}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-action">{record.action}</span>
                    <span className={`reconcile-badge reconcile-${record.status}`}>
                      {record.status === 'matched' ? '已核對' : record.status === 'unmatched' ? '異常' : '處理中'}
                    </span>
                  </div>
                  {record.note && <div className="timeline-note">{record.note}</div>}
                  <div className="timeline-meta">
                    <span>{formatDateTime(record.createdAt)}</span>
                    <span>由 {record.createdBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h4 style={{ marginTop: 32 }}>收據紀錄</h4>
          <div className="history-timeline">
            {donation.receiptHistory.length === 0 ? (
              <div className="empty-history">尚無收據紀錄</div>
            ) : (
              donation.receiptHistory.map(record => (
                <div key={record.id} className="timeline-item">
                  <div className="timeline-icon">📄</div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-action">{record.action}</span>
                      {record.receiptNo && (
                        <span className="receipt-no-tag">{record.receiptNo}</span>
                      )}
                    </div>
                    {record.note && <div className="timeline-note">{record.note}</div>}
                    <div className="timeline-meta">
                      <span>{formatDateTime(record.createdAt)}</span>
                      <span>由 {record.createdBy}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 對帳 Modal */}
      {showReconcileModal && (
        <div className="modal-overlay" onClick={() => setShowReconcileModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>對帳處理</h3>
            <div className="modal-body">
              <p>訂單編號：{donation.merchantOrderNo}</p>
              <p>金額：${formatAmount(donation.amount)}</p>
              <p>金流交易編號：{donation.transactionId || '-'}</p>

              <div className="form-group">
                <label>備註</label>
                <textarea
                  value={reconcileNote}
                  onChange={(e) => setReconcileNote(e.target.value)}
                  placeholder="輸入對帳備註..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowReconcileModal(false)}
              >
                取消
              </button>
              <button
                className="btn-danger"
                onClick={() => handleReconcile('unmatched')}
              >
                標記異常
              </button>
              <button
                className="btn-primary"
                onClick={() => handleReconcile('matched')}
              >
                確認對帳
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 開立收據 Modal */}
      {showReceiptModal && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>開立收據</h3>
            <div className="modal-body">
              <p>捐款人：{donation.donorName}</p>
              <p>金額：${formatAmount(donation.amount)}</p>
              <p>用途：{donation.purposeLabel}</p>

              <div className="form-group">
                <label>收據類型</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="receiptType"
                      value="electronic"
                      checked={receiptType === 'electronic'}
                      onChange={(e) => setReceiptType(e.target.value)}
                    />
                    電子收據（Email 發送）
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="receiptType"
                      value="paper"
                      checked={receiptType === 'paper'}
                      onChange={(e) => setReceiptType(e.target.value)}
                    />
                    紙本收據（郵寄）
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowReceiptModal(false)}
              >
                取消
              </button>
              <button className="btn-primary" onClick={handleIssueReceipt}>
                開立收據
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationDetail;
