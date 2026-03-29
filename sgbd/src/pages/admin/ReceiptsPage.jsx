import { useState, useEffect } from 'react'
import { useData } from '../../contexts/DataContext'
import { lightTypeNames, formatDate } from '../../utils/adminUtils'
import { loadFromStorage, saveToStorage } from '../../utils/storage'
import AdminModal from '../../components/admin/AdminModal'
import { Printer, FileText, History, Check } from 'lucide-react'

function ReceiptsPage() {
  const { lightings, pilgrimages } = useData()
  const [receiptType, setReceiptType] = useState('lighting')
  const [selectedItems, setSelectedItems] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  const [receiptHistory, setReceiptHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    setReceiptHistory(loadFromStorage('receipts', []))
  }, [])

  const paidLightings = lightings.filter(l => l.status === 'paid' || l.status === 'completed')
  const confirmedPilgrimages = pilgrimages.filter(p => p.status === 'confirmed' || p.status === 'completed')
  const currentItems = receiptType === 'lighting' ? paidLightings : confirmedPilgrimages

  const generateReceiptNumber = () => {
    let counter = loadFromStorage('receipt_counter', 0)
    counter++
    saveToStorage('receipt_counter', counter)
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    return `SGBD-${dateStr}-${String(counter).padStart(4, '0')}`
  }

  const toggleSelect = (id) => setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  const selectAll = () => {
    if (selectedItems.length === currentItems.length) setSelectedItems([])
    else setSelectedItems(currentItems.map(i => i.id))
  }

  const openReceiptPreview = (item) => {
    const receipt = {
      number: generateReceiptNumber(),
      date: new Date().toLocaleDateString('zh-TW'),
      type: receiptType,
      itemName: receiptType === 'lighting' ? (lightTypeNames[item.lightType] || item.lightName) : '進香接待',
      payerName: receiptType === 'lighting' ? item.members.map(m => m.name).join('、') : item.templeName,
      amount: receiptType === 'lighting' ? item.totalAmount : 0,
      description: receiptType === 'lighting' ? `${lightTypeNames[item.lightType] || item.lightName} ${item.members.length} 位` : `進香團接待 ${item.peopleCount} 人`,
    }
    setReceiptData(receipt)
    setShowPreview(true)
  }

  const saveReceipt = (receipt) => {
    const updated = [{ ...receipt, createdAt: new Date().toISOString() }, ...receiptHistory]
    setReceiptHistory(updated)
    saveToStorage('receipts', updated)
  }

  const printReceipt = () => {
    if (!receiptData) return
    saveReceipt(receiptData)

    const printContent = `<!DOCTYPE html><html><head><title>收據 - ${receiptData.number}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Microsoft JhengHei','Noto Sans TC',sans-serif;padding:20px;background:#fff}
      .receipt{max-width:800px;margin:0 auto;border:3px double #333;padding:30px}
      .receipt-header{text-align:center;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:20px}
      .temple-name{font-size:28px;font-weight:bold;color:#8B4513;letter-spacing:8px}.receipt-title{font-size:24px;margin-top:10px;letter-spacing:4px}
      .receipt-number{text-align:right;color:#666;margin-bottom:20px}.receipt-body{padding:20px 0}
      .receipt-row{display:flex;margin-bottom:15px;font-size:16px}.receipt-label{width:120px;color:#666}
      .receipt-value{flex:1;border-bottom:1px solid #ccc;padding-bottom:5px}
      .amount-row{background:#f9f9f9;padding:15px;margin:20px 0;border-radius:4px}
      .amount-row .receipt-label{font-size:18px;color:#333}.amount-row .receipt-value{font-size:24px;font-weight:bold;color:#8B4513;border:none}
      .receipt-footer{border-top:2px solid #333;padding-top:20px;margin-top:30px}
      .temple-info{font-size:14px;color:#666;line-height:1.8}
      .stamp-area{display:flex;justify-content:space-between;margin-top:40px}
      .stamp-box{width:120px;height:120px;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:14px}
      .signature-line{width:200px;text-align:center}.signature-line .line{border-bottom:1px solid #333;height:60px}.signature-line .label{margin-top:5px;color:#666}
      @media print{body{padding:0}.receipt{border-width:2px}}</style></head>
      <body><div class="receipt">
      <div class="receipt-header"><div class="temple-name">白河三官寶殿</div><div class="receipt-title">收 據</div></div>
      <div class="receipt-number">收據編號：${receiptData.number}</div>
      <div class="receipt-body">
      <div class="receipt-row"><span class="receipt-label">日期：</span><span class="receipt-value">${receiptData.date}</span></div>
      <div class="receipt-row"><span class="receipt-label">信眾姓名：</span><span class="receipt-value">${receiptData.payerName}</span></div>
      <div class="receipt-row"><span class="receipt-label">服務項目：</span><span class="receipt-value">${receiptData.itemName}</span></div>
      <div class="receipt-row"><span class="receipt-label">項目說明：</span><span class="receipt-value">${receiptData.description}</span></div>
      <div class="amount-row"><div class="receipt-row" style="margin:0"><span class="receipt-label">金額：</span><span class="receipt-value">新臺幣 ${receiptData.amount.toLocaleString()} 元整</span></div></div>
      </div>
      <div class="receipt-footer"><div class="temple-info"><p>宮廟名稱：白河三官寶殿</p><p>地址：臺南市白河區外角里4鄰外角41號</p><p>電話：06-685-2428</p></div>
      <div class="stamp-area"><div class="stamp-box">廟方印鑑</div><div class="signature-line"><div class="line"></div><div class="label">經手人</div></div><div class="signature-line"><div class="line"></div><div class="label">收款人</div></div></div>
      </div></div></body></html>`

    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
    setShowPreview(false)
  }

  const printBatchReceipts = () => {
    const items = currentItems.filter(item => selectedItems.includes(item.id))
    if (items.length === 0) return

    const receipts = items.map(item => {
      const number = generateReceiptNumber()
      const receipt = {
        number,
        date: new Date().toLocaleDateString('zh-TW'),
        itemName: receiptType === 'lighting' ? (lightTypeNames[item.lightType] || item.lightName) : '進香接待',
        payerName: receiptType === 'lighting' ? item.members.map(m => m.name).join('、') : item.templeName,
        amount: receiptType === 'lighting' ? item.totalAmount : 0,
        description: receiptType === 'lighting' ? `${lightTypeNames[item.lightType] || item.lightName} ${item.members.length} 位` : `進香團接待 ${item.peopleCount} 人`,
      }
      saveReceipt(receipt)
      return receipt
    })

    const receiptsHtml = receipts.map(r => `<div class="receipt" style="page-break-after:always;">
      <div class="receipt-header"><div class="temple-name">白河三官寶殿</div><div class="receipt-title">收 據</div></div>
      <div class="receipt-number">收據編號：${r.number}</div>
      <div class="receipt-body">
      <div class="receipt-row"><span class="receipt-label">日期：</span><span class="receipt-value">${r.date}</span></div>
      <div class="receipt-row"><span class="receipt-label">信眾姓名：</span><span class="receipt-value">${r.payerName}</span></div>
      <div class="receipt-row"><span class="receipt-label">服務項目：</span><span class="receipt-value">${r.itemName}</span></div>
      <div class="receipt-row"><span class="receipt-label">項目說明：</span><span class="receipt-value">${r.description}</span></div>
      <div class="amount-row"><div class="receipt-row" style="margin:0"><span class="receipt-label">金額：</span><span class="receipt-value">新臺幣 ${r.amount.toLocaleString()} 元整</span></div></div>
      </div>
      <div class="receipt-footer"><div class="temple-info"><p>宮廟名稱：白河三官寶殿</p><p>地址：臺南市白河區外角里4鄰外角41號</p><p>電話：06-685-2428</p></div>
      <div class="stamp-area"><div class="stamp-box">廟方印鑑</div><div class="signature-line"><div class="line"></div><div class="label">經手人</div></div><div class="signature-line"><div class="line"></div><div class="label">收款人</div></div></div>
      </div></div>`).join('')

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Microsoft JhengHei',sans-serif;background:#fff}.receipt{max-width:800px;margin:20px auto;border:3px double #333;padding:30px}.receipt-header{text-align:center;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:20px}.temple-name{font-size:28px;font-weight:bold;color:#8B4513;letter-spacing:8px}.receipt-title{font-size:24px;margin-top:10px;letter-spacing:4px}.receipt-number{text-align:right;color:#666;margin-bottom:20px}.receipt-body{padding:20px 0}.receipt-row{display:flex;margin-bottom:15px;font-size:16px}.receipt-label{width:120px;color:#666}.receipt-value{flex:1;border-bottom:1px solid #ccc;padding-bottom:5px}.amount-row{background:#f9f9f9;padding:15px;margin:20px 0;border-radius:4px}.amount-row .receipt-label{font-size:18px;color:#333}.amount-row .receipt-value{font-size:24px;font-weight:bold;color:#8B4513;border:none}.receipt-footer{border-top:2px solid #333;padding-top:20px;margin-top:30px}.temple-info{font-size:14px;color:#666;line-height:1.8}.stamp-area{display:flex;justify-content:space-between;margin-top:40px}.stamp-box{width:120px;height:120px;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:14px}.signature-line{width:200px;text-align:center}.signature-line .line{border-bottom:1px solid #333;height:60px}.signature-line .label{margin-top:5px;color:#666}@media print{.receipt{page-break-after:always;border-width:2px;margin:0}.receipt:last-child{page-break-after:auto}}</style></head><body>${receiptsHtml}</body></html>`)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
    setSelectedItems([])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-temple-gold">收據管理</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg hover:text-white text-sm">
            <History size={16} /> 歷史紀錄
          </button>
          <button onClick={printBatchReceipts} disabled={selectedItems.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-temple-gold text-admin-dark rounded-lg hover:bg-temple-gold-light text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed">
            <Printer size={16} /> 批次列印 ({selectedItems.length})
          </button>
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => { setReceiptType('lighting'); setSelectedItems([]) }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${receiptType === 'lighting' ? 'bg-temple-gold text-admin-dark' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
          點燈收據 ({paidLightings.length})
        </button>
        <button onClick={() => { setReceiptType('pilgrimage'); setSelectedItems([]) }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${receiptType === 'pilgrimage' ? 'bg-temple-gold text-admin-dark' : 'bg-admin-dark-lighter text-gray-300 hover:text-white'}`}>
          進香收據 ({confirmedPilgrimages.length})
        </button>
      </div>

      {/* Receipt History */}
      {showHistory && (
        <div className="mb-6 bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">已開立收據紀錄（最近 20 筆）</h3>
          {receiptHistory.length > 0 ? (
            <div className="space-y-2">
              {receiptHistory.slice(0, 20).map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-admin-dark rounded-lg px-4 py-2 text-sm">
                  <span className="text-gray-400 font-mono">{r.number}</span>
                  <span className="text-gray-300">{r.payerName}</span>
                  <span className="text-gray-400">{r.itemName}</span>
                  <span className="text-temple-gold font-medium">NT$ {r.amount?.toLocaleString()}</span>
                  <span className="text-gray-500 text-xs">{r.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">尚無開立紀錄</p>
          )}
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={currentItems.length > 0 && selectedItems.length === currentItems.length} onChange={selectAll} className="rounded" />
            全選
          </label>
        </div>

        {currentItems.length > 0 ? currentItems.map(item => (
          <div key={item.id} className="flex items-center gap-4 bg-admin-dark-light border border-admin-dark-lighter rounded-xl px-4 py-3 hover:border-temple-gold/20 transition-colors">
            <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleSelect(item.id)} className="rounded" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-gray-200 font-medium">
                  {receiptType === 'lighting' ? item.members.map(m => m.name).join('、') : item.templeName}
                </span>
                <span className="px-2 py-0.5 bg-admin-dark rounded text-xs text-gray-400">
                  {receiptType === 'lighting' ? (lightTypeNames[item.lightType] || item.lightName) : `${item.peopleCount} 人`}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <span>{formatDate(item.createdAt)}</span>
                {receiptType === 'lighting' && <span className="text-temple-gold">NT$ {item.totalAmount.toLocaleString()}</span>}
              </div>
            </div>
            <button onClick={() => openReceiptPreview(item)}
              className="flex items-center gap-2 px-3 py-1.5 bg-temple-gold/10 text-temple-gold rounded-lg hover:bg-temple-gold/20 text-sm transition-colors">
              <FileText size={14} /> 開立收據
            </button>
          </div>
        )) : (
          <div className="text-center py-12 text-gray-500">
            {receiptType === 'lighting' ? '暫無已繳費的點燈登記' : '暫無已確認的進香團'}
          </div>
        )}
      </div>

      {/* Receipt Preview Modal */}
      <AdminModal isOpen={showPreview} onClose={() => setShowPreview(false)} title="收據預覽" size="sm"
        footer={<>
          <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm">取消</button>
          <button onClick={printReceipt} className="flex items-center gap-2 px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light">
            <Printer size={14} /> 列印收據
          </button>
        </>}>
        {receiptData && (
          <div className="bg-admin-dark rounded-xl p-6 border border-admin-dark-lighter">
            <div className="text-center border-b border-admin-dark-lighter pb-4 mb-4">
              <h3 className="text-lg font-bold text-temple-gold">白河三官寶殿</h3>
              <p className="text-gray-400">收 據</p>
            </div>
            <div className="text-sm text-right text-gray-500 mb-4">收據編號：{receiptData.number}</div>
            <div className="space-y-3 text-sm">
              <div className="flex"><span className="w-24 text-gray-500">日期：</span><span className="text-gray-200">{receiptData.date}</span></div>
              <div className="flex"><span className="w-24 text-gray-500">信眾姓名：</span><span className="text-gray-200">{receiptData.payerName}</span></div>
              <div className="flex"><span className="w-24 text-gray-500">服務項目：</span><span className="text-gray-200">{receiptData.itemName}</span></div>
              <div className="flex"><span className="w-24 text-gray-500">說明：</span><span className="text-gray-200">{receiptData.description}</span></div>
              <div className="flex items-center bg-admin-dark-lighter rounded-lg p-3 mt-4">
                <span className="w-24 text-gray-400 font-medium">金額：</span>
                <span className="text-xl font-bold text-temple-gold">NT$ {receiptData.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  )
}

export default ReceiptsPage
