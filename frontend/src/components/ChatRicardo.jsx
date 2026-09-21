import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { API_URL } from '../lib/api.js'
import { trackEtapa } from '../lib/analytics.js'

/**
 * Chat de la landing con Ricardo: la misma IA (y el mismo contexto editable del panel admin)
 * que atiende WhatsApp, pero directo en la página — el visitante pregunta sin irse y Ricardo
 * cierra mandándolo al registro. La conversación vive en sessionStorage (sobrevive navegar
 * entre páginas, muere al cerrar la pestaña) y nunca se guarda en el servidor.
 *
 * Cualquier componente puede abrirlo con: window.dispatchEvent(new Event('abrir-chat-ricardo'))
 */

const SALUDO = {
  rol: 'ia',
  texto:
    '¡Hola! 👋 Soy Ricardo, de Más+. Te ayudo a crear la tarjeta de lealtad digital de tu negocio. ¿Qué tipo de negocio tienes?',
}

const SUGERENCIAS = ['¿Cómo funciona?', '¿Cuánto cuesta?', 'Quiero probar gratis']

function cargarChat() {
  try {
    const raw = sessionStorage.getItem('mp_chat')
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [SALUDO]
  } catch {
    return [SALUDO]
  }
}

function guardarChat(mensajes) {
  try {
    sessionStorage.setItem('mp_chat', JSON.stringify(mensajes.slice(-16)))
  } catch {
    /* noop */
  }
}

/** Convierte URLs del texto de la IA en links clicables (el link de registro, sobre todo). */
function Linkify({ texto }) {
  const partes = texto.split(/(https?:\/\/[^\s]+)/g)
  return partes.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a
        key={i}
        href={p.replace('https://www.maspluss.com', '').replace('https://maspluss.com', '') || p}
        className="font-semibold underline"
        target={p.includes('maspluss.com') ? '_self' : '_blank'}
        rel="noreferrer"
      >
        {p.replace(/^https?:\/\/(www\.)?/, '')}
      </a>
    ) : (
      <span key={i}>{p}</span>
    ),
  )
}

export default function ChatRicardo({ conLanzador = true }) {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState(cargarChat)
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const listaRef = useRef(null)
  const inputRef = useRef(null)
  const primeraApertura = useRef(true)
  const primerMensaje = useRef(!cargarChat().some((m) => m.rol === 'cliente'))

  useEffect(() => {
    function abrir() {
      setAbierto(true)
    }
    window.addEventListener('abrir-chat-ricardo', abrir)
    return () => window.removeEventListener('abrir-chat-ricardo', abrir)
  }, [])

  useEffect(() => {
    if (!abierto) return
    if (primeraApertura.current) {
      primeraApertura.current = false
      try {
        trackEtapa('chat_abierto')
      } catch {
        /* noop */
      }
    }
    inputRef.current?.focus()
  }, [abierto])

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes, cargando, abierto])

  async function enviar(texto) {
    const limpio = (texto ?? input).trim()
    if (!limpio || cargando) return
    setInput('')
    setError('')

    if (primerMensaje.current) {
      primerMensaje.current = false
      try {
        trackEtapa('chat_mensaje')
        window.fbq?.('track', 'Contact')
      } catch {
        /* noop */
      }
    }

    const nuevos = [...mensajes, { rol: 'cliente', texto: limpio }]
    setMensajes(nuevos)
    guardarChat(nuevos)
    setCargando(true)
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: nuevos.slice(-16) }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'No pude responder ahora mismo.')
      }
      const data = await res.json()
      const conRespuesta = [...nuevos, { rol: 'ia', texto: data.respuesta }]
      setMensajes(conRespuesta)
      guardarChat(conRespuesta)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const sinMensajesDelCliente = !mensajes.some((m) => m.rol === 'cliente')

  return (
    <>
      {conLanzador && !abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="fixed bottom-6 right-6 z-40 hidden items-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 py-3 pl-4 pr-5 font-semibold text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-105 sm:flex"
        >
          <MessageCircle className="h-5 w-5" /> ¿Dudas? Pregúntame
        </button>
      )}

      {abierto && (
        <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px]">
          <div className="flex h-[70svh] flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:h-[520px] sm:rounded-2xl">
            <div className="flex items-center gap-3 border-b border-border bg-gradient-to-br from-orange-500 to-orange-600 px-4 py-3 text-white">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-sm font-bold">R</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">Ricardo · Más+</p>
                <p className="flex items-center gap-1 text-xs text-white/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> En línea, responde al momento
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-full p-1 hover:bg-white/15"
                aria-label="Cerrar chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={listaRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {mensajes.map((m, i) => (
                <div key={i} className={`flex ${m.rol === 'cliente' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      m.rol === 'cliente'
                        ? 'rounded-br-sm bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                        : 'rounded-bl-sm bg-secondary text-foreground'
                    }`}
                  >
                    <Linkify texto={m.texto} />
                  </div>
                </div>
              ))}
              {cargando && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-secondary px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {error && <p className="text-center text-xs text-red-500">{error}</p>}
              {sinMensajesDelCliente && !cargando && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGERENCIAS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => enviar(s)}
                      className="rounded-full border border-orange-300 bg-orange-50 px-3 py-1.5 text-sm text-orange-700 transition-colors hover:bg-orange-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                enviar()
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                maxLength={500}
                className="h-10 min-w-0 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-orange-400"
              />
              <button
                type="submit"
                disabled={cargando || !input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white disabled:opacity-40"
                aria-label="Enviar"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
