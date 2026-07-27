import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

let scannerIdCounter = 0

export default function QrScanner({ onScan }) {
  const elementId = useRef(`qr-scanner-${++scannerIdCounter}`)
  const [error, setError] = useState('')

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
            scanner
              .stop()
              .then(() => scanner.clear())
              .catch(() => {})
            onScan(decodedText)
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
      stopped = true
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {})
      }
    }
  }, [onScan])

  if (error) {
    return (
      <p className="text-sm text-destructive">
        No se pudo abrir la cámara: {error}. Revisá los permisos del navegador.
      </p>
    )
  }

  return <div id={elementId.current} className="mx-auto w-full max-w-sm overflow-hidden rounded-lg" />
}
