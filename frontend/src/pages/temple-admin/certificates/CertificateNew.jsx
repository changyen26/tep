/**
 * 感謝狀管理 - 開立新感謝狀
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Certificates.css';

const CertificateNew = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    recipientName: '',
    type: 'donation',
    reason: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    customMessage: '',
  });

  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 廟宇資訊
  const templeInfo = {
    name: '三官寶殿',
    address: '台南市白河區昇安里三間厝31號',
    phone: '06-6851234',
  };

  // 產生編號
  const generateCertNumber = (type = 'donation') => {
    const year = new Date().getFullYear();
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const prefix = type === 'receipt' ? 'RCP' : 'SGD';
    return `${prefix}-${year}-${random}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.recipientName.trim()) {
      newErrors.recipientName = '請輸入受贈者姓名';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = '請輸入感謝事由';
    }
    if (!formData.date) {
      newErrors.date = '請選擇日期';
    }
    if (formData.type === 'donation' && formData.amount && isNaN(Number(formData.amount))) {
      newErrors.amount = '請輸入有效金額';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (validate()) {
      setShowPreview(true);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      // TODO: 呼叫後端 API 儲存感謝狀
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert('感謝狀已開立成功！');
      navigate(`/temple-admin/${templeId}/certificates`);
    } catch (err) {
      alert('開立失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(`/temple-admin/${templeId}/certificates`);
  };

  // 取得事由預設文字
  const getDefaultReason = (type) => {
    switch (type) {
      case 'donation':
        return '捐贈建廟基金';
      case 'volunteer':
        return '協助廟務義工服務';
      case 'sponsor':
        return '贊助法會活動';
      case 'receipt':
        return '點燈費用';
      default:
        return '';
    }
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

  // 類型變更時更新預設事由
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      reason: prev.reason || getDefaultReason(newType),
    }));
  };

  const certNumber = generateCertNumber(formData.type);

  return (
    <div className="certificates-container">
      {!showPreview ? (
        <>
          <div className="certificates-header">
            <h2>開立感謝狀</h2>
            <button className="btn-secondary" onClick={handleBack}>
              返回列表
            </button>
          </div>

          <div className="certificate-form">
            <div className="form-section">
              <h3>基本資訊</h3>

              <div className="form-group">
                <label className="form-label required">受贈者姓名</label>
                <input
                  type="text"
                  name="recipientName"
                  className="form-input"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="個人姓名或公司行號"
                />
                {errors.recipientName && (
                  <div className="form-error">{errors.recipientName}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label required">開立類型</label>
                <select
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleTypeChange}
                >
                  <option value="donation">捐款感謝</option>
                  <option value="volunteer">義工感謝</option>
                  <option value="sponsor">贊助感謝</option>
                  <option value="receipt">一般收據</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">事由/用途</label>
                <input
                  type="text"
                  name="reason"
                  className="form-input"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="例：捐贈建廟基金"
                />
                {errors.reason && <div className="form-error">{errors.reason}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">金額（選填）</label>
                  <input
                    type="number"
                    name="amount"
                    className="form-input"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="新台幣金額"
                    min="0"
                  />
                  {errors.amount && <div className="form-error">{errors.amount}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label required">開立日期</label>
                  <input
                    type="date"
                    name="date"
                    className="form-input"
                    value={formData.date}
                    onChange={handleChange}
                  />
                  {errors.date && <div className="form-error">{errors.date}</div>}
                </div>
              </div>

              {formData.type !== 'receipt' && (
                <div className="form-group">
                  <label className="form-label">自訂感謝詞（選填）</label>
                  <textarea
                    name="customMessage"
                    className="form-textarea"
                    value={formData.customMessage}
                    onChange={handleChange}
                    placeholder="可自訂感謝內容，留空則使用預設感謝詞"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={handleBack}>
                取消
              </button>
              <button className="btn-primary" onClick={handlePreview}>
                預覽感謝狀
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 預覽模式 */}
          <div className="certificates-header no-print">
            <h2>預覽{formData.type === 'receipt' ? '收據' : '感謝狀'}</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setShowPreview(false)}>
                返回編輯
              </button>
              <button className="btn-secondary" onClick={handlePrint}>
                🖨️ 列印
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '儲存中...' : '確認開立'}
              </button>
            </div>
          </div>

          {formData.type === 'receipt' ? (
            /* 傳統收據預覽 */
            <div className="certificate-preview">
              <div className="receipt-paper">
                <div className="receipt-outer-border">
                  <div className="receipt-inner-border">
                    {/* 標頭 */}
                    <div className="receipt-header">
                      <div className="receipt-title">收　據</div>
                      <div className="receipt-temple-name">{templeInfo.name}</div>
                      <div className="receipt-temple-address">
                        地址：{templeInfo.address}　電話：{templeInfo.phone}
                      </div>
                    </div>

                    {/* 編號與日期 */}
                    <div className="receipt-number-date">
                      <span>收據編號：{certNumber}</span>
                      <span>
                        中華民國 {new Date(formData.date).getFullYear() - 1911} 年{' '}
                        {new Date(formData.date).getMonth() + 1} 月{' '}
                        {new Date(formData.date).getDate()} 日
                      </span>
                    </div>

                    {/* 收據表格 */}
                    <table className="receipt-table">
                      <tbody>
                        <tr>
                          <th>繳款人</th>
                          <td colSpan="3">
                            {formData.recipientName}
                            {!(formData.recipientName.includes('公司') ||
                              formData.recipientName.includes('企業') ||
                              formData.recipientName.includes('行')) && ' 先生/女士'}
                          </td>
                        </tr>
                        <tr>
                          <th>款項名稱</th>
                          <td colSpan="3">{formData.reason}</td>
                        </tr>
                        <tr>
                          <th>金額（大寫）</th>
                          <td colSpan="3" className="amount-cell chinese-amount">
                            新台幣 {numberToChinese(Number(formData.amount) || 0)} 元整
                          </td>
                        </tr>
                        <tr>
                          <th>金額（小寫）</th>
                          <td colSpan="3" className="amount-cell numeric-amount">
                            NT$ {Number(formData.amount || 0).toLocaleString()}
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
                          <span className="receipt-stub-value">{certNumber}</span>
                        </div>
                        <div className="receipt-stub-item">
                          <span className="receipt-stub-label">繳款人：</span>
                          <span className="receipt-stub-value">{formData.recipientName}</span>
                        </div>
                        <div className="receipt-stub-item">
                          <span className="receipt-stub-label">金額：</span>
                          <span className="receipt-stub-value">NT$ {Number(formData.amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="receipt-stub-item">
                          <span className="receipt-stub-label">款項：</span>
                          <span className="receipt-stub-value">{formData.reason}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 感謝狀預覽 */
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
                      <span className="recipient-name">{formData.recipientName}</span>
                      <span className="recipient-suffix">
                        {formData.recipientName.includes('公司') ||
                        formData.recipientName.includes('企業') ||
                        formData.recipientName.includes('行')
                          ? ''
                          : ' 先生/女士'}
                      </span>
                    </div>

                    {/* 感謝內容 */}
                    <div className="certificate-body">
                      {formData.customMessage || (
                        <>
                          承蒙　台端熱心公益，
                          {(formData.type === 'donation' || formData.type === 'sponsor') && formData.amount && (
                            <>
                              {formData.type === 'donation' ? '慨捐' : '贊助'}新台幣
                              <span className="highlight">
                                {Number(formData.amount).toLocaleString()}
                              </span>
                              元整，
                            </>
                          )}
                          {formData.reason}，功德無量。
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
                        證書編號：{certNumber}
                      </div>
                      <div className="certificate-date">
                        中華民國{' '}
                        {new Date(formData.date).getFullYear() - 1911} 年{' '}
                        {new Date(formData.date).getMonth() + 1} 月{' '}
                        {new Date(formData.date).getDate()} 日
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
        </>
      )}
    </div>
  );
};

export default CertificateNew;
