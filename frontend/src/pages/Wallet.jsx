import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, API_URL } from '../lib/api.js'

export default function Wallet() {
  const { codigoQr } = useParams()
  const [tarjeta, setTarjeta] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/api/tarjetas/publica/${codigoQr}`)
      .then(setTarjeta)
      .catch((err) => setError(err.message))
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

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl p-6 shadow-lg"
        style={{ background: tarjeta.colorPrimario || '#18181B', color: tarjeta.colorTexto || '#FFFFFF' }}
      >
        {tarjeta.logo && <img src={tarjeta.logo} alt="" className="mb-4 h-10 w-10 rounded-full object-cover" />}
        <p className="text-lg font-semibold">{tarjeta.empresaNombre}</p>
        <p className="text-sm opacity-80">{tarjeta.clienteNombre}</p>

        <div className="my-6 flex justify-between text-sm">
          <div>
            <p className="opacity-70">SELLOS</p>
            <p className="text-2xl font-bold">
              {tarjeta.sellosActuales} / {tarjeta.sellosRequeridos}
            </p>
          </div>
          <div>
            <p className="opacity-70">PREMIOS</p>
            <p className="text-2xl font-bold">{tarjeta.premiosCanjeados}</p>
          </div>
        </div>

        <div className="flex justify-center rounded-lg bg-white p-3">
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
