import { useState, useMemo, useEffect } from 'react'
import { useData } from '../../contexts/DataContext'
import { lightTypeNames, statusLabels, statusColors, formatDateTime, exportToCSV } from '../../utils/adminUtils'
import { loadFromStorage, saveToStorage } from '../../utils/storage'
import StatusBadge from '../../components/admin/StatusBadge'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import FilterBar from '../../components/admin/FilterBar'
import { evaluateAutoTrigger } from '../../services/notificationService'
import {
  Printer,
  Download,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  CheckSquare,
  Square,
  MinusSquare,
  Flame,
  Plus,
  UserPlus,
  Pencil,
  FileText,
} from 'lucide-react'

function LightingsPage() {
  const { lightings, addLighting, updateLighting, updateLightingStatus, deleteLighting, siteContent,
    notificationRules, notificationTemplates, notificationSettings, addNotifications } = useData()

  // --- Filter / Search / Pagination state ---
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // --- Selection state (batch) ---
  const [selectedIds, setSelectedIds] = useState(new Set())

  // --- Modal / Dialog state ---
  const [selectedItem, setSelectedItem] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // id or 'batch'

  // --- Add/Edit registration state ---
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null) // null = add mode, object = edit mode
  const emptyMember = { id: 1, name: '', gender: 'male', birthYear: '', birthMonth: '', birthDay: '', isLunar: false, lightTypes: [] }
  const emptyForm = {
    confirmedMembers: [],
    currentMember: { ...emptyMember },
    phone: '',
    email: '',
    address: '',
    prayer: '',
  }
  const [formData, setFormData] = useState(emptyForm)
  const [editingMemberIndex, setEditingMemberIndex] = useState(null) // null = new, number = editing which confirmed member
  
  // --- Receipt state ---
  const [showReceiptPreview, setShowReceiptPreview] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  const [receiptHistory, setReceiptHistory] = useState([])

  useEffect(() => {
    setReceiptHistory(loadFromStorage('receipts', []))
  }, [])

  const generateReceiptNumber = () => {
    let counter = loadFromStorage('receipt_counter', 0)
    counter++
    saveToStorage('receipt_counter', counter)
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    return `SGBD-${dateStr}-${String(counter).padStart(4, '0')}`
  }

  const saveReceipt = (receipt) => {
    const updated = [{ ...receipt, createdAt: new Date().toISOString() }, ...receiptHistory]
    setReceiptHistory(updated)
    saveToStorage('receipts', updated)
  }

  const openReceiptPreview = (item) => {
    const receipt = {
      number: generateReceiptNumber(),
      date: new Date().toLocaleDateString('zh-TW'),
      itemName: lightTypeNames[item.lightType] || item.lightName,
      payerName: item.members.map(m => m.name).join('、'),
      amount: item.totalAmount,
      description: `${lightTypeNames[item.lightType] || item.lightName} ${item.members.length} 位`,
    }
    setReceiptData(receipt)
    setShowReceiptPreview(true)
  }

  const getReceiptHTML = (data) => `<!DOCTYPE html><html><head><title>收據 - ${data.number}</title>
    <style>
      @page{size:A5 landscape;margin:8mm}
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Microsoft JhengHei','Noto Sans TC',sans-serif;background:#fff}
      .receipt{width:100%;height:100%;border:2px double #333;padding:12px 16px;display:flex;flex-direction:column}
      .receipt-header{text-align:center;border-bottom:1.5px solid #333;padding-bottom:6px;margin-bottom:6px}
      .temple-name{font-size:18px;font-weight:bold;color:#8B4513;letter-spacing:6px}
      .receipt-title{font-size:15px;margin-top:3px;letter-spacing:4px}
      .receipt-number{text-align:right;color:#666;font-size:11px;margin-bottom:4px}
      .receipt-content{display:flex;gap:16px;flex:1}
      .receipt-left{flex:1}
      .receipt-right{width:200px;display:flex;flex-direction:column;justify-content:space-between}
      .receipt-row{display:flex;margin-bottom:7px;font-size:12px}
      .receipt-label{width:80px;color:#666;flex-shrink:0}
      .receipt-value{flex:1;border-bottom:1px solid #ccc;padding-bottom:2px}
      .amount-row{background:#f9f9f9;padding:8px;margin-top:8px;border-radius:3px}
      .amount-row .receipt-label{font-size:13px;color:#333}
      .amount-row .receipt-value{font-size:17px;font-weight:bold;color:#8B4513;border:none}
      .temple-info{font-size:10px;color:#666;line-height:1.6}
      .stamp-area{display:flex;flex-direction:column;align-items:center;gap:8px}
      .stamp-box{width:70px;height:70px;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:10px}
      .sig-row{display:flex;gap:12px}
      .signature-line{width:90px;text-align:center}
      .signature-line .line{border-bottom:1px solid #333;height:28px}
      .signature-line .label{margin-top:2px;color:#666;font-size:10px}
      @media print{body{padding:0;width:100%;height:100%}}
    </style></head>
    <body><div class="receipt">
    <div class="receipt-header"><div class="temple-name">白河三官寶殿</div><div class="receipt-title">收 據</div></div>
    <div class="receipt-number">收據編號：${data.number}</div>
    <div class="receipt-content">
      <div class="receipt-left">
        <div class="receipt-row"><span class="receipt-label">日期：</span><span class="receipt-value">${data.date}</span></div>
        <div class="receipt-row"><span class="receipt-label">信眾姓名：</span><span class="receipt-value">${data.payerName}</span></div>
        <div class="receipt-row"><span class="receipt-label">服務項目：</span><span class="receipt-value">${data.itemName}</span></div>
        <div class="receipt-row"><span class="receipt-label">項目說明：</span><span class="receipt-value">${data.description}</span></div>
        <div class="amount-row"><div class="receipt-row" style="margin:0"><span class="receipt-label">金額：</span><span class="receipt-value">新臺幣 ${data.amount.toLocaleString()} 元整</span></div></div>
        <div style="margin-top:8px" class="temple-info"><p>宮廟名稱：白河三官寶殿</p><p>地址：臺南市白河區外角里4鄰外角41號</p><p>電話：06-685-2428</p></div>
      </div>
      <div class="receipt-right">
        <div class="stamp-area"><div class="stamp-box">廟方印鑑</div></div>
        <div class="sig-row"><div class="signature-line"><div class="line"></div><div class="label">經手人</div></div><div class="signature-line"><div class="line"></div><div class="label">收款人</div></div></div>
      </div>
    </div>
    </div></body></html>`

  const printReceipt = () => {
    if (!receiptData) return
    saveReceipt(receiptData)
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)
    iframe.contentDocument.write(getReceiptHTML(receiptData))
    iframe.contentDocument.close()
    setTimeout(() => {
      iframe.contentWindow.print()
      setTimeout(() => document.body.removeChild(iframe), 1000)
    }, 250)
  }
  // ========== Filtering Logic ==========
  const filteredLightings = useMemo(() => {
    let result = [...lightings]

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((l) => l.status === statusFilter)
    }

    // Text search (name, phone, email)
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase()
      result = result.filter((l) => {
        const names = l.members.map((m) => m.name).join(' ').toLowerCase()
        const phone = (l.phone || '').toLowerCase()
        const email = (l.email || '').toLowerCase()
        return names.includes(q) || phone.includes(q) || email.includes(q)
      })
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      result = result.filter((l) => new Date(l.createdAt) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      result = result.filter((l) => new Date(l.createdAt) <= to)
    }

    return result
  }, [lightings, statusFilter, searchText, dateFrom, dateTo])

  // ========== Pagination ==========
  const totalPages = Math.max(1, Math.ceil(filteredLightings.length / perPage))
  const safePage = Math.min(currentPage, totalPages)

  const paginatedLightings = useMemo(() => {
    const start = (safePage - 1) * perPage
    return filteredLightings.slice(start, start + perPage)
  }, [filteredLightings, safePage, perPage])

  // Reset to page 1 when filters change
  const handleFilterChange = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
    setSelectedIds(new Set())
  }

  const handleSearchChange = (value) => {
    setSearchText(value)
    setCurrentPage(1)
    setSelectedIds(new Set())
  }

  // ========== Status counts ==========
  const counts = useMemo(() => ({
    all: lightings.length,
    pending: lightings.filter((l) => l.status === 'pending').length,
    confirmed: lightings.filter((l) => l.status === 'confirmed').length,
    paid: lightings.filter((l) => l.status === 'paid').length,
  }), [lightings])

  const filterButtons = [
    { value: 'all', label: '全部', count: counts.all },
    { value: 'pending', label: '待處理', count: counts.pending },
    { value: 'confirmed', label: '已確認', count: counts.confirmed },
    { value: 'paid', label: '已繳費', count: counts.paid },
  ]

  // ========== Selection helpers ==========
  const allOnPageSelected = paginatedLightings.length > 0 && paginatedLightings.every((l) => selectedIds.has(l.id))
  const someOnPageSelected = paginatedLightings.some((l) => selectedIds.has(l.id))

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        paginatedLightings.forEach((l) => next.delete(l.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        paginatedLightings.forEach((l) => next.add(l.id))
        return next
      })
    }
  }

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // ========== Status change ==========
  const handleStatusChange = (id, newStatus) => {
    updateLightingStatus(id, newStatus)
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, status: newStatus })
    }
    // Auto trigger notification
    if (notificationSettings?.autoEnabled) {
      const eventName = `lighting_status_${newStatus}`
      const sourceData = lightings.find(l => l.id === id)
      if (sourceData) {
        const drafts = evaluateAutoTrigger(eventName, 'lighting', id, sourceData, siteContent, notificationRules, notificationTemplates)
        if (drafts && drafts.length > 0) {
          addNotifications(drafts)
        }
      }
    }
  }

  const handleBatchStatusChange = (newStatus) => {
    selectedIds.forEach((id) => {
      updateLightingStatus(id, newStatus)
    })
    setSelectedIds(new Set())
  }

  // ========== Delete ==========
  const handleDeleteConfirmed = () => {
    if (confirmDelete === 'batch') {
      selectedIds.forEach((id) => deleteLighting(id))
      setSelectedIds(new Set())
    } else if (confirmDelete) {
      deleteLighting(confirmDelete)
      if (selectedItem && selectedItem.id === confirmDelete) {
        setSelectedItem(null)
      }
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(confirmDelete)
        return next
      })
    }
    setConfirmDelete(null)
  }

  // ========== Add/Edit Registration ==========
  const getUnitPrice = (lightType) => {
    const service = siteContent?.services?.find((s) => s.id === lightType)
    return service?.price || 0
  }

  // Collect all members (confirmed + current if has name) for total calc
  const allMembers = useMemo(() => {
    const list = [...formData.confirmedMembers]
    if (formData.currentMember.name.trim()) list.push(formData.currentMember)
    return list
  }, [formData.confirmedMembers, formData.currentMember])

  // Total = sum each member's selected lights
  const calcTotal = useMemo(() => {
    return allMembers.reduce((sum, m) => {
      return sum + (m.lightTypes || []).reduce((s, lt) => s + getUnitPrice(lt), 0)
    }, 0)
  }, [allMembers, siteContent])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setEditingMemberIndex(null)
    setFormData({ ...emptyForm, currentMember: { ...emptyMember } })
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setEditingMemberIndex(null)
    setFormData({
      confirmedMembers: item.members.map((m) => ({ ...m, lightTypes: m.lightTypes || [item.lightType] })),
      currentMember: { ...emptyMember, id: Date.now() },
      phone: item.phone || '',
      email: item.email || '',
      address: item.address || '',
      prayer: item.prayer || '',
    })
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingItem(null)
    setEditingMemberIndex(null)
  }

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleToggleCurrentLightType = (key) => {
    setFormData((prev) => {
      const types = prev.currentMember.lightTypes || []
      const exists = types.includes(key)
      return {
        ...prev,
        currentMember: {
          ...prev.currentMember,
          lightTypes: exists ? types.filter((t) => t !== key) : [...types, key],
        },
      }
    })
  }

  const handleCurrentMemberChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      currentMember: { ...prev.currentMember, [field]: value },
    }))
  }

  const handleEditConfirmedMember = (index) => {
    setEditingMemberIndex(index)
    setFormData((prev) => ({
      ...prev,
      currentMember: { ...prev.confirmedMembers[index] },
    }))
  }

  const handleCancelEditMember = () => {
    setEditingMemberIndex(null)
    setFormData((prev) => ({
      ...prev,
      currentMember: { ...emptyMember, id: Date.now() },
    }))
  }

  const handleConfirmMember = () => {
    if (!formData.currentMember.name.trim()) return alert('請填寫姓名')
    if (!formData.phone.trim()) return alert('請填寫聯絡電話')
    if ((formData.currentMember.lightTypes || []).length === 0) return alert('請選擇至少一種服務項目')

    if (editingMemberIndex !== null) {
      // Update existing confirmed member
      setFormData((prev) => ({
        ...prev,
        confirmedMembers: prev.confirmedMembers.map((m, i) =>
          i === editingMemberIndex ? { ...prev.currentMember, name: prev.currentMember.name.trim() } : m
        ),
        currentMember: { ...emptyMember, id: Date.now() },
      }))
      setEditingMemberIndex(null)
    } else {
      // Add new member
      setFormData((prev) => ({
        ...prev,
        confirmedMembers: [...prev.confirmedMembers, { ...prev.currentMember, name: prev.currentMember.name.trim() }],
        currentMember: { ...emptyMember, id: Date.now() },
      }))
    }
  }

  const handleRemoveConfirmedMember = (index) => {
    if (editingMemberIndex === index) {
      setEditingMemberIndex(null)
      setFormData((prev) => ({
        ...prev,
        confirmedMembers: prev.confirmedMembers.filter((_, i) => i !== index),
        currentMember: { ...emptyMember, id: Date.now() },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        confirmedMembers: prev.confirmedMembers.filter((_, i) => i !== index),
      }))
      if (editingMemberIndex !== null && editingMemberIndex > index) {
        setEditingMemberIndex((prev) => prev - 1)
      }
    }
  }

  const handleSaveForm = () => {
    // Include current member if it has a name
    let finalMembers = [...formData.confirmedMembers]
    if (formData.currentMember.name.trim()) {
      if ((formData.currentMember.lightTypes || []).length === 0) return alert('請為目前填寫的人員選擇至少一種服務項目')
      finalMembers.push({ ...formData.currentMember, name: formData.currentMember.name.trim() })
    }
    if (finalMembers.length === 0) return alert('請填寫至少一位點燈者姓名')
    if (!formData.phone.trim()) return alert('請填寫聯絡電話')

    // Build members with their lightTypes, calc total
    const members = finalMembers.map((m, i) => ({ ...m, id: i + 1 }))
    const totalAmount = members.reduce((sum, m) =>
      sum + (m.lightTypes || []).reduce((s, lt) => s + getUnitPrice(lt), 0), 0)

    // Collect all unique light types for summary display
    const allTypes = [...new Set(members.flatMap((m) => m.lightTypes || []))]
    const lightName = allTypes.map((lt) => lightTypeNames[lt]).join('、')

    const data = {
      lightType: allTypes[0] || '',
      lightName,
      members,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      prayer: formData.prayer.trim(),
      totalAmount,
    }

    if (editingItem) {
      updateLighting(editingItem.id, data)
      if (selectedItem && selectedItem.id === editingItem.id) {
        setSelectedItem({ ...selectedItem, ...data })
      }
    } else {
      addLighting(data)
    }
    setIsFormOpen(false)
    setEditingItem(null)
  }

  // ========== Export ==========
  const handleExportCSV = () => {
    const headers = ['登記日期', '服務項目', '點燈者', '聯絡電話', '電子信箱', '金額', '狀態']
    const rows = filteredLightings.map((item) => [
      formatDateTime(item.createdAt),
      lightTypeNames[item.lightType] || item.lightName,
      item.members.map((m) => m.name).join('、'),
      item.phone,
      item.email || '',
      item.totalAmount,
      statusLabels[item.status] || item.status,
    ])
    exportToCSV(headers, rows, '點燈登記')
  }

  // ========== Print ==========
  const handlePrint = () => {
    const grouped = filteredLightings.reduce((acc, item) => {
      const type = lightTypeNames[item.lightType] || item.lightName || '其他'
      if (!acc[type]) acc[type] = []
      acc[type].push(item)
      return acc
    }, {})

    const printContent = `
      <html>
        <head>
          <title>點燈名單</title>
          <style>
            body { font-family: 'Microsoft JhengHei', sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            h2 { color: #666; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f5f5f5; }
            .header { text-align: center; margin-bottom: 30px; }
            .date { text-align: right; color: #666; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>點燈名單</h1>
            <p class="date">列印日期：${new Date().toLocaleDateString('zh-TW')}</p>
          </div>
          ${Object.entries(grouped).map(([type, items]) => `
            <h2>${type} (${items.length}筆)</h2>
            <table>
              <thead>
                <tr>
                  <th>序號</th>
                  <th>姓名</th>
                  <th>生辰</th>
                  <th>聯絡電話</th>
                  <th>金額</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                ${items.flatMap((item, idx) =>
                  item.members.map((m, mIdx) => `
                    <tr>
                      <td>${idx + 1}${item.members.length > 1 ? '-' + (mIdx + 1) : ''}</td>
                      <td>${m.name}</td>
                      <td>${m.isLunar ? '農曆' : '國曆'} ${m.birthYear}/${m.birthMonth}/${m.birthDay}</td>
                      <td>${mIdx === 0 ? item.phone : ''}</td>
                      <td>${mIdx === 0 ? 'NT$ ' + item.totalAmount.toLocaleString() : ''}</td>
                      <td>${mIdx === 0 ? (statusLabels[item.status] || item.status) : ''}</td>
                    </tr>
                  `).join('')
                ).join('')}
              </tbody>
            </table>
          `).join('')}
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  // ========== Inline status dropdown options ==========
  const allStatuses = [
    { value: 'pending', label: '待處理' },
    { value: 'confirmed', label: '已確認' },
    { value: 'paid', label: '已繳費' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ]

  return (
    <div className="space-y-4">
      {/* ===== Page Header ===== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-temple-gold flex items-center gap-2">
          <Flame size={24} />
          點燈管理
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-admin-dark-lighter text-gray-200 hover:text-white hover:bg-admin-dark rounded-lg text-sm font-medium transition-colors"
          >
            <Printer size={16} />
            列印名單
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-admin-dark-lighter text-gray-200 hover:text-white hover:bg-admin-dark rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            匯出CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-temple-gold text-admin-dark hover:bg-temple-gold-light rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            新增登記
          </button>
        </div>
      </div>

      {/* ===== Filter Bar (status buttons + search) ===== */}
      <FilterBar
        filters={filterButtons}
        activeFilter={statusFilter}
        onFilterChange={handleFilterChange}
        searchValue={searchText}
        onSearchChange={handleSearchChange}
        searchPlaceholder="搜尋姓名、電話、信箱..."
      >
        {/* Date range filters */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500 shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1) }}
            className="px-3 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-sm text-gray-200 focus:outline-none focus:border-temple-gold/50"
          />
          <span className="text-gray-500 text-sm">至</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1) }}
            className="px-3 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-sm text-gray-200 focus:outline-none focus:border-temple-gold/50"
          />
        </div>
      </FilterBar>

      {/* ===== Batch Operations Bar ===== */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-temple-gold/10 border border-temple-gold/30 rounded-lg">
          <span className="text-sm text-temple-gold font-medium">
            已選取 {selectedIds.size} 筆
          </span>
          <div className="h-4 w-px bg-temple-gold/30" />
          <span className="text-xs text-gray-400">批次變更狀態：</span>
          {allStatuses.map((s) => (
            <button
              key={s.value}
              onClick={() => handleBatchStatusChange(s.value)}
              className="px-2.5 py-1 text-xs rounded-md bg-admin-dark-lighter text-gray-300 hover:bg-admin-dark hover:text-white transition-colors"
            >
              {s.label}
            </button>
          ))}
          <div className="h-4 w-px bg-temple-gold/30" />
          <button
            onClick={() => setConfirmDelete('batch')}
            className="px-2.5 py-1 text-xs rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60 hover:text-red-300 transition-colors"
          >
            批次刪除
          </button>
        </div>
      )}

      {/* ===== Data Table ===== */}
      <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-dark-lighter">
                <th className="px-4 py-3 text-left">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-temple-gold transition-colors">
                    {allOnPageSelected
                      ? <CheckSquare size={18} />
                      : someOnPageSelected
                        ? <MinusSquare size={18} />
                        : <Square size={18} />
                    }
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">登記日期</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">服務項目</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">點燈者</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">聯絡電話</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">金額</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">狀態</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-dark-lighter">
              {paginatedLightings.length > 0 ? (
                paginatedLightings.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-admin-dark/50 ${selectedIds.has(item.id) ? 'bg-temple-gold/5' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelectOne(item.id)}
                        className="text-gray-400 hover:text-temple-gold transition-colors"
                      >
                        {selectedIds.has(item.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {formatDateTime(item.createdAt)}
                    </td>

                    {/* Light type */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-temple-gold/10 text-temple-gold text-xs font-medium">
                        {item.lightName || lightTypeNames[item.lightType]}
                      </span>
                    </td>

                    {/* Members */}
                    <td className="px-4 py-3">
                      <span className="text-gray-200">
                        {item.members.map((m) => m.name).join('、')}
                      </span>
                      <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-admin-dark-lighter text-gray-400">
                        {item.members.length}人
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {item.phone}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right text-gray-200 font-medium whitespace-nowrap">
                      NT$ {item.totalAmount.toLocaleString()}
                    </td>

                    {/* Inline Status Dropdown */}
                    <td className="px-4 py-3 text-center">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-temple-gold/50 ${statusColors[item.status] || 'bg-gray-100 text-gray-800'}`}
                      >
                        {allStatuses.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>

                      {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {['paid', 'completed'].includes(item.status) && (
                          <button
                            onClick={() => openReceiptPreview(item)}
                            className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
                            title="開立收據"
                          >
                            <FileText size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 text-gray-400 hover:text-temple-gold hover:bg-admin-dark-lighter rounded-lg transition-colors"
                          title="查看詳情"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="編輯"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="刪除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Flame size={32} className="opacity-30" />
                      <span>暫無符合條件的資料</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ===== Pagination Footer ===== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-admin-dark-lighter">
          {/* Per page selector */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>每頁顯示</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1) }}
              className="bg-admin-dark border border-admin-dark-lighter rounded-md px-2 py-1 text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>筆</span>
            <span className="ml-2 text-gray-500">
              共 {filteredLightings.length} 筆
            </span>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-admin-dark-lighter disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-admin-dark-lighter disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 py-1 text-sm text-gray-300">
              {safePage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-admin-dark-lighter disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-admin-dark-lighter disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Detail Modal ===== */}
      <AdminModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="點燈詳情"
        size="md"
        footer={
          <div className="flex w-full justify-between items-center">
            <div>
              {selectedItem && ['paid', 'completed'].includes(selectedItem.status) && (
                <button
                  onClick={() => openReceiptPreview(selectedItem)}
                  className="px-4 py-2 text-green-400 hover:text-white bg-green-900/30 hover:bg-green-600 rounded-lg transition-colors text-sm font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <FileText size={14} />
                    開立收據
                  </span>
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(selectedItem?.id)}
                className="px-4 py-2 text-red-400 hover:text-white bg-red-900/30 hover:bg-red-600 rounded-lg transition-colors text-sm font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <Trash2 size={14} />
                  刪除
                </span>
              </button>
              <button
                onClick={() => { setSelectedItem(null); handleOpenEdit(selectedItem) }}
                className="px-4 py-2 text-blue-400 hover:text-white bg-blue-900/30 hover:bg-blue-600 rounded-lg transition-colors text-sm font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <Pencil size={14} />
                  編輯
                </span>
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-gray-300 hover:text-white bg-admin-dark-lighter hover:bg-admin-dark rounded-lg transition-colors text-sm font-medium"
              >
                關閉
              </button>
            </div>
          </div>
        }
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Service Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">服務資訊</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500 mb-1">服務項目</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-temple-gold/10 text-temple-gold text-sm font-medium">
                    {selectedItem.lightName || lightTypeNames[selectedItem.lightType]}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">金額</span>
                  <span className="text-lg font-semibold text-temple-gold">
                    NT$ {selectedItem.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">登記時間</span>
                  <span className="text-gray-200">{formatDateTime(selectedItem.createdAt)}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">目前狀態</span>
                  <StatusBadge status={selectedItem.status} />
                </div>
              </div>
            </div>

            {/* Members Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                點燈者資料 ({selectedItem.members.length}人)
              </h3>
              <div className="space-y-2">
                {selectedItem.members.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-admin-dark rounded-lg"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-temple-gold/20 text-temple-gold text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">
                        {member.gender === 'male' ? '男' : member.gender === 'female' ? '女' : ''}
                        {' / '}
                        {member.isLunar ? '農曆' : '國曆'} {member.birthYear}年{member.birthMonth}月{member.birthDay}日
                      </p>
                      {member.lightTypes && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.lightTypes.map((lt) => (
                            <span key={lt} className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-temple-gold/10 text-temple-gold">
                              {lightTypeNames[lt]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">聯絡資訊</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500 mb-1">聯絡電話</span>
                  <span className="text-gray-200">{selectedItem.phone}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">電子信箱</span>
                  <span className="text-gray-200">{selectedItem.email || '-'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-xs text-gray-500 mb-1">通訊地址</span>
                  <span className="text-gray-200">{selectedItem.address || '-'}</span>
                </div>
                {selectedItem.prayer && (
                  <div className="sm:col-span-2">
                    <span className="block text-xs text-gray-500 mb-1">祈願內容</span>
                    <span className="text-gray-200">{selectedItem.prayer}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Change Buttons */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">更改狀態</h3>
              <div className="flex flex-wrap gap-2">
                {allStatuses.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleStatusChange(selectedItem.id, s.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedItem.status === s.value
                        ? 'bg-temple-gold text-admin-dark'
                        : 'bg-admin-dark-lighter text-gray-300 hover:bg-admin-dark hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* ===== Add/Edit Registration Modal ===== */}
      <AdminModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingItem ? '編輯點燈登記' : '新增點燈登記'}
        size="lg"
        footer={
          <>
            <button
              onClick={handleCloseForm}
              className="px-4 py-2 text-gray-300 hover:text-white bg-admin-dark-lighter hover:bg-admin-dark rounded-lg transition-colors text-sm font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSaveForm}
              className="px-4 py-2 bg-temple-gold text-admin-dark hover:bg-temple-gold-light rounded-lg transition-colors text-sm font-medium"
            >
              {editingItem ? '儲存變更' : '儲存登記'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* 1. Confirmed members summary */}
          {formData.confirmedMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                已登記 ({formData.confirmedMembers.length}人)
              </label>
              <div className="space-y-2">
                {formData.confirmedMembers.map((m, index) => (
                  <div
                    key={m.id}
                    onClick={() => handleEditConfirmedMember(index)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      editingMemberIndex === index
                        ? 'bg-temple-gold/10 border border-temple-gold/30'
                        : 'bg-admin-dark hover:bg-admin-dark-lighter'
                    }`}
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-temple-gold/20 text-temple-gold text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 font-medium text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500">
                        {m.gender === 'male' ? '男' : '女'}
                        {m.birthYear && ` / ${m.isLunar ? '農曆' : '國曆'} ${m.birthYear}年${m.birthMonth}月${m.birthDay}日`}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(m.lightTypes || []).map((lt) => (
                          <span key={lt} className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-temple-gold/10 text-temple-gold">
                            {lightTypeNames[lt]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveConfirmedMember(index) }}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="移除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Current member input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                {editingMemberIndex !== null
                  ? `編輯第 ${editingMemberIndex + 1} 位`
                  : formData.confirmedMembers.length > 0
                    ? '新增下一位'
                    : '點燈者資料'}
              </label>
              {editingMemberIndex !== null && (
                <button
                  onClick={handleCancelEditMember}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  取消編輯
                </button>
              )}
            </div>
            <div className="p-3 bg-admin-dark rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">姓名 *</label>
                  <input
                    type="text"
                    value={formData.currentMember.name}
                    onChange={(e) => handleCurrentMemberChange('name', e.target.value)}
                    placeholder="請輸入姓名"
                    className="w-full px-3 py-2 bg-admin-dark-light border border-admin-dark-lighter rounded-lg text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50 placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">性別</label>
                  <select
                    value={formData.currentMember.gender}
                    onChange={(e) => handleCurrentMemberChange('gender', e.target.value)}
                    className="w-full px-3 py-2 bg-admin-dark-light border border-admin-dark-lighter rounded-lg text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50"
                  >
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">出生年</label>
                  <input
                    type="text"
                    value={formData.currentMember.birthYear}
                    onChange={(e) => handleCurrentMemberChange('birthYear', e.target.value)}
                    placeholder="例：1990"
                    className="w-full px-3 py-2 bg-admin-dark-light border border-admin-dark-lighter rounded-lg text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50 placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">月</label>
                  <input
                    type="text"
                    value={formData.currentMember.birthMonth}
                    onChange={(e) => handleCurrentMemberChange('birthMonth', e.target.value)}
                    placeholder="1-12"
                    className="w-full px-3 py-2 bg-admin-dark-light border border-admin-dark-lighter rounded-lg text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50 placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">日</label>
                  <input
                    type="text"
                    value={formData.currentMember.birthDay}
                    onChange={(e) => handleCurrentMemberChange('birthDay', e.target.value)}
                    placeholder="1-31"
                    className="w-full px-3 py-2 bg-admin-dark-light border border-admin-dark-lighter rounded-lg text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50 placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">曆法</label>
                  <select
                    value={formData.currentMember.isLunar ? 'lunar' : 'solar'}
                    onChange={(e) => handleCurrentMemberChange('isLunar', e.target.value === 'lunar')}
                    className="w-full px-3 py-2 bg-admin-dark-light border border-admin-dark-lighter rounded-lg text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50"
                  >
                    <option value="solar">國曆</option>
                    <option value="lunar">農曆</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Contact Info */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">聯絡資訊</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">聯絡電話 *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  placeholder="例：0912-345-678"
                  className="w-full px-3 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50 placeholder-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">電子信箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="選填"
                  className="w-full px-3 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50 placeholder-gray-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">通訊地址</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  placeholder="選填"
                  className="w-full px-3 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50 placeholder-gray-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">祈願內容</label>
                <textarea
                  value={formData.prayer}
                  onChange={(e) => handleFormChange('prayer', e.target.value)}
                  placeholder="選填"
                  rows={2}
                  className="w-full px-3 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-gray-200 text-sm focus:outline-none focus:border-temple-gold/50 placeholder-gray-600 resize-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Light Type - per-member card selection (multi-select) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              選擇服務項目<span className="text-xs text-gray-500 ml-2">（可多選）</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(lightTypeNames).map(([key, name]) => {
                const service = siteContent?.services?.find((s) => s.id === key)
                const isSelected = (formData.currentMember.lightTypes || []).includes(key)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleToggleCurrentLightType(key)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-temple-gold bg-temple-gold/10'
                        : 'border-admin-dark-lighter bg-admin-dark hover:border-gray-500'
                    }`}
                  >
                    <div className={`text-sm font-medium ${isSelected ? 'text-temple-gold' : 'text-gray-200'}`}>
                      {name}
                    </div>
                    {service && (
                      <div className={`text-xs mt-1 ${isSelected ? 'text-temple-gold/70' : 'text-gray-500'}`}>
                        NT$ {service.price} / {service.unit}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 5. Total Amount */}
          {calcTotal > 0 && (
            <div className="p-4 bg-temple-gold/10 border border-temple-gold/20 rounded-lg space-y-2">
              {allMembers.map((m, i) => (
                <div key={m.id || i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">
                    {m.name || '(填寫中)'} — {(m.lightTypes || []).map((lt) => lightTypeNames[lt]).join('、')}
                  </span>
                  <span className="text-gray-200">
                    NT$ {(m.lightTypes || []).reduce((s, lt) => s + getUnitPrice(lt), 0).toLocaleString()}
                  </span>
                </div>
              ))}
              {allMembers.length > 1 && (
                <div className="border-t border-temple-gold/20 pt-2 mt-2" />
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">合計</span>
                <span className="text-lg font-bold text-temple-gold">
                  NT$ {calcTotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* 6. Confirm current member / add next */}
          <button
            onClick={handleConfirmMember}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 border-2 border-dashed border-admin-dark-lighter text-gray-400 hover:text-temple-gold hover:border-temple-gold/40 rounded-lg transition-colors text-sm"
          >
            {editingMemberIndex !== null ? (
              <>
                <Pencil size={16} />
                更新此位資料
              </>
            ) : (
              <>
                <UserPlus size={16} />
                確認此筆，繼續登記下一位
              </>
            )}
          </button>
        </div>
      </AdminModal>

      {/* ===== Confirm Delete Dialog ===== */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirmed}
        title="確認刪除"
        message={
          confirmDelete === 'batch'
            ? `確定要刪除已選取的 ${selectedIds.size} 筆點燈資料嗎？此操作無法復原。`
            : '確定要刪除此筆點燈資料嗎？此操作無法復原。'
        }
        confirmText="確定刪除"
        cancelText="取消"
        variant="danger"
      />

      {/* Receipt Report Viewer */}
      <AdminModal isOpen={showReceiptPreview} onClose={() => setShowReceiptPreview(false)} title="報表瀏覽器 — 收據預覽" size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-gray-500">
              {receiptData && `收據編號：${receiptData.number}　｜　A5 橫式 (210 × 148 mm)`}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setShowReceiptPreview(false)} className="px-4 py-2 bg-admin-dark-lighter text-gray-300 rounded-lg text-sm hover:bg-admin-dark transition-colors">
                關閉
              </button>
              <button onClick={printReceipt} className="flex items-center gap-2 px-4 py-2 bg-temple-gold text-admin-dark rounded-lg text-sm font-medium hover:bg-temple-gold-light transition-colors">
                <Printer size={14} /> 列印收據
              </button>
            </div>
          </div>
        }>
        {receiptData && (
          <div className="flex flex-col items-center bg-gray-600/20 rounded-lg p-4">
            {/* A5 landscape paper preview (210:148 ratio) */}
            <div className="bg-white rounded shadow-lg" style={{ width: '595px', height: '420px', padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div className="text-center border-b-2 border-gray-800 pb-1.5 mb-1.5">
                <p className="text-lg font-bold tracking-[6px]" style={{ color: '#8B4513' }}>白河三官寶殿</p>
                <p className="text-[15px] mt-0.5 tracking-[4px] text-gray-800">收 據</p>
              </div>
              <p className="text-right text-[11px] text-gray-500 mb-1">收據編號：{receiptData.number}</p>
              {/* Two-column content */}
              <div className="flex gap-4 flex-1">
                {/* Left: data fields */}
                <div className="flex-1 space-y-1.5 text-[12px] text-gray-700">
                  <div className="flex">
                    <span className="w-[80px] text-gray-500 shrink-0">日期：</span>
                    <span className="flex-1 border-b border-gray-300 pb-0.5">{receiptData.date}</span>
                  </div>
                  <div className="flex">
                    <span className="w-[80px] text-gray-500 shrink-0">信眾姓名：</span>
                    <span className="flex-1 border-b border-gray-300 pb-0.5">{receiptData.payerName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-[80px] text-gray-500 shrink-0">服務項目：</span>
                    <span className="flex-1 border-b border-gray-300 pb-0.5">{receiptData.itemName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-[80px] text-gray-500 shrink-0">項目說明：</span>
                    <span className="flex-1 border-b border-gray-300 pb-0.5">{receiptData.description}</span>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded p-2 mt-2">
                    <span className="w-[80px] text-gray-700 font-medium text-[13px] shrink-0">金額：</span>
                    <span className="text-[17px] font-bold" style={{ color: '#8B4513' }}>
                      新臺幣 {receiptData.amount.toLocaleString()} 元整
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 leading-relaxed mt-2">
                    <p>宮廟名稱：白河三官寶殿</p>
                    <p>地址：臺南市白河區外角里4鄰外角41號</p>
                    <p>電話：06-685-2428</p>
                  </div>
                </div>
                {/* Right: stamp & signatures */}
                <div className="w-[180px] flex flex-col items-center justify-between py-1">
                  <div className="w-[70px] h-[70px] border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-300">
                    廟方印鑑
                  </div>
                  <div className="flex gap-3">
                    <div className="w-[80px] text-center">
                      <div className="border-b border-gray-800 h-7" />
                      <p className="mt-0.5 text-[10px] text-gray-500">經手人</p>
                    </div>
                    <div className="w-[80px] text-center">
                      <div className="border-b border-gray-800 h-7" />
                      <p className="mt-0.5 text-[10px] text-gray-500">收款人</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  )
}

export default LightingsPage
