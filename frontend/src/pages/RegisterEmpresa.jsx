import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Button, Card, Input, Label } from '../components/ui.jsx'

export default function RegisterEmpresa() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/api/auth/empresa/register', { ...form, telefono: form.telefono || null })
      login(response)
      navigate('/empresa')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-semibold">Registrar empresa</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre del negocio</Label>
            <Input id="nombre" value={form.nombre} onChange={(e) => update('nombre', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input id="telefono" value={form.telefono} onChange={(e) => update('telefono', e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{' '}
          <Link to="/empresa/login" className="underline">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  )
}
