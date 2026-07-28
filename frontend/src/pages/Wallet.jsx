import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Ticket } from 'lucide-react'
import { api, API_URL } from '../lib/api.js'
import MasPlusWatermark from '../components/MasPlusWatermark.jsx'

const POLL_MS = 5000

const pageBackgroundStyle = {
  background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 60%, #7C2D12 100%)',
}

function PageWatermarks() {
  return (
    <>
      <MasPlusWatermark className="pointer-events-none absolute -right-32 -top-20 h-[420px] w-[620px] text-white opacity-[0.16] blur-sm" />
      <MasPlusWatermark className="pointer-events-none absolute -bottom-28 -left-32 h-[360px] w-[560px] rotate-180 text-white opacity-[0.12] blur-sm" />
    </>
  )
}

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
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-4" style={pageBackgroundStyle}>
        <PageWatermarks />
        <p className="relative z-10 text-destructive">No se encontró la tarjeta.</p>
      </div>
    )
  }

  if (!tarjeta) {
    return (
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-4" style={pageBackgroundStyle}>
        <PageWatermarks />
        <p className="relative z-10 text-white/80">Cargando...</p>
      </div>
    )
  }

  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tarjeta.codigoQr)}`
  const primario = tarjeta.colorPrimario || '#18181B'
  const texto = tarjeta.colorTexto || '#FFFFFF'
  const esCupon = tarjeta.tipo === 'cupon'
  const faltan = Math.max(tarjeta.sellosRequeridos - tarjeta.sellosActuales, 0)
  const stamps = Array.from({ length: tarjeta.sellosRequeridos }, (_, i) => i < tarjeta.sellosActuales)
  const cuponVencido = esCupon && tarjeta.vencimiento && new Date(tarjeta.vencimiento) < new Date()

  const cardStyle = tarjeta.fondoUrl
    ? {
        backgroundImage: `linear-gradient(${primario}8c, ${primario}8c), url(${tarjeta.fondoUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: texto,
      }
    : { background: primario, color: texto }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden p-4" style={pageBackgroundStyle}>
      <PageWatermarks />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl p-6 shadow-lg" style={cardStyle}>
        <div className="flex items-center gap-3">
          {tarjeta.logo && (
            <img src={tarjeta.logo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{tarjeta.empresaNombre}</p>
            <p className="truncate text-sm opacity-80">{tarjeta.clienteNombre}</p>
          </div>
        </div>

        {esCupon ? (
          <div className="my-5">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: `${texto}22` }}>
                <Ticket className="h-6 w-6" style={{ color: texto }} />
              </div>
              {tarjeta.cuponRedimido ? (
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">CANJEADO</span>
              ) : cuponVencido ? (
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">VENCIDO</span>
              ) : null}
            </div>
            <p className="mt-4 text-xl font-semibold leading-snug">{tarjeta.descripcion || 'Cupón especial'}</p>
            <p className="mt-2 text-xs uppercase tracking-wide opacity-70">
              {tarjeta.vencimiento
                ? `Vence ${new Date(tarjeta.vencimiento).toLocaleDateString('es-MX')}`
                : 'Sin vencimiento'}
            </p>
          </div>
        ) : (
          <>
            <div className="my-5 flex items-baseline justify-between">
              <p className="text-sm font-medium uppercase tracking-wide opacity-70">
                {faltan > 0 ? `Faltan ${faltan} sello${faltan === 1 ? '' : 's'}` : '¡Premio disponible!'}
              </p>
              {tarjeta.premiosCanjeados > 0 && (
                <p className="text-xs opacity-70">{tarjeta.premiosCanjeados} premio{tarjeta.premiosCanjeados === 1 ? '' : 's'} canjeado{tarjeta.premiosCanjeados === 1 ? '' : 's'}</p>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
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
                    <img
                      src={tarjeta.iconoSello}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                      style={{ opacity: ganado ? 1 : 0.35 }}
                    />
                  ) : (
                    ganado && <Check className="h-5 w-5" style={{ color: texto }} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-6 flex justify-center rounded-lg bg-white p-3">
          <img src={qrImg} alt="Código QR" width={160} height={160} />
        </div>

        <p className="mt-3 text-center text-xs opacity-60">Powered by Masplus</p>
      </div>

      <a
        href={`${API_URL}/api/wallet/apple/${tarjeta.codigoQr}`}
        className="relative z-10 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Agregar a Apple Wallet
      </a>
    </div>
  )
}
