import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const features = [
  { icon: '💰', title: 'Virtual Currency',  desc: 'Each team starts with equal coins to bid on resources' },
  { icon: '⚡', title: 'Live Auction',       desc: 'Admin assigns items in real time during the event' },
  { icon: '📊', title: 'Leaderboard',        desc: 'Dramatic ranked reveal with animated standings' },
  { icon: '🏆', title: 'Winner Stage',       desc: 'Celebratory winner announcement with confetti' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
})

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">

      {/* Badge */}
      <motion.span
        {...fadeUp(0)}
        className="mb-6 inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-cyan-500/40 text-cyan-400"
      >
        Live Auction Platform
      </motion.span>

      {/* Heading */}
      <motion.h1 {...fadeUp(0.1)} className="text-5xl sm:text-7xl font-bold leading-tight mb-3">
        <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Bid. Win.
        </span>
      </motion.h1>
      <motion.h1 {...fadeUp(0.18)} className="text-5xl sm:text-7xl font-bold leading-tight mb-6 text-white">
        Build Something Epic.
      </motion.h1>

      {/* Subtitle */}
      <motion.p {...fadeUp(0.26)} className="text-slate-400 text-lg max-w-md mb-10">
        A real-time hackathon auction where teams spend virtual currency to unlock tools, APIs, and advantages.
      </motion.p>

      {/* Buttons */}
      <motion.div {...fadeUp(0.34)} className="flex flex-wrap gap-4 justify-center mb-16">
        <button
          onClick={() => navigate('/login')}
          className="px-7 py-3 rounded-xl font-semibold text-sm bg-cyan-400 text-[#050A14] hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20"
        >
          Enter as Team
        </button>
        <button
          onClick={() => navigate('/admin/login')}
          className="px-7 py-3 rounded-xl font-semibold text-sm border border-purple-400/50 text-purple-300 hover:bg-purple-400/10 transition-colors"
        >
          Organizer Login
        </button>
      </motion.div>

      {/* Feature grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl w-full"
      >
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left hover:border-cyan-500/30 transition-colors"
          >
            <div className="text-2xl mb-3">{f.icon}</div>
            <p className="text-sm font-semibold text-slate-100 mb-1">{f.title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
