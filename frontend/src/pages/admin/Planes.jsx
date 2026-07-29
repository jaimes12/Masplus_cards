import { useEffect, useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Button, Card, Input, Label } from '../../components/ui.jsx'

function toFormState(plan) {
  return {
    nombre: plan.nombre,
    descripcion: plan.descripcion || '',
    precioMensual: String(plan.precioMensual),
    limiteDisenos: plan.limiteDisenos == null ? '' : String(plan.limiteDisenos),
    limiteTarjetas: plan.limiteTarjetas == null ? '' : String(plan.limiteTarjetas),
    caracteristicas: plan.caracteristicas.join('\n'),
    destacado: plan.destacado,
    orden: String(plan.orden),
    activo: plan.activo,
  }
}

export default function Planes() {
  const [planes, setPlanes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    api
      .get('/api/admin/planes/todos')
      .then(setPlanes)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function editar(plan) {
    setEditingId(plan.id)
    setForm(toFormState(plan))
    setError('')
  }

  function cancelar() {
    setEditingId(null)
    setForm(null)
    setError('')
  }

  async function guardar(planId) {
    setSaving(true)
    setError('')
    try {
      await api.put(`/api/admin/planes/${planId}`, {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        precioMensual: Number(form.precioMensual),
        limiteDisenos: form.limiteDisenos === '' ? null : Number(form.limiteDisenos),
        limiteTarjetas: form.limiteTarjetas === '' ? null : Number(form.limiteTarjetas),
        caracteristicas: form.caracteristicas
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        destacado: form.destacado,
        orden: Number(form.orden),
        activo: form.activo,
      })
      cancelar()
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Planes</h1>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {planes.map((plan) => {
          const editando = editingId === plan.id
          return (
            <Card key={plan.id} className="flex flex-col">
              {editando ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Editando: {plan.nombre}</h3>
                    <button onClick={cancelar} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <Label>Nombre</Label>
                    <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Input
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Precio mensual (MXN)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.precioMensual}
                      onChange={(e) => setForm({ ...form, precioMensual: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Límite diseños</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Ilimitado"
                        value={form.limiteDisenos}
                        onChange={(e) => setForm({ ...form, limiteDisenos: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Límite tarjetas</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Ilimitado"
                        value={form.limiteTarjetas}
                        onChange={(e) => setForm({ ...form, limiteTarjetas: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Características (una por línea)</Label>
                    <textarea
                      className="border-input bg-background flex min-h-[110px] w-full rounded-xl border px-3 py-2 text-sm"
                      value={form.caracteristicas}
                      onChange={(e) => setForm({ ...form, caracteristicas: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Orden</Label>
                    <Input
                      type="number"
                      value={form.orden}
                      onChange={(e) => setForm({ ...form, orden: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.destacado}
                        onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                      />
                      Más popular
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.activo}
                        onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                      />
                      Activo (visible para empresas)
                    </label>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={cancelar} disabled={saving}>
                      Cancelar
                    </Button>
                    <Button className="flex-1" onClick={() => guardar(plan.id)} disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.nombre}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{plan.descripcion}</p>
                    </div>
                    <button
                      onClick={() => editar(plan)}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                      title="Editar plan"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-3 text-2xl font-semibold">
                    ${Math.round(Number(plan.precioMensual))}
                    <span className="text-sm font-normal text-muted-foreground"> MXN/mes</span>
                  </p>
                  <ul className="mt-3 flex-1 space-y-1 text-sm text-muted-foreground">
                    {plan.caracteristicas.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {plan.destacado && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                        Más popular
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        plan.activo ? 'bg-secondary text-foreground' : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {plan.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
