import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Stamp } from 'lucide-react'
import { api, API_URL } from '../lib/api.js'

const POLL_MS = 5000

export default function Wallet() {
  const { codigoQr } = useParams()
  const [tarjeta, setTarjeta] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    function load() {
      api
        .get(`/api/tarjetas/publica/${codigoQr}`)
        .then((data) => {
          if (!cancelled) setTarjeta(data)
        })
        .catch((err) => {
          if (!cancelled) setError(err.message)
        })
    }

    load()
    const interval = setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [codigoQr])

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <p className="text-destructive">No se encontró la tarjeta.</p>
      </div>
    )
  }

  if (!tarjeta) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tarjeta.codigoQr)}`
  const primario = tarjeta.colorPrimario || '#18181B'
  const texto = tarjeta.colorTexto || '#FFFFFF'
  const faltan = Math.max(tarjeta.sellosRequeridos - tarjeta.sellosActuales, 0)
  const stamps = Array.from({ length: tarjeta.sellosRequeridos }, (_, i) => i < tarjeta.sellosActuales)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl p-6 shadow-lg"
        style={{ background: primario, color: texto }}
      >
        <div className="flex items-center gap-3">
          {tarjeta.logo && (
            <img src={tarjeta.logo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{tarjeta.empresaNombre}</p>
            <p className="truncate text-sm opacity-80">{tarjeta.clienteNombre}</p>
          </div>
        </div>

        <div className="my-5 flex items-baseline justify-between">
          <p className="text-sm font-medium uppercase tracking-wide opacity-70">
            {faltan > 0 ? `Faltan ${faltan} sello${faltan === 1 ? '' : 's'}` : '¡Premio disponible!'}
          </p>
          {tarjeta.premiosCanjeados > 0 && (
            <p className="text-xs opacity-70">{tarjeta.premiosCanjeados} premio{tarjeta.premiosCanjeados === 1 ? '' : 's'} canjeado{tarjeta.premiosCanjeados === 1 ? '' : 's'}</p>
          )}
        </div>

        <div className="grid grid-cols-5 gap-3">
          {stamps.map((ganado, i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-full border-2 transition-opacity"
              style={{
                borderColor: texto,
                opacity: ganado ? 1 : 0.3,
                background: ganado ? `${texto}22` : 'transparent',
              }}
            >
              {tarjeta.iconoSello ? (
                <img src={tarjeta.iconoSello} alt="" className="h-6 w-6 object-contain" />
              ) : (
                <Stamp className="h-5 w-5" style={{ color: texto }} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center rounded-lg bg-white p-3">
          <img src={qrImg} alt="Código QR" width={160} height={160} />
        </div>
      </div>

      <a
        href={`${API_URL}/api/wallet/apple/${tarjeta.codigoQr}`}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Agregar a Apple Wallet
      </a>
    </div>
  )
}
