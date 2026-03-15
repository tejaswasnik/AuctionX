import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/db'
import useRealtime from '../hooks/useRealtime'
import NavBar from '../components/NavBar'
import AnimCounter from '../components/AnimCounter'
import ItemCard from '../components/ItemCard'
import Spinner from '../components/Spinner'

function fmt(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function TeamDashboard() {
  const { loggedTeam } = useAuth()
  const navigate = useNavigate()

  const [team, setTeam] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [newIds, setNewIds] = useState(new Set())
  const [lastSync, setLastSync] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [balancePulsed, setBalancePulsed] = useState(false)

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true)

    const [{ data: teamData }, { data: purchaseData }] = await Promise.all([
      db.getTeam(loggedTeam.id),
      db.getPurchases(loggedTeam.id),
    ])

    if (teamData) setTeam(teamData)
    if (purchaseData) setPurchases(purchaseData)
    setLastSync(new Date())
    setLoading(false)
    if (manual) setRefreshing(false)
  }, [loggedTeam.id])

  useEffect(() => { load() }, [load])

  // Realtime: purchases
  useRealtime(
    'purchases',
    `team_id=eq.${loggedTeam.id}`,
    useCallback(async (payload) => {
      await load()
      if (payload.eventType === 'INSERT') {
        const id = payload.new?.id
        if (id) {
          setNewIds((prev) => new Set([...prev, id]))
          setTimeout(() => {
            setNewIds((prev) => {
              const next = new Set(prev)
              next.delete(id)
              return next
            })
          }, 2000)
        }
      }
    }, [load])
  )

  // Realtime: team currency_balance
  useRealtime(
    'teams',
    `id=eq.${loggedTeam.id}`,
    useCallback((payload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        setTeam((prev) => ({ ...prev, ...payload.new }))
        setLastSync(new Date())
        setBalancePulsed(true)
        setTimeout(() => setBalancePulsed(false), 1200)
      }
    }, [])
  )

  // Group purchases by category
  const grouped = purchases.reduce((acc, p) => {
    const cat = p.items?.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner label="Loading dashboard…" />
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
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-400 border border-cyan-500/30 rounded-full px-3 py-1 self-start">
              Team Dashboard
            </span>
            <h1
              className="text-3xl font-bold mt-1"
              style={{ color: team?.color ?? '#00F5FF' }}
            >
              {team?.team_name}
            </h1>
            <p className="text-xs text-slate-500">
              Live auction status · auto-updates in real time · last sync {fmt(lastSync)}
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-slate-100 hover:border-white/25 text-xs transition-colors disabled:opacity-50"
            >
              <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }}>
                ↻
              </span>
              Refresh
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-slate-100 hover:border-white/25 text-xs transition-colors"
            >
              Leaderboard →
            </button>
          </div>
        </motion.div>

        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border p-6 flex items-center justify-between shadow-lg transition-all duration-500"
          style={{
            borderColor: balancePulsed ? '#00F5FF' : 'rgba(0,245,255,0.3)',
            boxShadow: balancePulsed ? '0 0 24px rgba(0,245,255,0.25)' : '0 8px 32px rgba(0,245,255,0.05)',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🪙</span>
            <div>
              <p className="text-xs text-slate-500 mb-1">Remaining Balance</p>
              <p className="text-4xl font-bold text-cyan-400">
                <AnimCounter value={team?.currency_balance ?? 0} />
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Items Acquired</p>
            <p
              className="text-4xl font-bold"
              style={{ color: team?.color ?? '#00F5FF' }}
            >
              {purchases.length}
            </p>
          </div>
        </motion.div>

        {/* Items section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          {purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600 gap-2">
              <span className="text-4xl">📦</span>
              <p className="text-sm">No items acquired yet. Stay tuned!</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {category}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((p) => (
                    <ItemCard
                      key={p.id}
                      item={p.items}
                      cost={p.cost}
                      isNew={newIds.has(p.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </motion.div>

      </div>
    </div>
  )
}
