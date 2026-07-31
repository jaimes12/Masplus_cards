import { useState } from 'react'
import { ScanLine } from 'lucide-react'
import { api } from '../../lib/api.js'
import { Card, Button } from '../../components/ui.jsx'
import QrScanner from '../../components/QrScanner.jsx'
import ErrorBoundary from '../../components/ErrorBoundary.jsx'

export default function Escanear() {
  const [scanning, setScanning] = useState(true)
  const [scanResult, setScanResult] = useState(null)

  async function handleScan(codigoQr) {
    setScanning(false)
    try {
      const tarjeta = await api.post(`/api/tarjetas/escanear/${codigoQr}/sello`)
      setScanResult({ ok: true, tarjeta })
    } catch (err) {
      setScanResult({ ok: false, message: err.message })
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Escanear</h1>
        <p className="text-sm text-muted-foreground">
          Apuntá la cámara al código QR de la tarjeta de tu cliente para sumarle un sello al instante.
        </p>
      </div>

      {scanning && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-primary" />
            <p className="font-medium">Esperando código QR...</p>
          </div>
          <ErrorBoundary
            fallback={<p className="text-sm text-destructive">No se pudo abrir la cámara en este dispositivo.</p>}
          >
            <QrScanner onScan={handleScan} />
          </ErrorBoundary>
        </Card>
      )}

      {scanResult && (
        <Card className={`border-2 ${scanResult.ok ? 'border-primary/40' : 'border-destructive/40'}`}>
          {scanResult.ok ? (
            <p className="text-sm">
              Sello agregado a <span className="font-medium">{scanResult.tarjeta.clienteNombre}</span> —{' '}
              {scanResult.tarjeta.sellosActuales} / {scanResult.tarjeta.sellosRequeridos} sellos
            </p>
          ) : (
            <p className="text-sm text-destructive">{scanResult.message}</p>
          )}
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => {
              setScanResult(null)
              setScanning(true)
            }}
          >
            Escanear otra
          </Button>
        </Card>
      )}
    </div>
  )
}
