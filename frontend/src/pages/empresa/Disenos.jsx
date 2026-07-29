import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Award, Check, Copy, Download, Plus, QrCode, Ticket } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button, Card, Input, Label, Select } from '../../components/ui.jsx'
import CardPreview from '../../components/CardPreview.jsx'
import MiniCardPreview from '../../components/MiniCardPreview.jsx'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import ImageUploadInput from '../../components/ImageUploadInput.jsx'
import masplusLogo from '../../assets/masplus_logo.png'

const TIPO_LABEL = { sellos: 'Sellos', cupon: 'Promoción' }
const STEPS = ['Información', 'Diseño', 'Revisar']

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
  const [showForm, setShowForm] = useState(false)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [qrOpenId, setQrOpenId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [qrColor, setQrColor] = useState('#18181B')
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF')
  const [printDiseno, setPrintDiseno] = useState(null)

  function registroUrl(d) {
    return `${window.location.origin}/registro/${d.codigoRegistro}`
  }

  function qrImageUrl(d, size) {
    const params = new URLSearchParams({
      size: `${size}x${size}`,
      data: registroUrl(d),
      color: qrColor.replace('#', ''),
      bgcolor: qrBgColor.replace('#', ''),
    })
    return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
  }

  function toggleQr(d) {
    setQrOpenId((id) => {
      if (id === d.id) return null
      setQrColor(d.colorPrimario || '#18181B')
      setQrBgColor('#FFFFFF')
      return d.id
    })
  }

  async function copyLink(d) {
    try {
      await navigator.clipboard.writeText(registroUrl(d))
      setCopiedId(d.id)
      setTimeout(() => setCopiedId((id) => (id === d.id ? null : id)), 1500)
    } catch {
      // Clipboard no disponible (permiso denegado, contexto no seguro): el link sigue visible para copiar a mano.
    }
  }

  function downloadPdf(d) {
    setPrintDiseno(d)
  }

  useEffect(() => {
    if (!printDiseno) return
    // Da tiempo a que la imagen del QR (servida por qrserver.com) termine de cargar antes de imprimir.
    const timer = setTimeout(() => window.print(), 400)
    return () => clearTimeout(timer)
  }, [printDiseno])

  useEffect(() => {
    function handleAfterPrint() {
      setPrintDiseno(null)
    }
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

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
    setShowForm(true)
    setStep(0)
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
    setShowForm(false)
    setStep(0)
    setForm(emptyForm)
  }

  function goNext() {
    if (step === 0 && !form.nombre.trim()) {
      setError('Ponele un nombre a tu diseño antes de seguir.')
      return
    }
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function goBack() {
    setError('')
    setStep((s) => Math.max(s - 1, 0))
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
      setShowForm(false)
      setStep(0)
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
                <MiniCardPreview
                  empresaNombre={auth?.nombre}
                  tipo={d.tipo}
                  logo={d.logo}
                  iconoSello={d.iconoSello}
                  fondoUrl={d.fondoUrl}
                  colorPrimario={d.colorPrimario}
                  colorTexto={d.colorTexto}
                  sellosRequeridos={d.sellosRequeridos}
                  sellosActuales={0}
                  vencimiento={d.vencimiento}
                  descripcion={d.descripcion}
                />
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
                    <Button variant="ghost" className="gap-1.5" onClick={() => toggleQr(d)}>
                      <QrCode className="h-4 w-4" /> Código QR
                    </Button>
                  </div>
                </div>
              </div>

              {qrOpenId === d.id && (
                <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row">
                  <img
                    src={qrImageUrl(d, 180)}
                    alt={`Código QR de registro para ${d.nombre}`}
                    width={140}
                    height={140}
                    className="shrink-0 self-center rounded-lg border border-border sm:self-start"
                  />
                  <div className="w-full min-w-0 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Tus clientes escanean este código, ponen su nombre y teléfono, y reciben su tarjeta al instante.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input readOnly value={registroUrl(d)} className="text-xs" onFocus={(e) => e.target.select()} />
                      <Button type="button" variant="outline" className="shrink-0 gap-1.5" onClick={() => copyLink(d)}>
                        <Copy className="h-4 w-4" /> {copiedId === d.id ? 'Copiado' : 'Copiar'}
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-end gap-4">
                      <div>
                        <Label className="mb-1">Color del código</Label>
                        <Input
                          type="color"
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="h-9 w-16 p-1"
                        />
                      </div>
                      <div>
                        <Label className="mb-1">Color de fondo</Label>
                        <Input
                          type="color"
                          value={qrBgColor}
                          onChange={(e) => setQrBgColor(e.target.value)}
                          className="h-9 w-16 p-1"
                        />
                      </div>
                      <Button type="button" variant="outline" className="gap-1.5" onClick={() => downloadPdf(d)}>
                        <Download className="h-4 w-4" /> Descargar PDF
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Se abre el diálogo de impresión: elegí "Guardar como PDF" para descargarlo.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Agregar nuevo diseño
        </Button>
      ) : (
      <div>
        <h2 className="mb-1 text-lg font-medium">{editingId ? 'Editar diseño' : 'Crear diseño'}</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          {editingId ? 'Ajustá los detalles de tu diseño.' : 'Elegí qué tipo de tarjeta querés crear y armá el diseño.'}
        </p>

        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <Card>
            {/* Barra de progreso del wizard */}
            <div className="mb-6 flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={label} className="flex-1">
                  <div className={`h-1.5 rounded-full ${i <= step ? 'bg-primary' : 'bg-secondary'}`} />
                  <p className={`mt-1.5 text-xs font-medium ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
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
                      <Input type="date" value={form.vencimiento} onChange={(e) => update('vencimiento', e.target.value)} />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <Label>{form.tipo === 'cupon' ? 'Descripción de la promoción' : 'Descripción / premio'}</Label>
                    <Input
                      value={form.descripcion}
                      onChange={(e) => update('descripcion', e.target.value)}
                      placeholder={form.tipo === 'cupon' ? 'Ej. 2x1 en combo' : 'Ej. Café gratis'}
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">Revisá los datos antes de guardar.</p>
                  <dl className="divide-y divide-border rounded-lg border border-border">
                    {[
                      ['Tipo', TIPO_LABEL[form.tipo]],
                      ['Nombre', form.nombre || '—'],
                      [
                        form.tipo === 'cupon' ? 'Vencimiento' : 'Sellos requeridos',
                        form.tipo === 'cupon' ? form.vencimiento || 'Sin vencimiento' : form.sellosRequeridos,
                      ],
                      ['Descripción', form.descripcion || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between px-4 py-2.5">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

              <div className="mt-6 flex gap-2">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={goBack} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={cancelEdit}>
                  Cancelar
                </Button>
                <div className="flex-1" />
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={goNext} className="gap-1.5">
                    Siguiente <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear diseño'}
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <div className="flex flex-col items-center gap-2 lg:sticky lg:top-4 lg:self-start">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Vista previa</p>
            <PhoneFrame>
              <CardPreview
                empresaNombre={auth?.nombre}
                tipo={form.tipo}
                logo={form.logo}
                iconoSello={form.iconoSello}
                fondoUrl={form.fondoUrl}
                colorPrimario={form.colorPrimario}
                colorTexto={form.colorTexto}
                sellosRequeridos={form.sellosRequeridos}
                sellosActuales={0}
                vencimiento={form.vencimiento}
                descripcion={form.descripcion}
              />
            </PhoneFrame>
            <p className="max-w-xs text-center text-xs text-muted-foreground">
              Así se va a ver en la wallet web y en Apple Wallet.
            </p>
          </div>
        </div>
      </div>
      )}

      {printDiseno && (
        <div className="print-qr-poster flex-col items-center justify-center gap-6 p-16 text-center">
          {printDiseno.logo && <img src={printDiseno.logo} alt="" className="h-20 w-20 rounded-full object-cover" />}
          <div>
            <p className="text-2xl font-semibold">{auth?.nombre}</p>
            <p className="mt-1 text-lg text-muted-foreground">
              {printDiseno.tipo === 'cupon' ? 'Escaneá para obtener tu cupón' : 'Escaneá para juntar tus sellos'}
            </p>
          </div>
          <img src={qrImageUrl(printDiseno, 500)} alt="Código QR de registro" width={360} height={360} />
          <p className="max-w-sm break-all text-sm text-muted-foreground">{registroUrl(printDiseno)}</p>
          <div className="mt-4 flex items-center gap-2 opacity-70">
            <img src={masplusLogo} alt="" className="h-6 w-6" />
            <span className="text-sm">Powered by Masplus</span>
          </div>
        </div>
      )}
    </div>
  )
}
