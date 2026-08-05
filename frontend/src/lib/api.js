export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5217'

// Sesiones separadas por rol para poder estar logueado en /admin y /empresa al mismo
// tiempo (en la misma pestaña o en pestañas distintas) sin que una cierre la otra.
const AUTH_KEYS = { Empresa: 'masplus_auth_empresa', Admin: 'masplus_auth_admin' }
const LEGACY_AUTH_KEY = 'masplus_auth'

function currentRole() {
  return window.location.pathname.startsWith('/admin') ? 'Admin' : 'Empresa'
}

// Migración de una sola vez: versiones previas guardaban una única sesión bajo
// "masplus_auth" sin distinguir rol.
;(function migrateLegacyAuth() {
  const raw = localStorage.getItem(LEGACY_AUTH_KEY)
  if (!raw) return
  try {
    const parsed = JSON.parse(raw)
    const key = AUTH_KEYS[parsed.role] ?? AUTH_KEYS.Empresa
    if (!localStorage.getItem(key)) localStorage.setItem(key, raw)
  } catch {
    // ignora una entrada legacy corrupta
  } finally {
    localStorage.removeItem(LEGACY_AUTH_KEY)
  }
})()

export function getAuth(role = currentRole()) {
  try {
    const raw = localStorage.getItem(AUTH_KEYS[role])
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAuth(auth) {
  localStorage.setItem(AUTH_KEYS[auth.role] ?? AUTH_KEYS.Empresa, JSON.stringify(auth))
}

export function clearAuth(role = currentRole()) {
  localStorage.removeItem(AUTH_KEYS[role])
}

async function request(path, options = {}) {
  const auth = getAuth()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401) clearAuth()

  if (!res.ok) {
    let message = `Error ${res.status}`
    try {
      const body = await res.json()
      message = body.error ?? body.title ?? message
    } catch {
      // respuesta sin cuerpo JSON, se usa el mensaje genérico
    }
    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json()
}

async function upload(path, formData) {
  const auth = getAuth()
  const headers = {}
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`

  const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers, body: formData })

  if (res.status === 401) clearAuth()

  if (!res.ok) {
    let message = `Error ${res.status}`
    try {
      const body = await res.json()
      message = body.error ?? body.title ?? message
    } catch {
      // respuesta sin cuerpo JSON, se usa el mensaje genérico
    }
    throw new Error(message)
  }

  return res.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload,
}
