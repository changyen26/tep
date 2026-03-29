import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'

function AdminTable({ columns, data, emptyMessage = '暫無資料', pagination = true, defaultPageSize = 10 }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const handleSort = (key) => {
    if (!key) return
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  let sortedData = [...data]
  if (sortKey) {
    sortedData.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  const totalPages = pagination ? Math.ceil(sortedData.length / pageSize) : 1
  const paginatedData = pagination ? sortedData.slice(page * pageSize, (page + 1) * pageSize) : sortedData

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-admin-dark-lighter">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-admin-dark-light border-b border-admin-dark-lighter">
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-temple-gold select-none' : ''} ${col.className || ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-dark-lighter">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="bg-admin-dark hover:bg-admin-dark-light transition-colors">
                  {columns.map((col) => (
                    <td key={col.key || col.label} className={`px-4 py-3 text-gray-300 ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <Inbox size={40} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-500">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && data.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span>每頁</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
              className="bg-admin-dark-lighter border border-admin-dark-lighter rounded px-2 py-1 text-gray-300"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>筆，共 {data.length} 筆</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-admin-dark-lighter disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3">{page + 1} / {totalPages || 1}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded hover:bg-admin-dark-lighter disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTable
