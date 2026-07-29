import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { Button, Card, Input, Label, Select } from '../../components/ui.jsx'

const emptyForm = {
  codigo: '',
  tipoDescuento: 'porcentaje',
  valor: '',
  planId: '',
  usosMaximos: '',
  fechaExpiracion: '',
}

export default function DiscountCodes() {
  const [codigos, setCodigos] = useState([])
  const [planes, setPlanes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const [c, p] = await Promise.all([api.get('/api/admin/codigos-descuento'), api.get('/api/admin/planes')])
    setCodigos(c)
    setPlanes(p)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/api/admin/codigos-descuento', {
        codigo: form.codigo,
        tipoDescuento: form.tipoDescuento,
        valor: Number(form.valor),
        planId: form.planId ? Number(form.planId) : null,
        usosMaximos: form.usosMaximos ? Number(form.usosMaximos) : null,
        fechaExpiracion: form.fechaExpiracion || null,
      })
      setForm(emptyForm)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActivo(c) {
    await api.post(`/api/admin/codigos-descuento/${c.id}/${c.activo ? 'desactivar' : 'activar'}`)
    await load()
  }

  async function eliminar(c) {
    await api.delete(`/api/admin/codigos-descuento/${c.id}`)
    await load()
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Códigos de descuento</h1>

      <Card>
        <h2 className="mb-3 text-lg font-medium">Nuevo código</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Código</Label>
            <Input
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
              placeholder="Ej. VERANO20"
              required
            />
          </div>
          <div>
            <Label>Plan (opcional, si no aplica a todos)</Label>
            <Select value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })}>
              <option value="">Cualquier plan</option>
              {planes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Tipo de descuento</Label>
            <Select value={form.tipoDescuento} onChange={(e) => setForm({ ...form, tipoDescuento: e.target.value })}>
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto_fijo">Monto fijo (MXN)</option>
            </Select>
          </div>
          <div>
            <Label>{form.tipoDescuento === 'monto_fijo' ? 'Monto (MXN)' : 'Porcentaje (%)'}</Label>
            <Input
              type="number"
              min="1"
              max={form.tipoDescuento === 'porcentaje' ? '100' : undefined}
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Usos máximos (opcional)</Label>
            <Input
              type="number"
              min="1"
              value={form.usosMaximos}
              onChange={(e) => setForm({ ...form, usosMaximos: e.target.value })}
              placeholder="Ilimitados"
            />
          </div>
          <div>
            <Label>Vence el (opcional)</Label>
            <Input
              type="date"
              value={form.fechaExpiracion}
              onChange={(e) => setForm({ ...form, fechaExpiracion: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <Button type="submit" disabled={saving} className="sm:col-span-2">
            {saving ? 'Creando...' : 'Crear código'}
          </Button>
        </form>
      </Card>

      <div className="space-y-2">
        {codigos.length === 0 && <p className="text-sm text-muted-foreground">Todavía no creaste ningún código.</p>}
        {codigos.map((c) => (
          <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">
                {c.codigo}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  ({c.tipoDescuento === 'monto_fijo' ? `$${c.valor} MXN` : `${c.valor}%`}
                  {c.planNombre ? ` · ${c.planNombre}` : ' · cualquier plan'})
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {c.usosActuales} usado{c.usosActuales === 1 ? '' : 's'}
                {c.usosMaximos ? ` / ${c.usosMaximos}` : ' · sin límite'}
                {c.fechaExpiracion ? ` · vence ${new Date(c.fechaExpiracion).toLocaleDateString('es-MX')}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  c.activo ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {c.activo ? 'Activo' : 'Inactivo'}
              </span>
              <Button variant="outline" onClick={() => toggleActivo(c)}>
                {c.activo ? 'Desactivar' : 'Activar'}
              </Button>
              <Button variant="ghost" onClick={() => eliminar(c)}>
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
