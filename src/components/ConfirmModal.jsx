import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = true,
  onConfirm,
  onCancel,
}) {
  const borderColor = danger ? 'rgba(255,107,107,0.3)' : 'rgba(0,245,255,0.2)'
  const titleColor  = danger ? '#FF6B6B' : '#00F5FF'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.93, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[440px] rounded-2xl bg-[#0d1117] p-8 flex flex-col items-center gap-4"
            style={{ border: `1px solid ${borderColor}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: 32 }}>⚠️</span>

            <h3
              className="text-lg font-bold text-center"
              style={{ color: titleColor }}
            >
              {title}
            </h3>

            <p className="text-sm text-slate-400 text-center leading-relaxed">
              {message}
            </p>

            <div className="flex gap-3 mt-2">
              <button
                onClick={onCancel}
                className="px-5 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={
                  danger
                    ? { background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', color: '#FF6B6B' }
                    : { background: 'rgba(0,245,255,0.15)', border: '1px solid rgba(0,245,255,0.4)', color: '#00F5FF' }
                }
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
