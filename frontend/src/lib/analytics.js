import { API_URL } from './api.js'

/**
 * Analítica propia del sitio público (sin cookies de terceros, sin PII):
 * - visitante: id aleatorio persistente en localStorage
 * - sesión: id en sessionStorage que expira tras 30 min de inactividad
 * - eventos: pageview (ruta), etapa (funnel) y fin (duración activa de la sesión)
 * Los eventos se acumulan y se mandan en batch con sendBeacon/fetch; si algo falla,
 * se pierde el evento y ya — la analítica nunca debe romper la página.
 */

const ENDPOINT = `${API_URL}/api/analytics/eventos`
const SESION_TIMEOUT_MS = 30 * 60 * 1000

// Solo rastreamos el sitio público: el panel de empresa/admin no es tráfico de marketing.
const RUTAS_PUBLICAS = [/^\/$/, /^\/registro\//, /^\/empresa\/registro$/, /^\/empresa\/login$/, /^\/wallet\//]

let cola = []
let flushTimer = null
let activoDesde = Date.now()
let segundosActivos = 0
let finEnviado = false
const etapasEnviadas = new Set()

function id() {
  try {
    return crypto.randomUUID().replace(/-/g, '')
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
  }
}

function visitanteId() {
  try {
    let v = localStorage.getItem('mp_vid')
    if (!v) {
      v = id()
      localStorage.setItem('mp_vid', v)
    }
    return v
  } catch {
    return null
  }
}

function sesionId() {
  try {
    const ahora = Date.now()
    const ultimo = Number(sessionStorage.getItem('mp_sid_t') || 0)
    let s = sessionStorage.getItem('mp_sid')
    if (!s || ahora - ultimo > SESION_TIMEOUT_MS) s = id()
    sessionStorage.setItem('mp_sid', s)
    sessionStorage.setItem('mp_sid_t', String(ahora))
    return s
  } catch {
    return null
  }
}

function dispositivo() {
  try {
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
  } catch {
    return null
  }
}

export function esRutaPublica(pathname) {
  return RUTAS_PUBLICAS.some((r) => r.test(pathname))
}

function encolar(evento, inmediato = false) {
  const v = visitanteId()
  const s = sesionId()
  if (!v || !s) return
  cola.push({ v, s, d: dispositivo(), ...evento })
  if (inmediato) {
    flush()
    return
  }
  if (!flushTimer) flushTimer = setTimeout(flush, 4000)
}

function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  if (cola.length === 0) return
  const body = JSON.stringify(cola.slice(0, 25))
  cola = []
  try {
    // fetch con keepalive sobrevive al cierre de la pestaña (como sendBeacon), pero sin mandar
    // credenciales: sendBeacon siempre incluye cookies y eso choca con el CORS del backend.
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'omit',
    }).catch(() => {})
  } catch {
    /* la analítica nunca rompe la página */
  }
}

export function trackPageview(ruta, referrer) {
  encolar({ tipo: 'pageview', valor: ruta, ref: referrer || null })
}

export function trackEtapa(etapa, empresaId = null) {
  // Una vez por sesión: el funnel cuenta visitantes, no repeticiones.
  const key = `${etapa}`
  if (etapasEnviadas.has(key)) return
  etapasEnviadas.add(key)
  encolar({ tipo: 'etapa', valor: etapa, empresaId }, etapa === 'registro_completado')
}

/** Acumula solo el tiempo con la pestaña visible; manda "fin" al ocultarse/cerrar. */
export function iniciarMedicionDuracion() {
  activoDesde = Date.now()

  function acumular() {
    segundosActivos += Math.max(0, Math.round((Date.now() - activoDesde) / 1000))
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      acumular()
      enviarFin()
    } else {
      activoDesde = Date.now()
      finEnviado = false
    }
  })
  window.addEventListener('pagehide', () => {
    acumular()
    enviarFin()
  })

  function enviarFin() {
    if (finEnviado || segundosActivos < 3) {
      flush()
      return
    }
    finEnviado = true
    encolar({ tipo: 'fin', dur: segundosActivos }, true)
  }
}
