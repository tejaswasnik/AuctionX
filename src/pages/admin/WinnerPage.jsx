import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { db } from '../../lib/db'
import Confetti from '../../components/Confetti'
import NavBar from '../../components/NavBar'
import Spinner from '../../components/Spinner'

export default function WinnerPage() {
  const navigate = useNavigate()
  const [winner, setWinner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)

  useEffect(() => {
    db.getResults().then(({ data }) => {
      const w = data?.find((r) => r.rank === 1) ?? null
      setWinner(w)
      setLoading(false)
      if (w) setTimeout(() => setShow(true), 300)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner label="Loading…" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {show && winner && <Confetti />}

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Back
        </button>

        {/* No winner */}
        {!winner && (
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <span className="text-5xl">🔒</span>
            <p className="text-base">Winner hasn't been declared yet.</p>
            <button
              onClick={() => navigate(-1)}
              className="text-xs px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Go Back
            </button>
          </div>
        )}

        {/* Winner reveal */}
        {winner && show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="flex flex-col items-center gap-5 text-center max-w-lg w-full"
          >
            {/* Trophy */}
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-7xl"
            >
              🏆
            </motion.span>

            {/* Badge */}
            <span className="text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-amber-400/50 text-amber-300 bg-amber-400/10">
              Hackathon Champion
            </span>

            {/* Team name */}
            <h1
              className="text-5xl sm:text-6xl font-extrabold leading-tight"
              style={{
                color: winner.teams?.color ?? '#FCD34D',
                textShadow: `0 0 40px ${winner.teams?.color ?? '#FCD34D'}88`,
              }}
            >
              {winner.teams?.team_name}
            </h1>

            {/* Project name */}
            <p className="text-xl font-semibold text-amber-300">{winner.project_name}</p>

            {/* Score */}
            <p className="text-5xl font-black text-amber-400">
              {winner.score}
              <span className="text-lg font-normal text-amber-600 ml-1">pts</span>
            </p>

            {/* Description */}
            {winner.project_desc && (
              <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400 leading-relaxed">
                {winner.project_desc}
              </div>
            )}

            {/* Leaderboard link */}
            <button
              onClick={() => navigate('/leaderboard')}
              className="mt-2 px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:border-white/25 hover:text-white text-sm transition-colors"
            >
              View Full Leaderboard →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
