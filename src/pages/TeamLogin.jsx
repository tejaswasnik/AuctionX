import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { db } from '../lib/db'
import { useAuth } from '../context/AuthContext'

export default function TeamLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !password.trim()) return
    setLoading(true)
    setError('')

    const { data, error: err } = await db.loginTeam(name.trim(), password)

    setLoading(false)
    if (err || !data) {
      setError('Team not found or wrong access code.')
    } else {
      login(data)
      navigate('/dashboard')
    }
  }

  const onKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex flex-col gap-5"
      >
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="self-start text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Back
        </button>

        {/* Badge + heading */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold tracking-widest uppercase text-cyan-400 border border-cyan-500/30 rounded-full px-3 py-1 self-start">
            Team Login
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">Enter the Arena</h2>
          <p className="text-sm text-slate-400">
            Use the team name and access code given by your organizer.
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Team Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <input
            type="password"
            placeholder="Access Code"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Error */}
        {error && <p className="text-xs text-red-400">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-cyan-400 text-[#050A14] font-semibold text-sm hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking…' : 'Join Auction'}
        </button>

        <p className="text-center text-xs text-slate-600">Credentials provided by your organizer</p>
      </motion.div>
    </div>
  )
}
