/**
 * DonationList - 線上捐款列表
 *
 * 查看所有線上捐款記錄、對帳管理
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Donations.css';

// Mock 捐款資料
const mockDonations = [
  {
    id: 1,
    donorName: '陳大明',
    donorPhone: '0912-345-678',
    donorEmail: 'chen@example.com',
    amount: 5000,
    paymentMethod: 'credit_card',
    paymentMethodLabel: '信用卡',
    purpose: 'general',
    purposeLabel: '一般捐款',
    transactionId: 'TXN20250129001',
    merchantOrderNo: 'DON20250129001',
    paymentStatus: 'paid',
    reconcileStatus: 'matched',
    receiptStatus: 'issued',
    receiptNo: 'R2025010001',
    isAnonymous: false,
    dedicateTo: '闔家平安',
    note: '',
    paidAt: '2025-01-29T10:30:00',
    createdAt: '2025-01-29T10:25:00',
  },
  {
    id: 2,
    donorName: '林小美',
    donorPhone: '0923-456-789',
    donorEmail: 'lin@example.com',
    amount: 10000,
    paymentMethod: 'atm',
    paymentMethodLabel: 'ATM 轉帳',
    purpose: 'construction',
    purposeLabel: '建廟基金',
    transactionId: 'TXN20250129002',
    merchantOrderNo: 'DON20250129002',
    paymentStatus: 'paid',
    reconcileStatus: 'matched',
    receiptStatus: 'pending',
    receiptNo: null,
    isAnonymous: false,
    dedicateTo: '先父林○○',
    note: '請開立正式收據',
    paidAt: '2025-01-29T09:15:00',
    createdAt: '2025-01-29T08:50:00',
  },
  {
    id: 3,
    donorName: '善心人士',
    donorPhone: '0934-567-890',
    donorEmail: 'anonymous@example.com',
    amount: 3000,
    paymentMethod: 'credit_card',
    paymentMethodLabel: '信用卡',
    purpose: 'charity',
    purposeLabel: '慈善救濟',
    transactionId: 'TXN20250128001',
    merchantOrderNo: 'DON20250128001',
    paymentStatus: 'paid',
    reconcileStatus: 'matched',
    receiptStatus: 'not_required',
    receiptNo: null,
    isAnonymous: true,
    dedicateTo: '',
    note: '',
    paidAt: '2025-01-28T16:20:00',
    createdAt: '2025-01-28T16:15:00',
  },
  {
    id: 4,
    donorName: '王志明',
    donorPhone: '0945-678-901',
    donorEmail: 'wang@example.com',
    amount: 20000,
    paymentMethod: 'bank_transfer',
    paymentMethodLabel: '銀行匯款',
    purpose: 'lamp',
    purposeLabel: '點燈功德',
    transactionId: null,
    merchantOrderNo: 'DON20250128002',
    paymentStatus: 'pending',
    reconcileStatus: 'pending',
    receiptStatus: 'pending',
    receiptNo: null,
    isAnonymous: false,
    dedicateTo: '王氏歷代祖先',
    note: '匯款後請通知',
    paidAt: null,
    createdAt: '2025-01-28T14:30:00',
  },
  {
    id: 5,
    donorName: '張美華',
    donorPhone: '0956-789-012',
    donorEmail: 'zhang@example.com',
    amount: 1000,
    paymentMethod: 'credit_card',
    paymentMethodLabel: '信用卡',
    purpose: 'general',
    purposeLabel: '一般捐款',
    transactionId: 'TXN20250127001',
    merchantOrderNo: 'DON20250127001',
    paymentStatus: 'paid',
    reconcileStatus: 'unmatched',
    receiptStatus: 'pending',
    receiptNo: null,
    isAnonymous: false,
    dedicateTo: '',
    note: '',
    paidAt: '2025-01-27T11:00:00',
    createdAt: '2025-01-27T10:55:00',
  },
  {
    id: 6,
    donorName: '李建國',
    donorPhone: '0967-890-123',
    donorEmail: 'li@example.com',
    amount: 50000,
    paymentMethod: 'credit_card',
    paymentMethodLabel: '信用卡',
    purpose: 'construction',
    purposeLabel: '建廟基金',
    transactionId: 'TXN20250126001',
    merchantOrderNo: 'DON20250126001',
    paymentStatus: 'refunded',
    reconcileStatus: 'matched',
    receiptStatus: 'cancelled',
    receiptNo: 'R2025010002',
    isAnonymous: false,
    dedicateTo: '',
    note: '申請退款',
    paidAt: '2025-01-26T09:30:00',
    refundedAt: '2025-01-27T14:00:00',
    createdAt: '2025-01-26T09:25:00',
  },
];

// 統計資料
const mockStats = {
  today: { count: 2, amount: 15000 },
  thisMonth: { count: 45, amount: 356000 },
  pending: { count: 3, amount: 35000 },
  unmatched: { count: 1, amount: 1000 },
};

const DonationList = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 篩選條件
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    reconcileStatus: 'all',
    receiptStatus: 'all',
    purpose: 'all',
    startDate: '',
    endDate: '',
    keyword: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // 載入資料
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setDonations(mockDonations);
        setStats(mockStats);
      } catch (err) {
        console.error('載入失敗:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [templeId]);

  // 篩選資料
  const filteredDonations = donations.filter(d => {
    if (filters.paymentStatus !== 'all' && d.paymentStatus !== filters.paymentStatus) return false;
    if (filters.reconcileStatus !== 'all' && d.reconcileStatus !== filters.reconcileStatus) return false;
    if (filters.receiptStatus !== 'all' && d.receiptStatus !== filters.receiptStatus) return false;
    if (filters.purpose !== 'all' && d.purpose !== filters.purpose) return false;
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      return (
        d.donorName.toLowerCase().includes(kw) ||
        d.donorPhone.includes(kw) ||
        d.merchantOrderNo.toLowerCase().includes(kw) ||
        (d.transactionId && d.transactionId.toLowerCase().includes(kw))
      );
    }
    return true;
  });

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
    });
  };

  // 付款狀態標籤
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

  // 對帳狀態標籤
  const getReconcileStatusBadge = (status) => {
    const config = {
      pending: { label: '待對帳', className: 'reconcile-pending' },
      matched: { label: '已核對', className: 'reconcile-matched' },
      unmatched: { label: '異常', className: 'reconcile-unmatched' },
    };
    const { label, className } = config[status] || { label: status, className: '' };
    return <span className={`reconcile-badge ${className}`}>{label}</span>;
  };

  // 收據狀態標籤
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

  // 處理篩選變更
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  // 清除篩選
  const handleClearFilters = () => {
    setFilters({
      paymentStatus: 'all',
      reconcileStatus: 'all',
      receiptStatus: 'all',
      purpose: 'all',
      startDate: '',
      endDate: '',
      keyword: '',
    });
  };

  // 查看詳情
  const handleView = (id) => {
    navigate(`/temple-admin/${templeId}/donations/${id}`);
  };

  // 對帳報表
  const handleReconcileReport = () => {
    navigate(`/temple-admin/${templeId}/donations/reconcile`);
  };

  // 匯出
  const handleExport = () => {
    alert('匯出功能開發中...');
  };

  return (
    <div className="donations-container">
      {/* 頁面標題 */}
      <div className="donations-header">
        <div className="header-left">
          <h2>線上捐款管理</h2>
          <p className="header-subtitle">管理線上捐款記錄與對帳</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleExport}>
            📥 匯出報表
          </button>
          <button className="btn-primary" onClick={handleReconcileReport}>
            📊 對帳報表
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      {stats && (
        <div className="donation-stats">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.today.count} 筆</div>
              <div className="stat-amount">${formatAmount(stats.today.amount)}</div>
              <div className="stat-label">今日捐款</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📆</div>
            <div className="stat-content">
              <div className="stat-value">{stats.thisMonth.count} 筆</div>
              <div className="stat-amount">${formatAmount(stats.thisMonth.amount)}</div>
              <div className="stat-label">本月捐款</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending.count} 筆</div>
              <div className="stat-amount">${formatAmount(stats.pending.amount)}</div>
              <div className="stat-label">待付款</div>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.unmatched.count} 筆</div>
              <div className="stat-amount">${formatAmount(stats.unmatched.amount)}</div>
              <div className="stat-label">對帳異常</div>
            </div>
          </div>
        </div>
      )}

      {/* 篩選區 */}
      <div className="donation-filters">
        <div className="filter-row">
          <div className="filter-item">
            <label>付款狀態</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            >
              <option value="all">全部</option>
              <option value="pending">待付款</option>
              <option value="paid">已付款</option>
              <option value="failed">付款失敗</option>
              <option value="refunded">已退款</option>
            </select>
          </div>

          <div className="filter-item">
            <label>對帳狀態</label>
            <select
              value={filters.reconcileStatus}
              onChange={(e) => handleFilterChange('reconcileStatus', e.target.value)}
            >
              <option value="all">全部</option>
              <option value="pending">待對帳</option>
              <option value="matched">已核對</option>
              <option value="unmatched">異常</option>
            </select>
          </div>

          <div className="filter-item">
            <label>收據狀態</label>
            <select
              value={filters.receiptStatus}
              onChange={(e) => handleFilterChange('receiptStatus', e.target.value)}
            >
              <option value="all">全部</option>
              <option value="pending">待開立</option>
              <option value="issued">已開立</option>
              <option value="not_required">不需要</option>
            </select>
          </div>

          <div className="filter-item">
            <label>捐款用途</label>
            <select
              value={filters.purpose}
              onChange={(e) => handleFilterChange('purpose', e.target.value)}
            >
              <option value="all">全部</option>
              <option value="general">一般捐款</option>
              <option value="construction">建廟基金</option>
              <option value="charity">慈善救濟</option>
              <option value="lamp">點燈功德</option>
              <option value="event">活動贊助</option>
            </select>
          </div>

          <div className="filter-item">
            <label>開始日期</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label>結束日期</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-item flex-grow">
            <label>搜尋</label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              placeholder="捐款人姓名、電話、訂單編號..."
            />
          </div>
          <div className="filter-item">
            <label>&nbsp;</label>
            <button className="btn-secondary" onClick={handleClearFilters}>
              清除篩選
            </button>
          </div>
        </div>
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="loading-state">載入中...</div>
      ) : filteredDonations.length === 0 ? (
        <div className="empty-state">沒有符合條件的捐款記錄</div>
      ) : (
        <div className="donation-table-wrapper">
          <table className="donation-table">
            <thead>
              <tr>
                <th>訂單編號</th>
                <th>捐款人</th>
                <th>金額</th>
                <th>用途</th>
                <th>付款方式</th>
                <th>付款狀態</th>
                <th>對帳狀態</th>
                <th>收據</th>
                <th>付款時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((donation) => (
                <tr key={donation.id}>
                  <td className="order-no">
                    <div>{donation.merchantOrderNo}</div>
                    {donation.transactionId && (
                      <div className="transaction-id">{donation.transactionId}</div>
                    )}
                  </td>
                  <td>
                    <div className="donor-info">
                      <div className="donor-name">
                        {donation.isAnonymous ? '匿名' : donation.donorName}
                      </div>
                      <div className="donor-contact">{donation.donorPhone}</div>
                    </div>
                  </td>
                  <td className="amount">
                    <span className="amount-value">${formatAmount(donation.amount)}</span>
                  </td>
                  <td>
                    <span className="purpose-badge">{donation.purposeLabel}</span>
                  </td>
                  <td>{donation.paymentMethodLabel}</td>
                  <td>{getPaymentStatusBadge(donation.paymentStatus)}</td>
                  <td>{getReconcileStatusBadge(donation.reconcileStatus)}</td>
                  <td>
                    {getReceiptStatusBadge(donation.receiptStatus)}
                    {donation.receiptNo && (
                      <div className="receipt-no">{donation.receiptNo}</div>
                    )}
                  </td>
                  <td className="paid-time">
                    {formatDateTime(donation.paidAt)}
                  </td>
                  <td>
                    <div className="quick-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleView(donation.id)}
                        title="查看詳情"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分頁 */}
      {filteredDonations.length > pageSize && (
        <div className="pagination">
          <button
            className="btn-pagination"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            上一頁
          </button>
          <span className="pagination-info">
            第 {currentPage} / {Math.ceil(filteredDonations.length / pageSize)} 頁
          </span>
          <button
            className="btn-pagination"
            disabled={currentPage >= Math.ceil(filteredDonations.length / pageSize)}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
};

export default DonationList;
