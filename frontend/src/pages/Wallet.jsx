import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Ticket } from 'lucide-react'
import { api, API_URL } from '../lib/api.js'
import masplusLogo from '../assets/masplus_logo.png'
import addToAppleWallet from '../assets/add-to-apple-wallet-logo.png'

const POLL_MS = 5000

const pageBackgroundStyle = { background: '#FFFFFF' }

/// Patrón diagonal repetido tipo marca de agua de banco de imágenes, con el logo real de Masplus:
/// predomina el blanco, con el logo difuminado como toque naranja.
function PageWatermarkPattern() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="mp-page-pattern" width="280" height="200" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
          <image href={masplusLogo} x="10" y="30" width="180" height="180" opacity="0.16" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mp-page-pattern)" />
    </svg>
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
        <PageWatermarkPattern />
        <p className="relative z-10 text-destructive">No se encontró la tarjeta.</p>
      </div>
    )
  }

  if (!tarjeta) {
    return (
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-4" style={pageBackgroundStyle}>
        <PageWatermarkPattern />
        <p className="relative z-10 text-muted-foreground">Cargando...</p>
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
      <PageWatermarkPattern />
      <div className="animate-card-in relative z-10 w-full max-w-sm overflow-hidden rounded-2xl p-6 shadow-lg" style={cardStyle}>
        <div
          className="animate-card-shimmer pointer-events-none absolute -inset-y-10 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-3">
          {tarjeta.logo && (
            <img src={tarjeta.logo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{tarjeta.empresaNombre}</p>
            <p className="truncate text-sm opacity-80">{tarjeta.clienteNombre}</p>
          </div>
        </div>

        {esCupon ? (
          <div className="animate-fade-up my-5" style={{ animationDelay: '120ms' }}>
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
            <div className="animate-fade-up my-5 flex items-baseline justify-between" style={{ animationDelay: '120ms' }}>
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
                  className="animate-pop-in flex aspect-square items-center justify-center rounded-full border-2 transition-opacity"
                  style={{
                    borderColor: texto,
                    opacity: ganado ? 1 : 0.3,
                    background: ganado ? `${texto}22` : 'transparent',
                    animationDelay: `${160 + i * 45}ms`,
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

        <div className="animate-fade-up mt-6 flex justify-center rounded-lg bg-white p-3" style={{ animationDelay: '260ms' }}>
          <img src={qrImg} alt="Código QR" width={160} height={160} />
        </div>

        <p className="animate-fade-up mt-3 text-center text-xs opacity-60" style={{ animationDelay: '320ms' }}>Powered by Masplus</p>
      </div>

      <a
        href={`${API_URL}/api/wallet/apple/${tarjeta.codigoQr}`}
        className="animate-fade-up relative z-10 transition-transform hover:scale-105"
        style={{ animationDelay: '380ms' }}
      >
        <img src={addToAppleWallet} alt="Agregar a Apple Wallet" className="h-11 w-auto" />
      </a>
    </div>
  )
}
