import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import TeamLogin from './pages/TeamLogin'
import AdminLogin from './pages/AdminLogin'
import TeamDashboard from './pages/TeamDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ResultsEditor from './pages/admin/ResultsEditor'
import Leaderboard from './pages/admin/Leaderboard'
import WinnerPage from './pages/admin/WinnerPage'
import TeamManagement from './pages/admin/TeamManagement'
import SystemReset from './pages/admin/SystemReset'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Routes location={location}>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<TeamLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/winner" element={<WinnerPage />} />

          {/* Team protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute><TeamDashboard /></ProtectedRoute>
          } />

          {/* Admin protected */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/results" element={
            <ProtectedRoute adminOnly><ResultsEditor /></ProtectedRoute>
          } />
          <Route path="/admin/teams" element={
            <ProtectedRoute adminOnly><TeamManagement onBack={() => window.history.back()} /></ProtectedRoute>
          } />
          <Route path="/admin/reset" element={
            <ProtectedRoute adminOnly><SystemReset onBack={() => window.history.back()} /></ProtectedRoute>
          } />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
