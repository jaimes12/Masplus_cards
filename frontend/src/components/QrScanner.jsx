import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

let scannerIdCounter = 0

/// html5-qrcode puede tirar "Cannot stop, scanner is not running or paused." de forma
/// SÍNCRONA (no como promesa rechazada) si se llama stop() dos veces seguidas — pasa al
/// desmontar justo después de un escaneo exitoso. Por eso el try/catch envuelve la llamada
/// en sí, no solo el .catch() de la promesa que devuelve.
function safeStop(scanner) {
  try {
    const result = scanner.stop()
    if (result?.then) {
      result.then(() => scanner.clear()).catch(() => {})
    } else {
      scanner.clear()
    }
  } catch {
    // ya estaba detenido o nunca llegó a arrancar del todo
  }
}

export default function QrScanner({ onScan }) {
  const elementId = useRef(`qr-scanner-${++scannerIdCounter}`)
  const [error, setError] = useState('')
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  useEffect(() => {
    let scanner
    let stopped = false

    async function start() {
      try {
        scanner = new Html5Qrcode(elementId.current)
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (stopped) return
            stopped = true
            safeStop(scanner)
            onScanRef.current(decodedText)
          },
          () => {
            // frame sin QR detectado, se ignora
          },
        )
      } catch (err) {
        setError(err?.message || 'No se pudo acceder a la cámara.')
      }
    }

    start()

    return () => {
      if (stopped) return
      stopped = true
      if (scanner) safeStop(scanner)
    }
  }, [])

  if (error) {
    return (
      <p className="text-sm text-destructive">
        No se pudo abrir la cámara: {error}. Revisá los permisos del navegador.
      </p>
    )
  }

  return <div id={elementId.current} className="mx-auto w-full max-w-sm overflow-hidden rounded-lg" />
}
