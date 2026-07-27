import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { Button, Card, Input, Label } from '../../components/ui.jsx'

export default function Tarjetas() {
  const [tarjetas, setTarjetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setTarjetas(await api.get('/api/tarjetas'))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleEmitir(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/api/tarjetas/emitir', { ...form, email: form.email || null, walletTipo: 'web' })
      setForm({ nombre: '', telefono: '', email: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function sumarSello(id) {
    await api.post(`/api/tarjetas/${id}/sello`)
    await load()
  }

  async function canjear(id) {
    try {
      await api.post(`/api/tarjetas/${id}/canjear`)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Tarjetas</h1>

      <Card>
        <h2 className="mb-3 text-lg font-medium">Emitir tarjeta nueva</h2>
        <form onSubmit={handleEmitir} className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Nombre</Label>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} required />
          </div>
          <div>
            <Label>Email (opcional)</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-3">{error}</p>}
          <Button type="submit" disabled={saving} className="sm:col-span-3">
            {saving ? 'Emitiendo...' : 'Emitir tarjeta'}
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        {tarjetas.length === 0 && <p className="text-sm text-muted-foreground">Todavía no emitiste tarjetas.</p>}
        {tarjetas.map((t) => (
          <Card key={t.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">
                {t.clienteNombre} · {t.clienteTelefono}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.sellosActuales} / {t.sellosRequeridos} sellos · {t.premiosCanjeados} premios canjeados
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => sumarSello(t.id)}>
                + Sello
              </Button>
              <Button variant="outline" onClick={() => canjear(t.id)}>
                Canjear premio
              </Button>
              <Link to={`/wallet/${t.codigoQr}`} target="_blank">
                <Button variant="ghost">Ver wallet</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
