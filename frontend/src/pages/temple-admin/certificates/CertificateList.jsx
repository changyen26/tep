/**
 * 感謝狀管理 - 列表頁面
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Certificates.css';

// Mock 資料
const mockCertificates = [
  {
    id: 1,
    recipientName: '王大明',
    type: 'donation',
    reason: '捐贈建廟基金',
    amount: 50000,
    date: '2026-01-15',
    certificateNumber: 'SGD-2026-0001',
    createdAt: '2026-01-15T10:30:00',
  },
  {
    id: 2,
    recipientName: '李淑芬',
    type: 'volunteer',
    reason: '協助上元天官賜福法會義工服務',
    amount: null,
    date: '2026-01-20',
    certificateNumber: 'SGD-2026-0002',
    createdAt: '2026-01-20T14:00:00',
  },
  {
    id: 3,
    recipientName: '張記企業有限公司',
    type: 'sponsor',
    reason: '贊助中元普度法會供品',
    amount: 30000,
    date: '2025-08-25',
    certificateNumber: 'SGD-2025-0015',
    createdAt: '2025-08-25T09:00:00',
  },
  {
    id: 4,
    recipientName: '陳美珍',
    type: 'donation',
    reason: '捐贈光明燈油資',
    amount: 10000,
    date: '2026-01-10',
    certificateNumber: 'SGD-2026-0003',
    createdAt: '2026-01-10T11:20:00',
  },
  {
    id: 5,
    recipientName: '林志明',
    type: 'receipt',
    reason: '太歲燈費用',
    amount: 3600,
    date: '2026-01-25',
    certificateNumber: 'RCP-2026-0001',
    createdAt: '2026-01-25T15:30:00',
  },
];

const typeLabels = {
  donation: '捐款',
  volunteer: '義工',
  sponsor: '贊助',
  receipt: '收據',
  other: '其他',
};

const CertificateList = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    // 模擬載入資料
    setTimeout(() => {
      setCertificates(mockCertificates);
      setLoading(false);
    }, 300);
  }, []);

  // 篩選資料
  const filteredCertificates = certificates.filter((cert) => {
    const matchKeyword =
      !keyword ||
      cert.recipientName.includes(keyword) ||
      cert.reason.includes(keyword) ||
      cert.certificateNumber.includes(keyword);
    const matchType = typeFilter === 'all' || cert.type === typeFilter;
    return matchKeyword && matchType;
  });

  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-TW');
  };

  // 格式化金額
  const formatAmount = (amount) => {
    if (!amount) return '-';
    return `NT$ ${amount.toLocaleString()}`;
  };

  // 建立新感謝狀
  const handleCreate = () => {
    navigate(`/temple-admin/${templeId}/certificates/new`);
  };

  // 查看/列印感謝狀
  const handleView = (id) => {
    navigate(`/temple-admin/${templeId}/certificates/${id}`);
  };

  return (
    <div className="certificates-container">
      <div className="certificates-header">
        <h2>感謝狀管理</h2>
        <button className="btn-primary" onClick={handleCreate}>
          開立感謝狀
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="cert-stats-cards">
        <div className="cert-stat-card">
          <div className="cert-stat-value">{certificates.length}</div>
          <div className="cert-stat-label">總開立數</div>
        </div>
        <div className="cert-stat-card">
          <div className="cert-stat-value">
            {certificates.filter((c) => c.type === 'donation').length}
          </div>
          <div className="cert-stat-label">捐款感謝</div>
        </div>
        <div className="cert-stat-card">
          <div className="cert-stat-value">
            {certificates.filter((c) => c.type === 'volunteer').length}
          </div>
          <div className="cert-stat-label">義工感謝</div>
        </div>
        <div className="cert-stat-card">
          <div className="cert-stat-value">
            NT$ {certificates.reduce((sum, c) => sum + (c.amount || 0), 0).toLocaleString()}
          </div>
          <div className="cert-stat-label">累計金額</div>
        </div>
      </div>

      {/* 篩選 */}
      <div className="certificates-filters">
        <div className="filter-group">
          <button
            className={`filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            全部
          </button>
          <button
            className={`filter-btn ${typeFilter === 'donation' ? 'active' : ''}`}
            onClick={() => setTypeFilter('donation')}
          >
            捐款
          </button>
          <button
            className={`filter-btn ${typeFilter === 'volunteer' ? 'active' : ''}`}
            onClick={() => setTypeFilter('volunteer')}
          >
            義工
          </button>
          <button
            className={`filter-btn ${typeFilter === 'sponsor' ? 'active' : ''}`}
            onClick={() => setTypeFilter('sponsor')}
          >
            贊助
          </button>
          <button
            className={`filter-btn ${typeFilter === 'receipt' ? 'active' : ''}`}
            onClick={() => setTypeFilter('receipt')}
          >
            收據
          </button>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="搜尋姓名、事由或編號..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="loading-state">載入中...</div>
      ) : filteredCertificates.length === 0 ? (
        <div className="empty-state">
          {keyword || typeFilter !== 'all' ? '沒有符合條件的感謝狀' : '尚無感謝狀記錄'}
        </div>
      ) : (
        <div className="certificates-table-wrapper">
          <table className="certificates-table">
            <thead>
              <tr>
                <th>編號</th>
                <th>受贈者</th>
                <th>類型</th>
                <th>事由</th>
                <th>金額</th>
                <th>開立日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map((cert) => (
                <tr key={cert.id}>
                  <td className="cert-number">{cert.certificateNumber}</td>
                  <td className="cert-recipient">{cert.recipientName}</td>
                  <td>
                    <span className={`cert-type-badge ${cert.type}`}>
                      {typeLabels[cert.type]}
                    </span>
                  </td>
                  <td className="cert-reason">{cert.reason}</td>
                  <td>{formatAmount(cert.amount)}</td>
                  <td>{formatDate(cert.date)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => handleView(cert.id)}
                        title="查看/列印"
                      >
                        🖨️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CertificateList;
