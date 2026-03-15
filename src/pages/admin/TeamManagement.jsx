import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../../lib/db'
import NavBar from '../../components/NavBar'
import Spinner from '../../components/Spinner'
import Toast from '../../components/Toast'
import ConfirmModal from '../../components/ConfirmModal'
import EmptyState from '../../components/EmptyState'
import SectionLabel from '../../components/SectionLabel'

const SWATCHES = ['#00F5FF', '#FF6B6B', '#FFD93D', '#6BCB77', '#A78BFA', '#F472B6', '#FB923C', '#34D399']

const EMPTY_FORM = { name: '', password: '', currency: 1000, color: '#00F5FF' }

export default function TeamManagement({ onBack }) {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  // Add form
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [adding, setAdding] = useState(false)

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Toast
  const [toast, setToast] = useState(null)

  const showToast = (msg, color = '#00F5FF') => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    const { data } = await db.getTeams()
    setTeams(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const validate = () => {
    if (!form.name.trim()) return 'Team name is required.'
    if (!form.password.trim()) return 'Password is required.'
    if (!form.currency || Number(form.currency) <= 0) return 'Starting currency must be a positive number.'
    const exists = teams.some((t) => t.team_name.toLowerCase() === form.name.trim().toLowerCase())
    if (exists) return `A team named "${form.name.trim()}" already exists.`
    return null
  }

  const handleAdd = async () => {
    const err = validate()
    if (err) return setFormError(err)
    setFormError('')
    setAdding(true)

    const { data, error } = await db.addTeam(form.name.trim(), form.password.trim(), Number(form.currency), form.color)
    setAdding(false)

    if (error) {
      setFormError('Failed to add team: ' + error.message)
    } else {
      showToast(`✓ Team ${data.team_name} added!`, '#34D399')
      setForm(EMPTY_FORM)
      setShowForm(false)
      load()
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await db.deleteTeam(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)

    if (error) {
      showToast('Delete failed: ' + error.message, '#FF6B6B')
    } else {
      showToast(`🗑 ${deleteTarget.team_name} deleted.`, '#FCD34D')
      load()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner label="Loading teams…" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-purple-400 border border-purple-500/30 rounded-full px-3 py-1">
              Admin
            </span>
            <h1 className="text-3xl font-bold text-white mt-2">Team Management</h1>
            <p className="text-sm text-slate-500 mt-1">Add, view, and delete teams</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => { setShowForm((v) => !v); setFormError('') }}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                showForm
                  ? 'border-green-500/50 text-green-400 bg-green-500/10'
                  : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
              }`}
            >
              ➕ Add Team
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              ← Back
            </button>
          </div>
        </motion.div>

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-cyan-500/30 bg-white/[0.03] p-6 flex flex-col gap-4 shadow-lg shadow-cyan-500/5"
            >
              <p className="text-sm font-semibold text-slate-200">New Team</p>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px] gap-3">
                <input
                  type="text"
                  placeholder="Team Name *"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <input
                  type="text"
                  placeholder="Password / Access Code *"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <input
                  type="number"
                  min={1}
                  placeholder="Starting Currency"
                  value={form.currency}
                  onChange={(e) => setField('currency', e.target.value)}
                  className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              {/* Color swatches */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 mr-1">Color:</span>
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setField('color', c)}
                    style={{ backgroundColor: c, boxShadow: form.color === c ? `0 0 0 2px #050A14, 0 0 0 4px ${c}` : 'none' }}
                    className="w-6 h-6 rounded-full transition-all duration-150 shrink-0"
                    title={c}
                  />
                ))}
              </div>

              {/* Live preview */}
              {form.name && (
                <p className="text-sm text-slate-500">
                  <span style={{ color: form.color }}>●</span>
                  {' '}
                  <span style={{ color: form.color }} className="font-semibold">{form.name}</span>
                  {' · Password: '}
                  <span className="font-mono text-slate-400">{form.password || '—'}</span>
                  {' · '}
                  <span className="text-cyan-400">{form.currency}</span>
                  {' 🪙'}
                </p>
              )}

              {formError && <p className="text-xs text-red-400">{formError}</p>}

              <button
                onClick={handleAdd}
                disabled={adding}
                className="self-start px-6 py-2.5 rounded-xl bg-cyan-400 text-[#050A14] font-semibold text-sm hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding…' : 'Add Team'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Teams table */}
        <div className="flex flex-col gap-3">
          <SectionLabel>All Teams ({teams.length})</SectionLabel>

          {teams.length === 0 ? (
            <EmptyState icon="👥" text="No teams yet. Add your first team above." />
          ) : (
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_1fr_100px_80px] gap-0 px-4 py-2.5 bg-cyan-500/5 border-b border-white/10 text-xs font-semibold uppercase tracking-widest text-cyan-600">
                <span>Team Name</span>
                <span>Login ID</span>
                <span>Password</span>
                <span>Balance</span>
                <span></span>
              </div>

              {teams.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className={`grid grid-cols-[1fr_1fr_1fr_100px_80px] gap-0 px-4 py-3 items-center text-sm ${
                    i < teams.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color ?? '#00F5FF' }} />
                    <span className="font-bold truncate" style={{ color: t.color ?? '#00F5FF' }}>{t.team_name}</span>
                  </div>
                  <span className="font-mono text-slate-500 text-xs truncate">{t.team_name}</span>
                  <span className="font-mono text-slate-500 text-xs truncate">{t.password}</span>
                  <span className="text-cyan-400 font-semibold">{t.currency_balance} 🪙</span>
                  <button
                    onClick={() => setDeleteTarget(t)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    🗑 Delete
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm delete modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.team_name}"?`}
        message="This will permanently delete the team and all their purchases. This cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete Team'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} color={toast.color} />}
      </AnimatePresence>
    </div>
  )
}
