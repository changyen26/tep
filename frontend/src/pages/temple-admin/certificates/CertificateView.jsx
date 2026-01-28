/**
 * 感謝狀管理 - 查看/列印感謝狀
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Certificates.css';

// Mock 資料
const mockCertificates = {
  1: {
    id: 1,
    recipientName: '王大明',
    type: 'donation',
    reason: '捐贈建廟基金',
    amount: 50000,
    date: '2026-01-15',
    certificateNumber: 'SGD-2026-0001',
    customMessage: '',
  },
  2: {
    id: 2,
    recipientName: '李淑芬',
    type: 'volunteer',
    reason: '協助上元天官賜福法會義工服務',
    amount: null,
    date: '2026-01-20',
    certificateNumber: 'SGD-2026-0002',
    customMessage: '',
  },
  3: {
    id: 3,
    recipientName: '張記企業有限公司',
    type: 'sponsor',
    reason: '贊助中元普度法會供品',
    amount: 30000,
    date: '2025-08-25',
    certificateNumber: 'SGD-2025-0015',
    customMessage: '',
  },
  4: {
    id: 4,
    recipientName: '陳美珍',
    type: 'donation',
    reason: '捐贈光明燈油資',
    amount: 10000,
    date: '2026-01-10',
    certificateNumber: 'SGD-2026-0003',
    customMessage: '',
  },
  5: {
    id: 5,
    recipientName: '林志明',
    type: 'receipt',
    reason: '太歲燈費用',
    amount: 3600,
    date: '2026-01-25',
    certificateNumber: 'RCP-2026-0001',
    customMessage: '',
  },
};

// 數字轉中文大寫
const numberToChinese = (num) => {
  const digits = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '萬', '億'];

  if (num === 0) return '零';

  let result = '';
  let numStr = String(Math.floor(num));
  let unitIndex = 0;

  while (numStr.length > 0) {
    const section = numStr.slice(-4);
    numStr = numStr.slice(0, -4);

    let sectionResult = '';
    for (let i = 0; i < section.length; i++) {
      const digit = parseInt(section[section.length - 1 - i]);
      if (digit !== 0) {
        sectionResult = digits[digit] + units[i] + sectionResult;
      } else if (sectionResult && !sectionResult.startsWith('零')) {
        sectionResult = '零' + sectionResult;
      }
    }

    if (sectionResult) {
      result = sectionResult + bigUnits[unitIndex] + result;
    }
    unitIndex++;
  }

  return result;
};

const CertificateView = () => {
  const { templeId, certificateId } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  // 廟宇資訊
  const templeInfo = {
    name: '三官寶殿',
    address: '台南市白河區昇安里三間厝31號',
  };

  useEffect(() => {
    // 模擬載入資料
    setTimeout(() => {
      setCertificate(mockCertificates[certificateId] || null);
      setLoading(false);
    }, 300);
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(`/temple-admin/${templeId}/certificates`);
  };

  if (loading) {
    return (
      <div className="certificates-container">
        <div className="loading-state">載入中...</div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="certificates-container">
        <div className="empty-state">找不到此感謝狀</div>
      </div>
    );
  }

  return (
    <div className="certificates-container">
      {/* 操作列 */}
      <div className="certificates-header no-print">
        <h2>{certificate.type === 'receipt' ? '收據' : '感謝狀'} - {certificate.certificateNumber}</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={handleBack}>
            返回列表
          </button>
          <button className="btn-primary" onClick={handlePrint}>
            🖨️ 列印
          </button>
        </div>
      </div>

      {certificate.type === 'receipt' ? (
        /* 傳統收據 */
        <div className="certificate-preview">
          <div className="receipt-paper">
            <div className="receipt-outer-border">
              <div className="receipt-inner-border">
                {/* 標頭 */}
                <div className="receipt-header">
                  <div className="receipt-title">收　據</div>
                  <div className="receipt-temple-name">{templeInfo.name}</div>
                  <div className="receipt-temple-address">
                    地址：{templeInfo.address}
                  </div>
                </div>

                {/* 編號與日期 */}
                <div className="receipt-number-date">
                  <span>收據編號：{certificate.certificateNumber}</span>
                  <span>
                    中華民國 {new Date(certificate.date).getFullYear() - 1911} 年{' '}
                    {new Date(certificate.date).getMonth() + 1} 月{' '}
                    {new Date(certificate.date).getDate()} 日
                  </span>
                </div>

                {/* 收據表格 */}
                <table className="receipt-table">
                  <tbody>
                    <tr>
                      <th>繳款人</th>
                      <td colSpan="3">
                        {certificate.recipientName}
                        {!(certificate.recipientName.includes('公司') ||
                          certificate.recipientName.includes('企業') ||
                          certificate.recipientName.includes('行')) && ' 先生/女士'}
                      </td>
                    </tr>
                    <tr>
                      <th>款項名稱</th>
                      <td colSpan="3">{certificate.reason}</td>
                    </tr>
                    <tr>
                      <th>金額（大寫）</th>
                      <td colSpan="3" className="amount-cell chinese-amount">
                        新台幣 {numberToChinese(Number(certificate.amount) || 0)} 元整
                      </td>
                    </tr>
                    <tr>
                      <th>金額（小寫）</th>
                      <td colSpan="3" className="amount-cell numeric-amount">
                        NT$ {Number(certificate.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 底部 */}
                <div className="receipt-footer">
                  <div className="receipt-note">
                    <div className="receipt-note-item">※ 本收據為正式憑證，請妥善保管</div>
                    <div className="receipt-note-item">※ 如有疑問請洽本殿服務處</div>
                  </div>
                  <div className="receipt-seal-area">
                    <div className="receipt-seal-label">經收章</div>
                    <div className="receipt-seal-box">
                      {templeInfo.name}
                      <br />
                      之印
                    </div>
                  </div>
                </div>

                {/* 存根聯 */}
                <div className="receipt-stub">
                  <div className="receipt-stub-title">- - - - - - - - 存根聯 - - - - - - - -</div>
                  <div className="receipt-stub-info">
                    <div className="receipt-stub-item">
                      <span className="receipt-stub-label">編號：</span>
                      <span className="receipt-stub-value">{certificate.certificateNumber}</span>
                    </div>
                    <div className="receipt-stub-item">
                      <span className="receipt-stub-label">繳款人：</span>
                      <span className="receipt-stub-value">{certificate.recipientName}</span>
                    </div>
                    <div className="receipt-stub-item">
                      <span className="receipt-stub-label">金額：</span>
                      <span className="receipt-stub-value">NT$ {Number(certificate.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="receipt-stub-item">
                      <span className="receipt-stub-label">款項：</span>
                      <span className="receipt-stub-value">{certificate.reason}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 感謝狀 */
        <div className="certificate-preview">
          <div className="certificate-paper">
            <div className="certificate-border">
              <div className="certificate-content">
                {/* 標題 */}
                <div className="certificate-title">感 謝 狀</div>

                {/* 廟宇名稱 */}
                <div className="certificate-temple">{templeInfo.name}</div>

                {/* 受贈者 */}
                <div className="certificate-recipient">
                  <span className="recipient-name">{certificate.recipientName}</span>
                  <span className="recipient-suffix">
                    {certificate.recipientName.includes('公司') ||
                    certificate.recipientName.includes('企業') ||
                    certificate.recipientName.includes('行')
                      ? ''
                      : ' 先生/女士'}
                  </span>
                </div>

                {/* 感謝內容 */}
                <div className="certificate-body">
                  {certificate.customMessage || (
                    <>
                      承蒙　台端熱心公益，
                      {(certificate.type === 'donation' || certificate.type === 'sponsor') && certificate.amount && (
                        <>
                          {certificate.type === 'donation' ? '慨捐' : '贊助'}新台幣
                          <span className="highlight">
                            {Number(certificate.amount).toLocaleString()}
                          </span>
                          元整，
                        </>
                      )}
                      {certificate.reason}，功德無量。
                      <br />
                      <br />
                      本殿特頒此狀，以表謝忱。
                      <br />
                      祈願　三官大帝庇佑，
                      <br />
                      闔府平安、事業順遂、福慧增長。
                    </>
                  )}
                </div>

                {/* 編號與日期 */}
                <div className="certificate-footer">
                  <div className="certificate-number">
                    證書編號：{certificate.certificateNumber}
                  </div>
                  <div className="certificate-date">
                    中華民國{' '}
                    {new Date(certificate.date).getFullYear() - 1911} 年{' '}
                    {new Date(certificate.date).getMonth() + 1} 月{' '}
                    {new Date(certificate.date).getDate()} 日
                  </div>
                </div>

                {/* 印章位置 */}
                <div className="certificate-seal">
                  <div className="seal-placeholder">
                    {templeInfo.name}
                    <br />
                    之印
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateView;
