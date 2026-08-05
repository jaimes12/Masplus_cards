// Bot de WhatsApp para Más+ — deliberadamente "tonto": solo mueve mensajes entre WhatsApp
// (vinculado por QR, no la API oficial de Meta — decisión explícita del dueño del producto,
// consciente del riesgo de baneo) y el backend .NET, que tiene toda la lógica de negocio.
import fs from 'fs'
import path from 'path'
import express from 'express'
import pino from 'pino'
import QRCode from 'qrcode'
import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from '@whiskeysockets/baileys'

const PORT = process.env.PORT || 3001
const BACKEND_URL = process.env.BACKEND_URL
const BOT_SECRET = process.env.BOT_SECRET
const AUTH_DIR = process.env.AUTH_DIR || './auth'

if (!BACKEND_URL || !BOT_SECRET) {
  console.error('Faltan variables de entorno: BACKEND_URL y BOT_SECRET son obligatorias.')
  process.exit(1)
}

// Visibilidad de arranque: confirma en los logs si la sesión de WhatsApp persistió
// entre despliegues/reinicios (carpeta con creds.json ya existente) o si el contenedor
// arrancó "en frío" y va a pedir escanear el QR de nuevo — esto es clave para diagnosticar
// si el Volume de Railway está montado en la ruta correcta.
const authDirAbsoluto = path.resolve(AUTH_DIR)
const yaTeniaSesion = fs.existsSync(path.join(authDirAbsoluto, 'creds.json'))
console.log(`AUTH_DIR resuelto a: ${authDirAbsoluto} — sesión previa encontrada: ${yaTeniaSesion}`)

process.on('uncaughtException', (err) => {
  console.error('uncaughtException (el proceso puede reiniciarse por esto):', err)
})
process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection (el proceso puede reiniciarse por esto):', reason)
})

let sock = null
let connected = false
let currentQr = null
let reconnectAttempts = 0

function extraerTexto(message) {
  if (!message) return null
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    null
  )
}

async function reportarAlBackend(payload, intento = 1) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/inbound`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Bot-Secret': BOT_SECRET },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error(`El backend respondió ${response.status}`)
  } catch (err) {
    console.error(`No se pudo reportar el mensaje al backend (intento ${intento}):`, err.message)
    if (intento < 3) {
      setTimeout(() => reportarAlBackend(payload, intento + 1), intento * 3000)
    }
  }
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: state,
    // 'silent' escondía errores de sesión/desencriptado de Baileys que explican mensajes
    // perdidos sin ningún rastro en los logs — se puede subir a 'debug' temporalmente vía
    // BAILEYS_LOG_LEVEL si hace falta más detalle.
    logger: pino({ level: process.env.BAILEYS_LOG_LEVEL || 'warn' }),
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) currentQr = qr

    if (connection === 'open') {
      connected = true
      currentQr = null
      reconnectAttempts = 0
      console.log('WhatsApp conectado.')
    }

    if (connection === 'close') {
      connected = false
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut

      if (shouldReconnect) {
        reconnectAttempts += 1
        const delay = Math.min(30000, 2000 * reconnectAttempts)
        console.log(
          `Conexión cerrada (código ${statusCode}, motivo: ${lastDisconnect?.error?.message || 'desconocido'}). ` +
            `Reintentando en ${delay}ms (intento ${reconnectAttempts})...`,
        )
        setTimeout(connectToWhatsApp, delay)
      } else {
        console.log('Sesión cerrada (logout). Borrá la carpeta de auth y volvé a escanear el QR desde /admin/mensajes.')
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      if (msg.key.fromMe) continue
      if (msg.key.remoteJid?.endsWith('@g.us')) continue // ignora grupos, solo 1:1

      const texto = extraerTexto(msg.message)
      if (!texto) continue

      const telefono = msg.key.remoteJid?.split('@')[0]
      if (!telefono) continue

      await reportarAlBackend({
        telefono,
        texto,
        nombreContacto: msg.pushName || null,
        whatsAppMessageId: msg.key.id,
      })
    }
  })
}

const app = express()
app.use(express.json())

function requireSecret(req, res, next) {
  const provided = req.headers['x-bot-secret']
  if (provided !== BOT_SECRET) return res.status(401).json({ error: 'No autorizado' })
  next()
}

app.post('/send', requireSecret, async (req, res) => {
  const { telefono, texto } = req.body || {}
  if (!telefono || !texto) return res.status(400).json({ error: 'telefono y texto son requeridos' })
  if (!sock || !connected) return res.status(503).json({ error: 'WhatsApp no está conectado' })

  try {
    const jid = telefono.includes('@') ? telefono : `${telefono}@s.whatsapp.net`
    await sock.sendMessage(jid, { text: texto })
    res.json({ ok: true })
  } catch (err) {
    console.error('Error enviando mensaje de WhatsApp:', err)
    res.status(500).json({ error: 'No se pudo enviar el mensaje' })
  }
})

app.get('/qr-data', requireSecret, async (req, res) => {
  if (connected) return res.json({ conectado: true, qrDataUrl: null })
  if (!currentQr) return res.json({ conectado: false, qrDataUrl: null })

  const qrDataUrl = await QRCode.toDataURL(currentQr)
  res.json({ conectado: false, qrDataUrl })
})

app.get('/health', (req, res) => res.json({ ok: true, conectado: connected }))

app.listen(PORT, () => console.log(`Bot de WhatsApp escuchando en el puerto ${PORT}.`))

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando el socket de WhatsApp antes de salir...')
  try {
    sock?.end(undefined)
  } catch (err) {
    console.error('Error cerrando el socket:', err)
  }
  process.exit(0)
})

connectToWhatsApp().catch((err) => {
  console.error('No se pudo iniciar la conexión de WhatsApp:', err)
  process.exit(1)
})
