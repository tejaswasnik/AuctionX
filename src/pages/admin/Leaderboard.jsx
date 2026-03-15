import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../../lib/db'
import { useAuth } from '../../context/AuthContext'
import NavBar from '../../components/NavBar'
import Spinner from '../../components/Spinner'

const RANK_EMOJI = ['🥇', '🥈', '🥉']
const getRankEmoji = (rank) => RANK_EMOJI[rank - 1] ?? `#${rank}`

export default function Leaderboard() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [revealCount, setRevealCount] = useState(0)

  useEffect(() => {
    db.getResults().then(({ data }) => {
      if (data && data.length > 0) {
        // sort worst-to-best for reveal (highest rank number first)
        const sorted = [...data].sort((a, b) => b.rank - a.rank)
        setResults(sorted)
      }
      setLoading(false)
    })
  }, [])

  // Reveal one card every 800ms
  useEffect(() => {
    if (results.length === 0) return
    if (revealCount >= results.length) return

    const timer = setTimeout(() => setRevealCount((c) => c + 1), 800)
    return () => clearTimeout(timer)
  }, [results, revealCount])

  // After all revealed, sort best-to-worst (rank 1 at top)
  const allRevealed = revealCount >= results.length
  const displayed = allRevealed
    ? [...results].sort((a, b) => a.rank - b.rank)
    : results.slice(0, revealCount)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner label="Loading results…" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          </div>
          {isAdmin && (
            <button
              onClick={() => navigate('/winner')}
              className="px-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 text-xs transition-colors"
            >
              🏆 Declare Winner
            </button>
          )}
        </div>

        {/* Empty state */}
        {results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-600">
            <span className="text-4xl">📋</span>
            <p className="text-sm">Results haven't been published yet.</p>
          </div>
        )}

        {/* Cards */}
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {displayed.map((r) => {
              const isFirst = r.rank === 1
              return (
                <motion.div
                  key={r.team_id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className={`rounded-2xl border p-5 flex items-center justify-between gap-4 ${
                    isFirst
                      ? 'border-amber-400/50 bg-amber-400/5 shadow-lg shadow-amber-500/10'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={isFirst ? 'text-4xl' : 'text-2xl'}>
                      {getRankEmoji(r.rank)}
                    </span>
                    <div>
                      <p
                        className={`font-bold ${isFirst ? 'text-xl' : 'text-base'}`}
                        style={{ color: r.teams?.color ?? '#00F5FF' }}
                      >
                        {r.teams?.team_name}
                      </p>
                      <p className={`text-slate-400 ${isFirst ? 'text-sm' : 'text-xs'}`}>
                        {r.project_name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`font-bold ${isFirst ? 'text-2xl text-amber-300' : 'text-lg text-cyan-400'}`}>
                      {r.score}
                    </p>
                    <p className="text-xs text-slate-600">pts</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Revealing indicator */}
        {results.length > 0 && !allRevealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-sm text-slate-500 py-4"
          >
            <span
              style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}
            >
              ↻
            </span>
            Revealing next…
          </motion.div>
        )}
      </div>
    </div>
  )
}
