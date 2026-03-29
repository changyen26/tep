import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

function ConfirmDialog({ isOpen, onClose, onConfirm, title = '確認操作', message = '確定要執行此操作嗎？', confirmText = '確定', cancelText = '取消', variant = 'danger' }) {
  const variants = {
    danger: 'bg-red-600 hover:bg-red-500',
    warning: 'bg-amber-600 hover:bg-amber-500',
    info: 'bg-blue-600 hover:bg-blue-500',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-admin-dark-light border border-admin-dark-lighter rounded-xl shadow-2xl max-w-sm w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white bg-admin-dark-lighter hover:bg-admin-dark rounded-lg transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => { onConfirm(); onClose() }}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${variants[variant]}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmDialog
