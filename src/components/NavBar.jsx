import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { loggedTeam, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 border-b border-cyan-500/30 backdrop-blur-md bg-[#050A14]/80">
      <Link to="/" className="text-lg font-bold text-cyan-400 tracking-tight">
        ⚡ AuctionX
      </Link>

      <div className="flex items-center gap-3">
        {(loggedTeam || isAdmin) && (
          <>
            <span className="text-sm text-slate-300">
              {isAdmin ? 'Admin' : loggedTeam?.team_name}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-slate-100 hover:border-white/25 transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
