import React from 'react'
import { Img, staticFile } from 'remotion'
import { CAFE, CUSTOMER, FONT } from '../theme'

/** Ícono de sello: taza de café para llevar (SVG propio, se ve nítido a cualquier escala). */
export const CupIcon: React.FC<{ size: number; color: string; opacity?: number }> = ({ size, color, opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
    <path d="M6 8h11l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 8z" />
    <path d="M5 8h13" />
    <path d="M17 10.5h1.2a2.3 2.3 0 0 1 0 4.6H16.5" />
    <path d="M9 4.5c0-.9.6-1.2 1-1.7M12 4.5c0-.9.6-1.2 1-1.7" opacity="0.7" />
  </svg>
)

const CafeLogo: React.FC<{ size: number; accent?: string; ink?: string }> = ({ size, accent = CAFE.accent, ink = CAFE.bg1 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: accent,
      display: 'grid',
      placeItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    }}
  >
    <CupIcon size={size * 0.62} color={ink} />
  </div>
)

type Props = {
  width: number
  /** Overrides de marca (para el tutorial de "crear tu tarjeta", donde cambian en vivo). */
  nombreNegocio?: string
  nombreCliente?: string
  bg1?: string
  bg2?: string
  accent?: string
  total?: number
  /** Sellos completos (0..totalStamps). */
  stamps: number
  /** Escala 0..1 del sello que está entrando (índice = stamps). Para animar la caída del sello. */
  incomingScale?: number
  /** Mostrar el panel de QR (Wallet lo muestra; en la hoja de "Agregar" también). */
  showQr?: boolean
  style?: React.CSSProperties
}

/**
 * Tarjeta de sellos con la anatomía de un pase de Apple Wallet: header con logo + nombre del
 * negocio y del cliente, contador "FALTAN N SELLOS", grid de sellos, panel de QR y pie
 * "Powered by Masplus" — igual que las tarjetas reales que genera la plataforma.
 */
export const LoyaltyCard: React.FC<Props> = ({
  width,
  stamps,
  incomingScale = 0,
  showQr = true,
  style,
  nombreNegocio = CAFE.name,
  nombreCliente = CUSTOMER.name,
  bg1 = CAFE.bg1,
  bg2 = CAFE.bg2,
  accent = CAFE.accent,
  total = CAFE.totalStamps,
}) => {
  const s = width / 360 // escala base: la tarjeta se diseñó a 360px de ancho
  const restantes = Math.max(0, total - stamps)
  const cols = 4
  const cell = 64 * s
  const gap = 12 * s
  const gridW = cols * cell + (cols - 1) * gap

  return (
    <div
      style={{
        width,
        borderRadius: 22 * s,
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${bg1} 0%, ${bg2} 100%)`,
        color: '#fff',
        fontFamily: FONT,
        boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
        position: 'relative',
        ...style,
      }}
    >
      {/* textura sutil: granos de café */}
      <svg
        style={{ position: 'absolute', inset: 0, opacity: 0.08 }}
        width="100%"
        height="100%"
        viewBox="0 0 360 520"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 18 }).map((_, i) => {
          const x = (i * 97) % 360
          const y = (i * 151) % 520
          const r = (i * 37) % 360
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
              <ellipse cx="0" cy="0" rx="14" ry="20" fill="#fff" />
              <path d="M0 -18 Q 6 0 0 18" stroke={bg1} strokeWidth="3" fill="none" />
            </g>
          )
        })}
      </svg>

      <div style={{ position: 'relative', padding: 22 * s }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 * s }}>
          <CafeLogo size={46 * s} accent={accent} ink={bg1} />
          <div>
            <div style={{ fontSize: 22 * s, fontWeight: 700, letterSpacing: -0.3, whiteSpace: 'nowrap' }}>{nombreNegocio || ' '}</div>
            <div style={{ fontSize: 15 * s, opacity: 0.85 }}>{nombreCliente}</div>
          </div>
        </div>

        {/* Contador */}
        <div style={{ marginTop: 22 * s, fontSize: 15 * s, fontWeight: 600, letterSpacing: 1.2 * s, opacity: 0.85 }}>
          {restantes === 0 ? '¡PREMIO LISTO!' : `FALTAN ${restantes} SELLO${restantes === 1 ? '' : 'S'}`}
        </div>

        {/* Grid de sellos */}
        <div
          style={{
            marginTop: 14 * s,
            width: gridW,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
            gap,
          }}
        >
          {Array.from({ length: total }).map((_, i) => {
            const filled = i < stamps
            const incoming = i === stamps && incomingScale > 0
            return (
              <div
                key={i}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: '50%',
                  border: `${2 * s}px solid rgba(255,255,255,${filled ? 0.95 : 0.55})`,
                  background: filled ? CAFE.cream : 'rgba(255,255,255,0.08)',
                  display: 'grid',
                  placeItems: 'center',
                  position: 'relative',
                }}
              >
                {filled ? (
                  <CupIcon size={cell * 0.6} color={bg1} />
                ) : (
                  <CupIcon size={cell * 0.6} color="#fff" opacity={0.35} />
                )}
                {incoming && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: -2 * s,
                      borderRadius: '50%',
                      background: CAFE.cream,
                      border: `${2 * s}px solid #fff`,
                      display: 'grid',
                      placeItems: 'center',
                      transform: `scale(${incomingScale})`,
                      boxShadow: `0 0 0 ${(1 - Math.min(1, incomingScale)) * 18 * s}px rgba(255,243,224,0.35)`,
                    }}
                  >
                    <CupIcon size={cell * 0.6} color={bg1} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* QR */}
        {showQr && (
          <div
            style={{
              marginTop: 22 * s,
              background: '#fff',
              borderRadius: 14 * s,
              padding: 18 * s,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Img src={staticFile('qr-tarjeta.svg')} style={{ width: 150 * s, height: 150 * s }} />
          </div>
        )}

        <div style={{ marginTop: 16 * s, textAlign: 'center', fontSize: 13 * s, opacity: 0.85 }}>
          Powered by Masplus
        </div>
      </div>
    </div>
  )
}
