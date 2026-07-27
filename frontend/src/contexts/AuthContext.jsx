import { createContext, useCallback, useContext, useState } from 'react'
import { clearAuth, getAuth, setAuth as persistAuth } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuthState] = useState(() => getAuth())

  const login = useCallback((response) => {
    persistAuth(response)
    setAuthState(response)
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setAuthState(null)
  }, [])

  return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
