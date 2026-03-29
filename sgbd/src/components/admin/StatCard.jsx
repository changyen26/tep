import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, subtitle, link, color = 'text-temple-gold' }) {
  const content = (
    <div className="bg-admin-dark-light border border-admin-dark-lighter rounded-xl p-5 hover:border-temple-gold/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-admin-dark rounded-lg flex items-center justify-center">
          {Icon && <Icon size={24} className={color} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-sm text-gray-400">{label}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
        </div>
      </div>
    </div>
  )

  if (link) {
    return <Link to={link} className="block">{content}</Link>
  }
  return content
}

export default StatCard
