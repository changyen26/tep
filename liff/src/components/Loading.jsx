function Loading({ message = '載入中...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
      <div className="w-8 h-8 border-2 border-gray-600 border-t-[var(--color-temple-gold)] rounded-full animate-spin mb-4" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

export default Loading
