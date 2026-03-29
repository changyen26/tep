import { statusLabels, statusColors } from '../../utils/adminUtils'

function StatusBadge({ status, label }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {label || statusLabels[status] || status}
    </span>
  )
}

export default StatusBadge
