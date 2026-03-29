import { Search } from 'lucide-react'

function FilterBar({ filters, activeFilter, onFilterChange, searchValue, onSearchChange, searchPlaceholder = '搜尋...', children }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Filters */}
      {filters && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter.value
                  ? 'bg-temple-gold text-admin-dark'
                  : 'bg-admin-dark-lighter text-gray-300 hover:bg-admin-dark hover:text-white'
              }`}
            >
              {filter.label}
              {filter.count !== undefined && (
                <span className="ml-1.5 text-xs opacity-75">({filter.count})</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Search */}
      {onSearchChange && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-admin-dark border border-admin-dark-lighter rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-temple-gold/50"
          />
        </div>
      )}

      {/* Extra children */}
      {children}
    </div>
  )
}

export default FilterBar
