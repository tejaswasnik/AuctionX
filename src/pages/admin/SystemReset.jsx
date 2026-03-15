import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../../lib/db'
import NavBar from '../../components/NavBar'
import ConfirmModal from '../../components/ConfirmModal'
import Toast from '../../components/Toast'

const ACTIONS = [
  {
    id: 'leaderboard',
    icon: '📋',
    color: '#A78BFA',
    title: 'Clear Leaderboard',
    description: 'Deletes all result entries. Teams, purchases, and balances are untouched.',
    buttonLabel: 'Clear Leaderboard',
    modal: {
      title: 'Clear Leaderboard?',
      message: 'All results and rankings will be deleted. This cannot be undone.',
      confirmLabel: 'Yes, Clear',
    },
    toast: { msg: '✓ Leaderboard cleared.', color: '#A78BFA' },
  },
  {
    id: 'reset',
    icon: '🔄',
    color: '#FCD34D',
    title: 'Reset Auction',
    description: "Deletes all purchases, clears the leaderboard, and resets every team's balance back to 1000. Teams and items are kept.",
    buttonLabel: 'Reset Auction',
    modal: {
      title: 'Reset Auction?',
      message: 'All purchases will be deleted, balances reset to 1000, and leaderboard cleared. Teams stay. Cannot be undone.',
      confirmLabel: 'Yes, Reset',
    },
    toast: { msg: '✓ Auction reset. Teams and items kept.', color: '#FCD34D' },
  },
  {
    id: 'nuke',
    icon: '🔥',
    color: '#FF6B6B',
    title: 'Full Nuclear Reset',
    description: 'Deletes EVERYTHING — purchases, leaderboard, and all teams. The database will be completely empty.',
    buttonLabel: 'Nuke Everything',
    modal: {
      title: 'NUKE EVERYTHING?',
      message: 'This will permanently delete ALL teams, purchases, and results. The entire database will be wiped. This CANNOT be undone.',
      confirmLabel: 'Yes, Delete Everything',
    },
    toast: { msg: '🔥 Full reset done. All data cleared.', color: '#FF6B6B' },
  },
]

export default function SystemReset({ onBack }) {
  const [pending, setPending] = useState(null)   // action id awaiting confirm
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, color) => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 3000)
  }

  const handleConfirm = async () => {
    const action = ACTIONS.find((a) => a.id === pending)
    if (!action) return
    setPending(null)
    setBusy(true)

    try {
      if (action.id === 'leaderboard') await db.clearLeaderboard()
      else if (action.id === 'reset')  await db.resetAuction(false)
      else if (action.id === 'nuke')   await db.resetAuction(true)
      showToast(action.toast.msg, action.toast.color)
    } catch (e) {
      showToast('Error: ' + e.message, '#FF6B6B')
    }

    setBusy(false)
  }

  const activeAction = ACTIONS.find((a) => a.id === pending)

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
        >
          <div className="flex flex-col gap-2">
            <span
              className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full border self-start"
              style={{ color: '#FF6B6B', borderColor: 'rgba(255,107,107,0.4)', background: 'rgba(255,107,107,0.08)' }}
            >
              Danger Zone
            </span>
            <h1 className="text-3xl font-bold" style={{ color: '#FF6B6B' }}>System Reset</h1>
            <p className="text-sm text-slate-500">Irreversible actions — read each description carefully before proceeding.</p>
          </div>
          <button
            onClick={onBack}
            className="self-start px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 text-sm transition-colors shrink-0"
          >
            ← Back
          </button>
        </motion.div>

        {/* Action cards */}
        <div className="flex flex-col gap-4">
          {ACTIONS.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="rounded-2xl border p-5 flex items-center gap-5"
              style={{
                borderColor: `${action.color}40`,
                background: `${action.color}08`,
              }}
            >
              <span className="text-4xl shrink-0">{action.icon}</span>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-100 mb-1" style={{ color: action.color }}>
                  {action.title}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">{action.description}</p>
              </div>

              <button
                onClick={() => setPending(action.id)}
                disabled={busy}
                className="shrink-0 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: `${action.color}50`,
                  color: action.color,
                  background: `${action.color}12`,
                }}
              >
                {busy && pending === action.id ? 'Working…' : action.buttonLabel}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={!!pending}
        title={activeAction?.modal.title ?? ''}
        message={activeAction?.modal.message ?? ''}
        confirmLabel={activeAction?.modal.confirmLabel ?? 'Confirm'}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} color={toast.color} />}
      </AnimatePresence>
    </div>
  )
}
