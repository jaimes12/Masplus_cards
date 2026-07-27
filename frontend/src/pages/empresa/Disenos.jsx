import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button, Card, Input, Label, Select } from '../../components/ui.jsx'
import CardPreview from '../../components/CardPreview.jsx'
import ImageUploadInput from '../../components/ImageUploadInput.jsx'

const emptyForm = {
  templateId: '',
  nombre: '',
  logo: '',
  iconoSello: '',
  colorPrimario: '#18181B',
  colorSecundario: '#F4F4F5',
  colorTexto: '#FFFFFF',
  sellosRequeridos: 10,
  descripcion: '',
}

export default function Disenos() {
  const { auth } = useAuth()
  const [templates, setTemplates] = useState([])
  const [disenos, setDisenos] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const [t, d] = await Promise.all([api.get('/api/templates'), api.get('/api/disenos')])
    setTemplates(t)
    setDisenos(d)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/api/disenos', {
        templateId: form.templateId ? Number(form.templateId) : null,
        nombre: form.nombre,
        logo: form.logo || null,
        colorPrimario: form.colorPrimario,
        colorSecundario: form.colorSecundario,
        colorTexto: form.colorTexto,
        iconoSello: form.iconoSello || null,
        sellosRequeridos: Number(form.sellosRequeridos),
        descripcion: form.descripcion || null,
        configuracion: null,
      })
      setForm(emptyForm)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function activar(id) {
    await api.post(`/api/disenos/${id}/activar`)
    await load()
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Diseños</h1>

      <div>
        <h2 className="mb-3 text-lg font-medium">Tus diseños</h2>
        {disenos.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no creaste ningún diseño.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {disenos.map((d) => (
            <Card key={d.id} className={d.esActivoDeEmpresa ? 'border-primary' : ''}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{d.nombre}</p>
                  <p className="text-sm text-muted-foreground">{d.sellosRequeridos} sellos para el premio</p>
                </div>
                <div
                  className="h-8 w-8 shrink-0 rounded-full border border-border"
                  style={{ background: d.colorPrimario || '#18181B' }}
                />
              </div>
              {d.esActivoDeEmpresa ? (
                <span className="mt-3 inline-block rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  Activo
                </span>
              ) : (
                <Button variant="outline" className="mt-3" onClick={() => activar(d.id)}>
                  Activar
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Crear nuevo diseño</h2>
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <Card>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Template base (opcional)</Label>
                <Select value={form.templateId} onChange={(e) => update('templateId', e.target.value)}>
                  <option value="">Ninguno (desde cero)</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Nombre</Label>
                <Input value={form.nombre} onChange={(e) => update('nombre', e.target.value)} required />
              </div>
              <div>
                <Label>Logo</Label>
                <ImageUploadInput value={form.logo} onChange={(url) => update('logo', url)} />
              </div>
              <div>
                <Label>Ícono del sello (opcional)</Label>
                <ImageUploadInput value={form.iconoSello} onChange={(url) => update('iconoSello', url)} />
              </div>
              <div>
                <Label>Sellos requeridos</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.sellosRequeridos}
                  onChange={(e) => update('sellosRequeridos', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Color primario</Label>
                <Input type="color" value={form.colorPrimario} onChange={(e) => update('colorPrimario', e.target.value)} />
              </div>
              <div>
                <Label>Color secundario</Label>
                <Input
                  type="color"
                  value={form.colorSecundario}
                  onChange={(e) => update('colorSecundario', e.target.value)}
                />
              </div>
              <div>
                <Label>Color de texto</Label>
                <Input type="color" value={form.colorTexto} onChange={(e) => update('colorTexto', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Descripción / premio</Label>
                <Input
                  value={form.descripcion}
                  onChange={(e) => update('descripcion', e.target.value)}
                  placeholder="Ej. Café gratis"
                />
              </div>
              {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
              <Button type="submit" disabled={saving} className="sm:col-span-2">
                {saving ? 'Guardando...' : 'Crear diseño'}
              </Button>
            </form>
          </Card>

          <div className="flex flex-col items-center gap-2 lg:sticky lg:top-4 lg:self-start">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Vista previa</p>
            <CardPreview
              empresaNombre={auth?.nombre}
              logo={form.logo}
              iconoSello={form.iconoSello}
              colorPrimario={form.colorPrimario}
              colorTexto={form.colorTexto}
              sellosRequeridos={form.sellosRequeridos}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
