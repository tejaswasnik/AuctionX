import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { loggedTeam, isAdmin } = useAuth()

  if (adminOnly) {
    return isAdmin ? children : <Navigate to="/admin/login" replace />
  }

  return loggedTeam ? children : <Navigate to="/login" replace />
}
