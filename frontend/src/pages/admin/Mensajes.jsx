import { useEffect, useRef, useState } from 'react'
import { Bot, QrCode, RefreshCw, Send, User, UserCog, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Button, Drawer, EmptyState, Input } from '../../components/ui.jsx'

const ETAPAS = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'en_platica', label: 'En plática' },
  { value: 'calificado', label: 'Calificado' },
  { value: 'convertido', label: 'Convertido' },
  { value: 'perdido', label: 'Perdido' },
]

function formatFecha(fechaStr) {
  const fecha = new Date(fechaStr)
  const diffMin = Math.floor((Date.now() - fecha.getTime()) / 60000)
  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `hace ${diffMin} min`
  if (diffMin < 1440) return `hace ${Math.floor(diffMin / 60)} h`
  return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

function ConversacionCard({ conversacion, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-border bg-card p-3.5 text-left transition-shadow hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-semibold text-foreground">{conversacion.nombreContacto || conversacion.telefono}</p>
        {!conversacion.iaActiva && (
          <span className="shrink-0 rounded-full bg-warn-soft px-2 py-0.5 text-[11px] font-semibold text-warn">Manual</span>
        )}
      </div>
      <p className="mt-1 truncate text-xs text-ink-3 tabular-nums">{conversacion.telefono}</p>
      {conversacion.ultimoMensajeTexto && (
        <p className="mt-2 line-clamp-2 text-xs text-ink-2">{conversacion.ultimoMensajeTexto}</p>
      )}
      <p className="mt-2 text-[11px] text-ink-3 tabular-nums">{formatFecha(conversacion.ultimoMensajeEn)}</p>
    </button>
  )
}

function VincularWhatsAppModal({ onClose }) {
  const [estado, setEstado] = useState(null)

  useEffect(() => {
    let activo = true
    async function consultar() {
      try {
        const data = await api.get('/api/admin/mensajes/whatsapp/status')
        if (activo) setEstado(data)
      } catch {
        // silencioso, reintenta en el próximo poll
      }
    }
    consultar()
    const interval = setInterval(consultar, 3000)
    return () => {
      activo = false
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="ml-auto mb-2 grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-base font-semibold text-foreground">Vincular WhatsApp</h3>
        {estado?.conectado ? (
          <p className="mt-4 text-sm text-ok">WhatsApp ya está vinculado ✅</p>
        ) : estado?.qrDataUrl ? (
          <>
            <p className="mt-2 text-sm text-ink-2">Escaneá este código desde WhatsApp en tu teléfono → Dispositivos vinculados.</p>
            <img src={estado.qrDataUrl} alt="Código QR de WhatsApp" className="mx-auto mt-4 h-56 w-56 rounded-lg border border-border" />
          </>
        ) : (
          <p className="mt-4 text-sm text-ink-3">Esperando al bot de WhatsApp...</p>
        )}
      </div>
    </div>
  )
}

export default function Mensajes() {
  const [conversaciones, setConversaciones] = useState(null)
  const [seleccionada, setSeleccionada] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [botEstado, setBotEstado] = useState(null)
  const [mostrarQr, setMostrarQr] = useState(false)
  const bottomRef = useRef(null)

  async function cargarConversaciones() {
    const data = await api.get('/api/admin/mensajes')
    setConversaciones(data)
  }

  async function cargarMensajes(id) {
    const data = await api.get(`/api/admin/mensajes/${id}/mensajes`)
    setMensajes(data)
  }

  useEffect(() => {
    cargarConversaciones()
    api.get('/api/admin/mensajes/whatsapp/status').then(setBotEstado).catch(() => {})
    const interval = setInterval(cargarConversaciones, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!seleccionada) return
    cargarMensajes(seleccionada.id)
    const interval = setInterval(() => cargarMensajes(seleccionada.id), 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleccionada?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function handleCambiarEtapa(etapa) {
    const actualizada = await api.put(`/api/admin/mensajes/${seleccionada.id}/etapa`, { etapa })
    setSeleccionada(actualizada)
    cargarConversaciones()
  }

  async function handleResponder(e) {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    try {
      const actualizada = await api.post(`/api/admin/mensajes/${seleccionada.id}/responder`, { texto: texto.trim() })
      setSeleccionada(actualizada)
      setTexto('')
      cargarMensajes(seleccionada.id)
      cargarConversaciones()
    } finally {
      setEnviando(false)
    }
  }

  async function handleReactivarIa() {
    const actualizada = await api.post(`/api/admin/mensajes/${seleccionada.id}/reactivar-ia`)
    setSeleccionada(actualizada)
    cargarConversaciones()
  }

  if (!conversaciones) return <p className="text-muted-foreground">Cargando...</p>

  const totalConversaciones = conversaciones.length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Mensajes</h1>
          <p className="text-sm text-muted-foreground">Conversaciones de WhatsApp con leads, atendidas por IA.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={cargarConversaciones} className="gap-1.5">
            <RefreshCw className="h-4 w-4" /> Actualizar
          </Button>
          <Button onClick={() => setMostrarQr(true)} className="gap-1.5">
            <QrCode className="h-4 w-4" /> {botEstado?.conectado ? 'WhatsApp vinculado' : 'Vincular WhatsApp'}
          </Button>
        </div>
      </div>

      {totalConversaciones === 0 ? (
        <EmptyState
          icon={<QrCode className="h-5 w-5" />}
          title="Todavía no hay conversaciones"
          description="En cuanto un lead te escriba por WhatsApp va a aparecer acá, agrupado por etapa del embudo."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-5">
          {ETAPAS.map((etapa) => {
            const items = conversaciones.filter((c) => c.etapa === etapa.value)
            return (
              <div key={etapa.value} className="min-w-0">
                <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-3 uppercase">
                  {etapa.label}
                  <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-ink-2">
                    {items.length}
                  </span>
                </p>
                <div className="space-y-2.5">
                  {items.map((c) => (
                    <ConversacionCard key={c.id} conversacion={c} onClick={() => setSeleccionada(c)} />
                  ))}
                  {items.length === 0 && <p className="text-xs text-ink-3">Sin conversaciones.</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Drawer
        open={!!seleccionada}
        onClose={() => setSeleccionada(null)}
        title={seleccionada?.nombreContacto || seleccionada?.telefono}
        subtitle={seleccionada?.telefono}
        footer={
          seleccionada && (
            <form onSubmit={handleResponder} className="flex w-full gap-2">
              <Input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribí un mensaje..." />
              <Button type="submit" disabled={enviando || !texto.trim()} className="shrink-0 gap-1.5">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )
        }
      >
        {seleccionada && (
          <div className="flex h-full flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {ETAPAS.map((etapa) => (
                <button
                  key={etapa.value}
                  type="button"
                  onClick={() => handleCambiarEtapa(etapa.value)}
                  className={`h-7 shrink-0 rounded-full border px-2.5 text-xs font-semibold transition-colors ${
                    seleccionada.etapa === etapa.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-ink-2 hover:border-ink-3'
                  }`}
                >
                  {etapa.label}
                </button>
              ))}
            </div>

            {!seleccionada.iaActiva && (
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-warn-soft px-3.5 py-2.5 text-sm text-warn">
                <UserCog className="h-4 w-4 shrink-0" />
                <span className="flex-1">Tomaste control manual — la IA no responde en este chat.</span>
                <button type="button" onClick={handleReactivarIa} className="shrink-0 font-semibold underline underline-offset-2">
                  Reactivar IA
                </button>
              </div>
            )}

            <div className="flex-1 space-y-3">
              {mensajes.map((m) => {
                const esCliente = m.rol === 'cliente'
                return (
                  <div key={m.id} className={`flex ${esCliente ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${esCliente ? 'bg-secondary text-foreground' : 'bg-accent/15 text-foreground'}`}>
                      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink-3">
                        {esCliente ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                        {esCliente ? 'Cliente' : m.rol === 'admin' ? 'Tú' : 'IA'}
                        {m.estadoEnvio === 'fallido' && <span className="text-bad">· no se pudo enviar</span>}
                      </p>
                      <p className="whitespace-pre-wrap">{m.texto}</p>
                      <p className="mt-1 text-[11px] text-ink-3 tabular-nums">
                        {new Date(m.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          </div>
        )}
      </Drawer>

      {mostrarQr && <VincularWhatsAppModal onClose={() => setMostrarQr(false)} />}
    </div>
  )
}
