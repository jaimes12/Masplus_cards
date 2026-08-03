import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Button, Input } from '../components/ui.jsx'
import AuthBackground from '../components/AuthBackground.jsx'
import masplusLogo from '../assets/masplus_logo_wide.png'

export default function LoginAdmin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/api/auth/admin/login', { email, password })
      login(response)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center p-4">
      <AuthBackground />
      <div className="theme-golden-hour w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-card-foreground shadow-2xl">
        <img src={masplusLogo} alt="MasPlus" className="mb-6 h-7 w-auto" />
        <h1 className="mb-6 text-2xl font-semibold">Ingresar como admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-muted-foreground">
              Email
            </label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-muted-foreground">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="rounded-lg bg-secondary px-3 py-2 text-sm text-accent">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
