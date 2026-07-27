import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function ProtectedRoute({ role, children }) {
  const { auth } = useAuth()

  if (!auth) return <Navigate to={role === 'Admin' ? '/admin/login' : '/empresa/login'} replace />
  if (role && auth.role !== role) return <Navigate to="/" replace />

  return children
}
