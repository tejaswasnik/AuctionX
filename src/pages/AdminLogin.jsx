import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { loginAdmin } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (username === 'admin' && password === 'admin123') {
      loginAdmin()
      navigate('/admin')
    } else {
      setError('Invalid admin credentials.')
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
        <button
          onClick={() => navigate('/')}
          className="self-start text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Back
        </button>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold tracking-widest uppercase text-purple-400 border border-purple-500/30 rounded-full px-3 py-1 self-start">
            Organizer Access
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">Admin Dashboard</h2>
          <p className="text-sm text-slate-400">Organizer credentials required.</p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full py-2.5 rounded-xl bg-purple-500 text-white font-semibold text-sm hover:bg-purple-400 transition-colors"
        >
          Login
        </button>
      </motion.div>
    </div>
  )
}
