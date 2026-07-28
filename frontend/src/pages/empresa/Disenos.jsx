import { useEffect, useState } from 'react'
import { Award, Check, Ticket } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button, Card, Input, Label, Select } from '../../components/ui.jsx'
import CardPreview from '../../components/CardPreview.jsx'
import ImageUploadInput from '../../components/ImageUploadInput.jsx'

const TIPO_LABEL = { sellos: 'Sellos', cupon: 'Promoción' }

function MiniCardPreview({ diseno, empresaNombre }) {
  return (
    <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
      <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ transform: 'scale(0.3)', width: 320 }}>
        <CardPreview
          empresaNombre={empresaNombre}
          tipo={diseno.tipo}
          logo={diseno.logo}
          iconoSello={diseno.iconoSello}
          fondoUrl={diseno.fondoUrl}
          colorPrimario={diseno.colorPrimario}
          colorTexto={diseno.colorTexto}
          sellosRequeridos={diseno.sellosRequeridos}
          vencimiento={diseno.vencimiento}
          descripcion={diseno.descripcion}
        />
      </div>
    </div>
  )
}

const emptyForm = {
  templateId: '',
  tipo: 'sellos',
  nombre: '',
  logo: '',
  iconoSello: '',
  fondoUrl: '',
  colorPrimario: '#18181B',
  colorSecundario: '#F4F4F5',
  colorTexto: '#FFFFFF',
  sellosRequeridos: 10,
  vencimiento: '',
  descripcion: '',
}

export default function Disenos() {
  const { auth } = useAuth()
  const [templates, setTemplates] = useState([])
  const [disenos, setDisenos] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
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

  function selectTemplate(templateId) {
    const template = templates.find((t) => String(t.id) === templateId)
    setForm((f) => ({
      ...f,
      templateId,
      tipo: template ? template.tipoRecompensa : f.tipo,
    }))
  }

  function startEdit(diseno) {
    setEditingId(diseno.id)
    setForm({
      templateId: diseno.templateId ? String(diseno.templateId) : '',
      tipo: diseno.tipo || 'sellos',
      nombre: diseno.nombre || '',
      logo: diseno.logo || '',
      iconoSello: diseno.iconoSello || '',
      fondoUrl: diseno.fondoUrl || '',
      colorPrimario: diseno.colorPrimario || '#18181B',
      colorSecundario: diseno.colorSecundario || '#F4F4F5',
      colorTexto: diseno.colorTexto || '#FFFFFF',
      sellosRequeridos: diseno.sellosRequeridos,
      vencimiento: diseno.vencimiento ? diseno.vencimiento.slice(0, 10) : '',
      descripcion: diseno.descripcion || '',
    })
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        templateId: form.templateId ? Number(form.templateId) : null,
        tipo: form.tipo,
        nombre: form.nombre,
        logo: form.logo || null,
        colorPrimario: form.colorPrimario,
        colorSecundario: form.colorSecundario,
        colorTexto: form.colorTexto,
        iconoSello: form.iconoSello || null,
        fondoUrl: form.fondoUrl || null,
        sellosRequeridos: Number(form.sellosRequeridos),
        vencimiento: form.tipo === 'cupon' && form.vencimiento ? form.vencimiento : null,
        descripcion: form.descripcion || null,
        configuracion: null,
      }

      if (editingId) {
        await api.put(`/api/disenos/${editingId}`, payload)
      } else {
        await api.post('/api/disenos', payload)
      }

      setEditingId(null)
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
              <div className="flex items-start gap-4">
                <MiniCardPreview diseno={d} empresaNombre={auth?.nombre} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {d.nombre}{' '}
                    <span className="text-xs font-normal text-muted-foreground">({TIPO_LABEL[d.tipo] || 'Sellos'})</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {d.tipo === 'cupon'
                      ? d.vencimiento
                        ? `Vence ${new Date(d.vencimiento).toLocaleDateString('es-MX')}`
                        : 'Sin vencimiento'
                      : `${d.sellosRequeridos} sellos para el premio`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {d.tarjetasCount} tarjeta{d.tarjetasCount === 1 ? '' : 's'} emitida{d.tarjetasCount === 1 ? '' : 's'}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {d.esActivoDeEmpresa && (
                      <span className="inline-block rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        Activo
                      </span>
                    )}
                    {!d.esActivoDeEmpresa && (
                      <Button variant="outline" onClick={() => activar(d.id)}>
                        Activar
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => startEdit(d)}>
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-lg font-medium">{editingId ? 'Editar diseño' : 'Crear diseño'}</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          {editingId ? 'Ajustá los detalles de tu diseño.' : 'Elegí qué tipo de tarjeta querés crear y armá el diseño.'}
        </p>
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <Card>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => update('tipo', 'sellos')}
                  className={`relative rounded-xl border-2 p-4 text-left transition-colors ${
                    form.tipo === 'sellos' ? 'border-primary bg-secondary' : 'border-border hover:bg-secondary/50'
                  }`}
                >
                  {form.tipo === 'sellos' && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                  <Award className="h-6 w-6" />
                  <p className="mt-2 font-medium">Tarjeta de sellos</p>
                  <p className="text-sm text-muted-foreground">Tus clientes juntan sellos en cada visita y canjean un premio.</p>
                </button>
                <button
                  type="button"
                  onClick={() => update('tipo', 'cupon')}
                  className={`relative rounded-xl border-2 p-4 text-left transition-colors ${
                    form.tipo === 'cupon' ? 'border-primary bg-secondary' : 'border-border hover:bg-secondary/50'
                  }`}
                >
                  {form.tipo === 'cupon' && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                  <Ticket className="h-6 w-6" />
                  <p className="mt-2 font-medium">Promoción</p>
                  <p className="text-sm text-muted-foreground">Un cupón u oferta de un solo uso, con vencimiento opcional.</p>
                </button>
              </div>
              <div>
                <Label>Template base (opcional)</Label>
                <Select value={form.templateId} onChange={(e) => selectTemplate(e.target.value)}>
                  <option value="">Ninguno (desde cero)</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({TIPO_LABEL[t.tipoRecompensa] || 'Sellos'})
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
              {form.tipo === 'sellos' && (
                <div>
                  <Label>Ícono del sello (opcional)</Label>
                  <ImageUploadInput value={form.iconoSello} onChange={(url) => update('iconoSello', url)} />
                </div>
              )}
              <div className="sm:col-span-2">
                <Label>Fondo de la tarjeta (opcional)</Label>
                <ImageUploadInput value={form.fondoUrl} onChange={(url) => update('fondoUrl', url)} />
              </div>
              {form.tipo === 'sellos' ? (
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
              ) : (
                <div>
                  <Label>Vencimiento (opcional)</Label>
                  <Input
                    type="date"
                    value={form.vencimiento}
                    onChange={(e) => update('vencimiento', e.target.value)}
                  />
                </div>
              )}
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
                <Label>{form.tipo === 'cupon' ? 'Descripción de la promoción' : 'Descripción / premio'}</Label>
                <Input
                  value={form.descripcion}
                  onChange={(e) => update('descripcion', e.target.value)}
                  placeholder={form.tipo === 'cupon' ? 'Ej. 2x1 en combo' : 'Ej. Café gratis'}
                />
              </div>
              {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear diseño'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <div className="flex flex-col items-center gap-2 lg:sticky lg:top-4 lg:self-start">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Vista previa</p>
            <CardPreview
              empresaNombre={auth?.nombre}
              tipo={form.tipo}
              logo={form.logo}
              iconoSello={form.iconoSello}
              fondoUrl={form.fondoUrl}
              colorPrimario={form.colorPrimario}
              colorTexto={form.colorTexto}
              sellosRequeridos={form.sellosRequeridos}
              vencimiento={form.vencimiento}
              descripcion={form.descripcion}
            />
            <p className="max-w-xs text-center text-xs text-muted-foreground">
              Así se va a ver en la wallet web y en Apple Wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
