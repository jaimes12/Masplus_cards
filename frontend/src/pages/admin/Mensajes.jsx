import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bot, Pencil, QrCode, RefreshCw, Send, User, UserCog, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Button, EmptyState, Input, Select } from '../../components/ui.jsx'

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

function formatFechaLarga(fechaStr) {
  return new Date(fechaStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function iniciales(nombre) {
  return (nombre || '?').trim().slice(0, 2).toUpperCase()
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

function ConversacionModal({ conversacion, mensajes, onClose, onCambiarEtapa, onResponder, onReactivarIa, onGuardarNotas, onActualizarTelefono }) {
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [notas, setNotas] = useState(conversacion.notas || '')
  const [guardandoNotas, setGuardandoNotas] = useState(false)
  const [editandoTelefono, setEditandoTelefono] = useState(false)
  const [telefono, setTelefono] = useState(conversacion.telefono)
  const [guardandoTelefono, setGuardandoTelefono] = useState(false)
  const [errorTelefono, setErrorTelefono] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    setNotas(conversacion.notas || '')
    setTelefono(conversacion.telefono)
    setEditandoTelefono(false)
    setErrorTelefono('')
  }, [conversacion.id, conversacion.notas, conversacion.telefono])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    try {
      await onResponder(texto.trim())
      setTexto('')
    } finally {
      setEnviando(false)
    }
  }

  async function handleGuardarNotas() {
    setGuardandoNotas(true)
    try {
      await onGuardarNotas(notas)
    } finally {
      setGuardandoNotas(false)
    }
  }

  async function handleGuardarTelefono() {
    setGuardandoTelefono(true)
    setErrorTelefono('')
    try {
      await onActualizarTelefono(telefono.trim())
      setEditandoTelefono(false)
    } catch (err) {
      setErrorTelefono(err.message || 'No se pudo actualizar el teléfono.')
    } finally {
      setGuardandoTelefono(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            {iniciales(conversacion.nombreContacto)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{conversacion.nombreContacto || conversacion.telefono}</p>
            <p className="truncate text-xs text-ink-3 tabular-nums">{conversacion.telefono}</p>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Select
              value={conversacion.etapa}
              onChange={(e) => onCambiarEtapa(e.target.value)}
              className="!w-auto"
            >
              {ETAPAS.map((etapa) => (
                <option key={etapa.value} value={etapa.value}>
                  {etapa.label}
                </option>
              ))}
            </Select>
            <span
              className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${
                conversacion.iaActiva ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn'
              }`}
            >
              {conversacion.iaActiva ? 'IA activa' : 'IA pausada'}
            </span>
            <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-secondary" aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            {!conversacion.iaActiva && (
              <div className="flex shrink-0 items-center gap-3 bg-warn-soft px-5 py-2.5 text-sm text-warn">
                <UserCog className="h-4 w-4 shrink-0" />
                <span className="flex-1">Tomaste control manual — la IA no responde en este chat.</span>
                <button type="button" onClick={onReactivarIa} className="shrink-0 font-semibold underline underline-offset-2">
                  Reactivar IA
                </button>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto bg-secondary/30 p-5">
              {mensajes.map((m) => {
                const esCliente = m.rol === 'cliente'
                return (
                  <div key={m.id} className={`flex ${esCliente ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm shadow-soft ${esCliente ? 'bg-card text-foreground' : 'bg-accent/15 text-foreground'}`}>
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

            <form onSubmit={handleSubmit} className="flex shrink-0 gap-2 border-t border-border p-4">
              <Input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribí un mensaje..." />
              <Button type="submit" disabled={enviando || !texto.trim()} className="shrink-0 gap-1.5">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="hidden w-72 shrink-0 space-y-6 overflow-y-auto border-l border-border p-5 lg:block">
            <div>
              <p className="mb-2.5 text-xs font-semibold tracking-wide text-ink-3 uppercase">Información</p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-ink-3">Teléfono</dt>
                  {editandoTelefono ? (
                    <div className="flex-1 space-y-1.5">
                      <Input
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="!h-8 text-xs tabular-nums"
                        autoFocus
                      />
                      {errorTelefono && <p className="text-[11px] text-bad">{errorTelefono}</p>}
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          onClick={handleGuardarTelefono}
                          disabled={guardandoTelefono || !telefono.trim()}
                          className="!h-7 flex-1 !px-2 text-[11px]"
                        >
                          {guardandoTelefono ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditandoTelefono(false)
                            setTelefono(conversacion.telefono)
                            setErrorTelefono('')
                          }}
                          className="!h-7 !px-2 text-[11px]"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <dd className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-medium text-foreground tabular-nums">{conversacion.telefono}</span>
                      <button
                        type="button"
                        onClick={() => setEditandoTelefono(true)}
                        className="shrink-0 text-ink-3 hover:text-foreground"
                        aria-label="Editar teléfono"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </dd>
                  )}
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Primer contacto</dt>
                  <dd className="font-medium text-foreground">{formatFechaLarga(conversacion.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Última actividad</dt>
                  <dd className="font-medium text-foreground">{formatFecha(conversacion.ultimoMensajeEn)}</dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="mb-2.5 text-xs font-semibold tracking-wide text-ink-3 uppercase">Notas</p>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas internas sobre este lead..."
                rows={5}
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGuardarNotas}
                disabled={guardandoNotas || notas === (conversacion.notas || '')}
                className="mt-2 w-full"
              >
                {guardandoNotas ? 'Guardando...' : 'Guardar notas'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function Mensajes() {
  const [conversaciones, setConversaciones] = useState(null)
  const [seleccionadaId, setSeleccionadaId] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [botEstado, setBotEstado] = useState(null)
  const [mostrarQr, setMostrarQr] = useState(false)

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
    if (!seleccionadaId) return
    cargarMensajes(seleccionadaId)
    const interval = setInterval(() => cargarMensajes(seleccionadaId), 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleccionadaId])

  const seleccionada = conversaciones?.find((c) => c.id === seleccionadaId) ?? null

  function actualizarSeleccionEnLista(actualizada) {
    setConversaciones((prev) => prev.map((c) => (c.id === actualizada.id ? actualizada : c)))
  }

  async function handleCambiarEtapa(etapa) {
    const actualizada = await api.put(`/api/admin/mensajes/${seleccionadaId}/etapa`, { etapa })
    actualizarSeleccionEnLista(actualizada)
  }

  async function handleResponder(texto) {
    const actualizada = await api.post(`/api/admin/mensajes/${seleccionadaId}/responder`, { texto })
    actualizarSeleccionEnLista(actualizada)
    cargarMensajes(seleccionadaId)
  }

  async function handleReactivarIa() {
    const actualizada = await api.post(`/api/admin/mensajes/${seleccionadaId}/reactivar-ia`)
    actualizarSeleccionEnLista(actualizada)
  }

  async function handleGuardarNotas(notas) {
    const actualizada = await api.put(`/api/admin/mensajes/${seleccionadaId}/notas`, { notas })
    actualizarSeleccionEnLista(actualizada)
  }

  async function handleActualizarTelefono(telefono) {
    const actualizada = await api.put(`/api/admin/mensajes/${seleccionadaId}/telefono`, { telefono })
    actualizarSeleccionEnLista(actualizada)
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
                    <ConversacionCard key={c.id} conversacion={c} onClick={() => setSeleccionadaId(c.id)} />
                  ))}
                  {items.length === 0 && <p className="text-xs text-ink-3">Sin conversaciones.</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {seleccionada && (
          <ConversacionModal
            conversacion={seleccionada}
            mensajes={mensajes}
            onClose={() => setSeleccionadaId(null)}
            onCambiarEtapa={handleCambiarEtapa}
            onResponder={handleResponder}
            onReactivarIa={handleReactivarIa}
            onGuardarNotas={handleGuardarNotas}
            onActualizarTelefono={handleActualizarTelefono}
          />
        )}
      </AnimatePresence>

      {mostrarQr && <VincularWhatsAppModal onClose={() => setMostrarQr(false)} />}
    </div>
  )
}
