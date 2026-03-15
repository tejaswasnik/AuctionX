import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [loggedTeam, setLoggedTeam] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const login = (team) => setLoggedTeam(team)
  const loginAdmin = () => setIsAdmin(true)
  const logout = () => {
    setLoggedTeam(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ loggedTeam, isAdmin, login, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
