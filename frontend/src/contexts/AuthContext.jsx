import { createContext, useCallback, useContext, useReducer } from 'react'
import { useLocation } from 'react-router-dom'
import { clearAuth, getAuth, setAuth as persistAuth } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const location = useLocation()
  const role = location.pathname.startsWith('/admin') ? 'Admin' : 'Empresa'
  // Fuerza un re-render tras login/logout (escribir en localStorage no dispara uno solo).
  const [, forceUpdate] = useReducer((n) => n + 1, 0)

  // Se recalcula en cada render a partir de localStorage — así login como Empresa y
  // login como Admin conviven sin pisarse, incluso en pestañas distintas del mismo navegador.
  const auth = getAuth(role)

  const login = useCallback((response) => {
    persistAuth(response)
    forceUpdate()
  }, [])

  const logout = useCallback(() => {
    clearAuth(role)
    forceUpdate()
  }, [role])

  return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
