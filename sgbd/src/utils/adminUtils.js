// 狀態文字對應
export const statusLabels = {
  pending: '待處理',
  confirmed: '已確認',
  paid: '已繳費',
  completed: '已完成',
  cancelled: '已取消',
  attended: '已出席',
  unread: '未讀',
  read: '已讀',
  replied: '已回覆',
  draft: '草稿',
  queued: '排隊中',
  sent: '已發送',
  failed: '發送失敗',
}

// 狀態顏色對應 (Tailwind classes)
export const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  paid: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  attended: 'bg-purple-100 text-purple-800',
  unread: 'bg-red-100 text-red-800',
  read: 'bg-gray-100 text-gray-800',
  replied: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-800',
  queued: 'bg-amber-100 text-amber-800',
  sent: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

// 點燈類型名稱
export const lightTypeNames = {
  guangming: '光明燈',
  taisui: '安太歲',
  wenchang: '文昌燈',
  caishen: '財神燈',
  yinyuan: '姻緣燈',
  qifu: '祈福燈',
}

// 日期格式化
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}

// 日期時間格式化
export const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// CSV 匯出
export const exportToCSV = (headers, rows, filename) => {
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
