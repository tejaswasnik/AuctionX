import { motion } from 'framer-motion'

export default function Toast({ msg, color = '#00F5FF' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.25 }}
      style={{ borderLeft: `4px solid ${color}` }}
      className="fixed top-4 right-4 z-50 bg-slate-900 text-slate-100 px-4 py-3 rounded-lg shadow-xl text-sm max-w-xs"
    >
      {msg}
    </motion.div>
  )
}
