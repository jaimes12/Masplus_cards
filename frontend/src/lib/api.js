export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5217'
const AUTH_KEY = 'masplus_auth'

export function getAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAuth(auth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
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
