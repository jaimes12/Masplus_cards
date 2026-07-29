import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Button, Card, Input, Label, Select } from '../components/ui.jsx'

const PAISES = [
  { codigo: '+52', bandera: '🇲🇽', nombre: 'México' },
  { codigo: '+1', bandera: '🇺🇸', nombre: 'Estados Unidos' },
  { codigo: '+57', bandera: '🇨🇴', nombre: 'Colombia' },
  { codigo: '+34', bandera: '🇪🇸', nombre: 'España' },
  { codigo: '+54', bandera: '🇦🇷', nombre: 'Argentina' },
]

export default function RegisterEmpresa() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: '',
    codigoPais: PAISES[0].codigo,
    telefono: '',
  })
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

    if (form.password !== form.confirmarPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const telefono = form.telefono.trim() ? `${form.codigoPais} ${form.telefono.trim()}` : null
      const response = await api.post('/api/auth/empresa/register', {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        telefono,
      })
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
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <div className="flex gap-2">
              <div className="w-28 shrink-0">
                <Select
                  value={form.codigoPais}
                  onChange={(e) => update('codigoPais', e.target.value)}
                  aria-label="País"
                >
                  {PAISES.map((p) => (
                    <option key={p.codigo} value={p.codigo}>
                      {p.bandera} {p.codigo}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="min-w-0 flex-1">
                <Input
                  id="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => update('telefono', e.target.value)}
                  placeholder="55 1234 5678"
                />
              </div>
            </div>
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
            <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
            <Input
              id="confirmarPassword"
              type="password"
              value={form.confirmarPassword}
              onChange={(e) => update('confirmarPassword', e.target.value)}
              required
              minLength={6}
            />
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
