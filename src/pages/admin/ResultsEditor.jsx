import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../../lib/db'
import NavBar from '../../components/NavBar'
import Spinner from '../../components/Spinner'
import Toast from '../../components/Toast'

export default function ResultsEditor() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [rows, setRows] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, color = '#00F5FF') => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    const [{ data: teamsData }, { data: resultsData }] = await Promise.all([
      db.getTeams(),
      db.getResults(),
    ])

    if (teamsData) {
      setTeams(teamsData)
      const initial = {}
      teamsData.forEach((t) => {
        const existing = resultsData?.find((r) => r.team_id === t.id)
        initial[t.id] = {
          rank:        existing?.rank        ?? '',
          score:       existing?.score       ?? '',
          projectName: existing?.project_name ?? '',
          projectDesc: existing?.project_desc ?? '',
        }
      })
      setRows(initial)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const update = (teamId, field, value) =>
    setRows((prev) => ({ ...prev, [teamId]: { ...prev[teamId], [field]: value } }))

  const handleSave = async () => {
    setSaving(true)
    const toSave = teams.filter((t) => {
      const r = rows[t.id]
      return r?.rank !== '' && r?.score !== '' && r?.projectName.trim() !== ''
    })

    const results = await Promise.all(
      toSave.map((t) => {
        const r = rows[t.id]
        return db.upsertResult(t.id, Number(r.rank), Number(r.score), r.projectName.trim(), r.projectDesc.trim())
      })
    )

    setSaving(false)
    const failed = results.find((res) => res.error)
    if (failed) {
      showToast('Error saving results: ' + failed.error.message, '#FF6B6B')
    } else {
      showToast(`✅ Results saved! (${toSave.length} teams)`, '#34D399')
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

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">Update Results</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 text-[#050A14] font-semibold text-sm hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : '💾 Save All Results'}
          </button>
        </motion.div>

        {/* Rows */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-3"
        >
          {/* Column labels */}
          <div className="hidden sm:grid grid-cols-[160px_80px_100px_1fr_1fr] gap-3 px-4 text-xs text-slate-600 uppercase tracking-widest">
            <span>Team</span>
            <span>Rank</span>
            <span>Score</span>
            <span>Project Name</span>
            <span>Description</span>
          </div>

          {teams.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="grid grid-cols-1 sm:grid-cols-[160px_80px_100px_1fr_1fr] gap-3 items-center rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="font-semibold text-sm truncate" style={{ color: t.color ?? '#00F5FF' }}>
                {t.team_name}
              </p>
              <input
                type="number"
                min={1}
                placeholder="Rank"
                value={rows[t.id]?.rank ?? ''}
                onChange={(e) => update(t.id, 'rank', e.target.value)}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors w-full"
              />
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder="Score"
                value={rows[t.id]?.score ?? ''}
                onChange={(e) => update(t.id, 'score', e.target.value)}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors w-full"
              />
              <input
                type="text"
                placeholder="Project name *"
                value={rows[t.id]?.projectName ?? ''}
                onChange={(e) => update(t.id, 'projectName', e.target.value)}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors w-full"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={rows[t.id]?.projectDesc ?? ''}
                onChange={(e) => update(t.id, 'projectDesc', e.target.value)}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors w-full"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Save button (bottom) */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-cyan-400 text-[#050A14] font-semibold text-sm hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : '💾 Save All Results'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} color={toast.color} />}
      </AnimatePresence>
    </div>
  )
}
