import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Award, Check, Copy, CreditCard, Download, Plus, QrCode, Ticket, Trash2 } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Button, Card, ColorInput, Input, Label } from '../../components/ui.jsx'
import CardPreview from '../../components/CardPreview.jsx'
import MiniCardPreview from '../../components/MiniCardPreview.jsx'
import PhoneFrame from '../../components/PhoneFrame.jsx'
import ImageUploadInput from '../../components/ImageUploadInput.jsx'
import { TutorialStrip } from '../../components/empresa/TutorialVideo.jsx'
import masplusLogo from '../../assets/masplus_logo.png'

const TIPO_LABEL = { sellos: 'Sellos', cupon: 'Promoción' }
const STEPS = ['Información', 'Diseño', 'Revisar']

const emptyForm = {
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
  recordatoriosActivos: false,
  estiloPoster: false,
}

// Si el color de marca del diseño es muy claro (ej. blanco), usarlo como color del QR lo dejaría
// invisible sobre el fondo blanco por defecto. En ese caso caemos a negro para que siempre se vea.
function esColorOscuro(hex) {
  const h = (hex || '').replace('#', '')
  if (h.length !== 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminancia < 0.6
}

/** Plantillas predefinidas del cartel con QR: layout fijo, solo cambia el color. */
const POSTER_TEMPLATES = [
  { id: 'clasico', nombre: 'Clásico' },
  { id: 'bloque', nombre: 'Bloque' },
  { id: 'oscuro', nombre: 'Oscuro' },
  { id: 'marco', nombre: 'Marco' },
]

/** Miniatura de una plantilla del cartel, dibujada en CSS con el color elegido. */
function PosterThumb({ template, color }) {
  const qrBox = <span className="mx-auto block h-4 w-4 rounded-[2px] border border-zinc-400 bg-white" />
  if (template === 'bloque')
    return (
      <span className="flex h-16 w-12 flex-col overflow-hidden rounded-md border border-border bg-white">
        <span className="flex h-7 items-center justify-center" style={{ background: color }}>
          <span className="h-1 w-6 rounded bg-white/80" />
        </span>
        <span className="flex flex-1 items-center">{qrBox}</span>
      </span>
    )
  if (template === 'oscuro')
    return (
      <span className="flex h-16 w-12 flex-col items-center justify-center gap-1 rounded-md border border-border bg-zinc-900">
        <span className="h-1 w-6 rounded" style={{ background: color }} />
        {qrBox}
      </span>
    )
  if (template === 'marco')
    return (
      <span className="flex h-16 w-12 items-center justify-center rounded-md border border-border bg-white p-1">
        <span
          className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[3px] border-2"
          style={{ borderColor: color }}
        >
          <span className="h-1 w-5 rounded bg-zinc-300" />
          {qrBox}
        </span>
      </span>
    )
  return (
    <span className="flex h-16 w-12 flex-col items-center justify-center gap-1 rounded-md border border-border bg-white">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      <span className="h-1 w-6 rounded bg-zinc-300" />
      {qrBox}
    </span>
  )
}

/**
 * El cartel completo de una plantilla, diseñado a tamaño "hoja" (640×905, proporción A4).
 * Lo usan tal cual la impresión (a página completa) y la vista previa (escalado con transform),
 * así lo que ves en el preview es exactamente lo que sale en el PDF.
 */
function CartelPoster({ template, color, nombre, tipo, logo, qrSrc, url }) {
  const accion = tipo === 'cupon' ? 'Escanea y llévate tu cupón' : 'Escanea y junta tus sellos'
  const beneficio = tipo === 'cupon' ? 'Tu cupón, directo en tu celular' : 'Cada compra te acerca a tu premio'
  const footer = (claro) => (
    <div className={`mt-4 flex items-center gap-2 ${claro ? 'opacity-90' : 'opacity-70'}`}>
      <img src={masplusLogo} alt="" className="h-6 w-6" />
      <span className={`text-sm ${claro ? 'text-white' : ''}`}>Powered by Masplus</span>
    </div>
  )
  const qrGrande = <img src={qrSrc} alt="Código QR de registro" width={340} height={340} />
  const logoImg = logo && <img src={logo} alt="" className="h-20 w-20 rounded-full object-cover" />

  if (template === 'bloque')
    return (
      <div className="flex h-full w-full flex-col items-stretch bg-white text-center text-zinc-900">
        <div
          className="flex flex-col items-center justify-center gap-4 px-12 py-14 text-white"
          style={{ background: color }}
        >
          {logoImg}
          <p className="text-3xl font-bold">{nombre}</p>
          <p className="text-xl opacity-90">{accion}</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 p-12">
          {qrGrande}
          <p className="text-lg font-medium">{beneficio}</p>
          <p className="max-w-sm break-all text-sm text-zinc-500">{url}</p>
          {footer(false)}
        </div>
      </div>
    )

  if (template === 'oscuro')
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-6 p-16 text-center text-white"
        style={{ background: '#111113' }}
      >
        {logoImg}
        <p className="text-3xl font-bold">{nombre}</p>
        <p className="text-xl" style={{ color: esColorOscuro(color) ? '#FFFFFF' : color }}>
          {accion}
        </p>
        <div className="rounded-2xl bg-white p-5">{qrGrande}</div>
        <p className="text-lg opacity-90">{beneficio}</p>
        <p className="max-w-sm break-all text-sm opacity-60">{url}</p>
        {footer(true)}
      </div>
    )

  if (template === 'marco')
    return (
      <div className="h-full w-full bg-white p-8 text-zinc-900">
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-6 rounded-3xl p-12 text-center"
          style={{ border: `10px solid ${color}` }}
        >
          {logoImg}
          <p className="text-3xl font-bold">{nombre}</p>
          <span className="rounded-full px-5 py-2 text-lg font-semibold text-white" style={{ background: color }}>
            {tipo === 'cupon' ? 'Cupón GRATIS' : 'Tarjeta de premios GRATIS'}
          </span>
          <p className="text-xl text-zinc-500">{accion}</p>
          {qrGrande}
          <p className="max-w-sm break-all text-sm text-zinc-500">{url}</p>
          {footer(false)}
        </div>
      </div>
    )

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-white p-16 text-center text-zinc-900">
      {logoImg}
      <div>
        <p className="text-2xl font-semibold">{nombre}</p>
        <p className="mt-1 text-lg" style={{ color: esColorOscuro(color) ? color : undefined }}>
          {accion}
        </p>
      </div>
      {qrGrande}
      <p className="text-lg font-medium">{beneficio}</p>
      <p className="max-w-sm break-all text-sm text-zinc-500">{url}</p>
      {footer(false)}
    </div>
  )
}

/** Vista previa chica del cartel: el mismo CartelPoster de la impresión, escalado con transform. */
function CartelPreview({ children }) {
  return (
    <div className="relative h-[297px] w-[210px] shrink-0 self-center overflow-hidden rounded-lg border border-border bg-white shadow-sm sm:self-start">
      <div
        className="absolute left-0 top-0 h-[905px] w-[640px] origin-top-left"
        style={{ transform: 'scale(0.3281)' }}
      >
        {children}
      </div>
    </div>
  )
}

export default function Disenos() {
  const { auth } = useAuth()
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
  const [posterColor, setPosterColor] = useState('#18181B')
  const [posterTemplate, setPosterTemplate] = useState('clasico')
  const [printDiseno, setPrintDiseno] = useState(null)
  const [recordatorioEnvio, setRecordatorioEnvio] = useState(null)

  function registroUrl(d) {
    return `${window.location.origin}/registro/${d.codigoRegistro}`
  }

  // El QR siempre se imprime sobre blanco; toma el color del cartel solo si es lo bastante
  // oscuro para escanearse bien, si no cae a negro.
  function qrImageUrl(d, size) {
    const params = new URLSearchParams({
      size: `${size}x${size}`,
      data: registroUrl(d),
      color: (esColorOscuro(posterColor) ? posterColor : '#18181B').replace('#', ''),
      bgcolor: 'FFFFFF',
    })
    return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
  }

  function toggleQr(d) {
    setQrOpenId((id) => {
      if (id === d.id) return null
      setPosterColor(d.colorPrimario || '#18181B')
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

  // En mobile (sobre todo iOS Safari) window.print() solo funciona si se llama de forma síncrona
  // dentro del mismo gesto del usuario (tap); si se dispara después con un setTimeout/efecto, el
  // navegador lo bloquea en silencio — por eso "Descargar PDF" andaba en la laptop pero no en el
  // celular. flushSync fuerza a que el diseño a imprimir ya esté en el DOM antes de llamar a print,
  // todo dentro del mismo click, sin ningún delay de por medio.
  function downloadPdf(d) {
    flushSync(() => setPrintDiseno(d))
    window.print()
  }

  useEffect(() => {
    function handleAfterPrint() {
      setPrintDiseno(null)
    }
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  async function load() {
    const d = await api.get('/api/disenos')
    setDisenos(d)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function startEdit(diseno) {
    setEditingId(diseno.id)
    setShowForm(true)
    setStep(0)
    setForm({
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
      recordatoriosActivos: diseno.recordatoriosActivos || false,
      estiloPoster: diseno.estiloPoster || false,
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
        templateId: null,
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
        recordatoriosActivos: form.tipo === 'sellos' ? !!form.recordatoriosActivos : false,
        estiloPoster: !!form.estiloPoster,
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

  async function enviarRecordatorios(d) {
    setRecordatorioEnvio({ id: d.id, loading: true })
    try {
      const { enviados } = await api.post('/api/tarjetas/recordatorios/enviar-ahora')
      setRecordatorioEnvio({ id: d.id, enviados })
    } catch (err) {
      setRecordatorioEnvio({ id: d.id, error: err.message })
    }
  }

  async function eliminarDiseno(d) {
    const ok = window.confirm(`¿Estás seguro de que querés eliminar "${d.nombre}"? Esta acción no se puede deshacer.`)
    if (!ok) return
    try {
      await api.delete(`/api/disenos/${d.id}`)
      await load()
    } catch (err) {
      window.alert(err.message)
    }
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Diseños</h1>
        {!showForm && (
          <Button data-tour="add-diseno-btn" onClick={() => setShowForm(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Agregar nuevo diseño
          </Button>
        )}
      </div>

      <TutorialStrip ids={['crear-tarjeta', 'imprimir-qr']} seccion="disenos" />

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
                    <Button data-tour="diseno-qr-btn" variant="ghost" className="gap-1.5" onClick={() => toggleQr(d)}>
                      <QrCode className="h-4 w-4" /> Código QR
                    </Button>
                    <Link to={`/empresa/tarjetas?disenoId=${d.id}`}>
                      <Button variant="ghost" className="gap-1.5">
                        <CreditCard className="h-4 w-4" /> Agregar tarjetas
                      </Button>
                    </Link>
                    <Button variant="ghost" className="gap-1.5 text-destructive" onClick={() => eliminarDiseno(d)}>
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </Button>
                    {d.tipo === 'sellos' && d.recordatoriosActivos && (
                      <Button
                        variant="ghost"
                        onClick={() => enviarRecordatorios(d)}
                        disabled={recordatorioEnvio?.id === d.id && recordatorioEnvio?.loading}
                      >
                        {recordatorioEnvio?.id === d.id && recordatorioEnvio?.loading
                          ? 'Enviando...'
                          : 'Enviar recordatorios ahora'}
                      </Button>
                    )}
                  </div>
                  {recordatorioEnvio?.id === d.id && !recordatorioEnvio.loading && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {recordatorioEnvio.error
                        ? recordatorioEnvio.error
                        : `Se enviaron ${recordatorioEnvio.enviados} recordatorio${recordatorioEnvio.enviados === 1 ? '' : 's'} en tu empresa.`}
                    </p>
                  )}
                </div>
              </div>

              {qrOpenId === d.id && (
                <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row">
                  {/* Vista previa real del cartel: el mismo componente que se imprime, escalado.
                      De paso deja el QR grande en caché para que "Descargar PDF" salga al instante. */}
                  <CartelPreview>
                    <CartelPoster
                      template={posterTemplate}
                      color={posterColor}
                      nombre={auth?.nombre}
                      tipo={d.tipo}
                      logo={d.logo}
                      qrSrc={qrImageUrl(d, 500)}
                      url={registroUrl(d)}
                    />
                  </CartelPreview>
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
                    <div>
                      <Label className="mb-1.5">Plantilla del cartel</Label>
                      <div className="flex flex-wrap gap-2">
                        {POSTER_TEMPLATES.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setPosterTemplate(t.id)}
                            title={t.nombre}
                            className={`group flex flex-col items-center gap-1 rounded-lg border-2 p-1.5 transition-colors ${
                              posterTemplate === t.id ? 'border-primary bg-secondary' : 'border-border hover:bg-secondary/50'
                            }`}
                          >
                            <PosterThumb template={t.id} color={posterColor} />
                            <span className="text-[11px] font-medium">{t.nombre}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-end gap-4">
                      <div>
                        <Label className="mb-1">Color del cartel</Label>
                        <Input
                          type="color"
                          value={posterColor}
                          onChange={(e) => setPosterColor(e.target.value)}
                          className="h-9 w-16 p-1"
                        />
                      </div>
                      <Button type="button" variant="outline" className="gap-1.5" onClick={() => downloadPdf(d)}>
                        <Download className="h-4 w-4" /> Descargar PDF
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Elige una plantilla y ajusta el color: la vista previa muestra exactamente lo que sale en el PDF,
                      listo para imprimir y poner en tu mostrador.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {showForm && (
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
                <div data-tour="diseno-step-info" className="grid gap-4 sm:grid-cols-2">
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
                    <Label>Nombre</Label>
                    <Input value={form.nombre} onChange={(e) => update('nombre', e.target.value)} required />
                  </div>
                  {form.tipo === 'sellos' ? (
                    <>
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
                      <div className="sm:col-span-2">
                        <label className="flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={form.recordatoriosActivos}
                            onChange={(e) => update('recordatoriosActivos', e.target.checked)}
                          />
                          <span>
                            Mandar un recordatorio automático a Apple Wallet una vez por semana a los clientes con
                            sellos pendientes que no han vuelto en 7 días.
                          </span>
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>Vencimiento (opcional)</Label>
                        <Input type="date" value={form.vencimiento} onChange={(e) => update('vencimiento', e.target.value)} />
                      </div>
                    </>
                  )}
                  <div className="sm:col-span-2">
                    <Label>Estilo en Apple Wallet</Label>
                    <div className="mt-1 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => update('estiloPoster', false)}
                        className={`relative flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                          !form.estiloPoster ? 'border-primary bg-secondary' : 'border-border hover:bg-secondary/50'
                        }`}
                      >
                        {!form.estiloPoster && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                        <span
                          className="mt-0.5 flex h-14 w-9 shrink-0 flex-col overflow-hidden rounded-md border border-border"
                          aria-hidden
                        >
                          <span className="h-4" style={{ background: form.colorPrimario }} />
                          <span className="flex-1 bg-muted" />
                          <span className="mx-auto mb-1 h-3 w-3 rounded-sm bg-foreground/60" />
                        </span>
                        <span>
                          <p className="font-medium">Clásico</p>
                          <p className="text-sm text-muted-foreground">Se ve igual en cualquier iPhone.</p>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => update('estiloPoster', true)}
                        className={`relative flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                          form.estiloPoster ? 'border-primary bg-secondary' : 'border-border hover:bg-secondary/50'
                        }`}
                      >
                        {form.estiloPoster && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                        <span
                          className="mt-0.5 flex h-14 w-9 shrink-0 flex-col justify-end overflow-hidden rounded-md border border-border"
                          style={{
                            background: form.fondoUrl
                              ? `url(${form.fondoUrl}) center/cover`
                              : `linear-gradient(160deg, ${form.colorPrimario}, ${form.colorSecundario})`,
                          }}
                          aria-hidden
                        >
                          <span className="mx-auto mb-1 h-3 w-3 rounded-sm bg-white/80" />
                        </span>
                        <span>
                          <p className="font-medium">
                            Póster{' '}
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                              Nuevo · iOS 27
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Tu foto cubre toda la tarjeta y agrega un botón "Ver mi tarjeta" debajo del pase. En
                            iPhones sin actualizar se muestra la versión clásica automáticamente.
                          </p>
                        </span>
                      </button>
                    </div>
                  </div>
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
                <div data-tour="diseno-step-diseno" className="grid gap-4 sm:grid-cols-2">
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
                    <ColorInput value={form.colorPrimario} onChange={(e) => update('colorPrimario', e.target.value)} />
                  </div>
                  <div>
                    <Label>Color secundario</Label>
                    <ColorInput value={form.colorSecundario} onChange={(e) => update('colorSecundario', e.target.value)} />
                  </div>
                  <div>
                    <Label>Color de texto</Label>
                    <ColorInput value={form.colorTexto} onChange={(e) => update('colorTexto', e.target.value)} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div data-tour="diseno-step-revisar" className="space-y-3 text-sm">
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
                  <Button data-tour="diseno-guardar-btn" type="submit" disabled={saving}>
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
        <div className="print-qr-poster">
          <CartelPoster
            template={posterTemplate}
            color={posterColor}
            nombre={auth?.nombre}
            tipo={printDiseno.tipo}
            logo={printDiseno.logo}
            qrSrc={qrImageUrl(printDiseno, 500)}
            url={registroUrl(printDiseno)}
          />
        </div>
      )}
    </div>
  )
}
