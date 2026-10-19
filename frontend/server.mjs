// Servidor estático del frontend con un extra: inyecta meta tags Open Graph por ruta,
// para que al compartir el link en WhatsApp/Facebook/Telegram salga la miniatura correcta.
// Los crawlers no ejecutan JavaScript, así que esto no puede vivir en React — tiene que
// venir en el HTML que responde el servidor.
import http from 'node:http'
import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const DIST = path.resolve('dist')
const PORT = Number(process.env.PORT || 3000)
const API = (process.env.VITE_API_URL || 'https://api.maspluss.com').replace(/\/$/, '')
const SITE = (process.env.PUBLIC_SITE_URL || 'https://www.maspluss.com').replace(/\/$/, '')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
}

const indexHtml = await readFile(path.join(DIST, 'index.html'), 'utf8')

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

function conMetas(metas) {
  const tags = metas.map(([prop, content]) => `    <meta property="${prop}" content="${esc(content)}" />`)
  return indexHtml.replace('</head>', `${tags.join('\n')}\n  </head>`)
}

// El HTML de /productos lleva el banner activo como og:image. Cache de 5 minutos para no
// pegarle al API en cada visita de crawler; si el API falla, se responde el HTML normal.
let productosCache = { html: null, exp: 0 }

async function htmlProductos() {
  if (productosCache.html && Date.now() < productosCache.exp) return productosCache.html
  let metas = [
    ['og:type', 'website'],
    ['og:url', `${SITE}/productos`],
    ['og:title', 'Catálogo · Piezas únicas'],
    ['og:description', 'Accesorios y piezas de diseño hechas bajo pedido. Envíos a todo México.'],
  ]
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 3000)
    const res = await fetch(`${API}/api/productos`, { signal: ctrl.signal })
    clearTimeout(t)
    if (res.ok) {
      const data = await res.json()
      const banner = data.banners?.[0]
      if (banner?.titulo) metas = metas.map(([p, c]) => (p === 'og:title' ? [p, banner.titulo] : [p, c]))
      if (banner?.subtitulo) metas = metas.map(([p, c]) => (p === 'og:description' ? [p, banner.subtitulo] : [p, c]))
      if (banner?.imagenUrl) {
        metas.push(['og:image', banner.imagenUrl])
        metas.push(['twitter:card', 'summary_large_image'])
        metas.push(['twitter:image', banner.imagenUrl])
      }
    }
  } catch {
    /* API caído: HTML sin og:image, pero la página sigue sirviéndose */
  }
  const html = conMetas(metas)
  productosCache = { html, exp: Date.now() + 5 * 60 * 1000 }
  return html
}

function enviarHtml(res, html) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' })
  res.end(html)
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405).end()
      return
    }
    const ruta = decodeURIComponent((req.url || '/').split('?')[0])
    const seguro = path.normalize(ruta).replace(/^(\.\.[/\\])+/, '')
    const archivo = path.join(DIST, seguro)

    if (archivo.startsWith(DIST) && path.extname(archivo)) {
      try {
        const info = await stat(archivo)
        if (info.isFile()) {
          const inmutable = seguro.startsWith('/assets/')
          res.writeHead(200, {
            'Content-Type': MIME[path.extname(archivo).toLowerCase()] || 'application/octet-stream',
            'Content-Length': info.size,
            'Cache-Control': inmutable ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
          })
          if (req.method === 'HEAD') return res.end()
          createReadStream(archivo).pipe(res)
          return
        }
      } catch {
        /* no existe: cae al fallback SPA */
      }
    }

    // Fallback SPA: /productos con sus metas OG, el resto con el index normal.
    enviarHtml(res, ruta === '/productos' ? await htmlProductos() : indexHtml)
  } catch {
    res.writeHead(500).end()
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`frontend sirviendo dist en :${PORT} (API para OG: ${API})`)
})
