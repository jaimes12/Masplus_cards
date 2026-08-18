import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Caption } from '../components/ui'
import { CAFE, FONT, INK, INK_2, INK_3 } from '../theme'

/** Vaso de café para llevar, con vapor animado. */
const TakeawayCup: React.FC<{ height: number }> = ({ height }) => {
  const frame = useCurrentFrame()
  const w = height * 0.72
  const steam = (i: number) => {
    const t = (frame + i * 14) % 60
    const y = interpolate(t, [0, 60], [0, -46])
    const o = interpolate(t, [0, 12, 48, 60], [0, 0.55, 0.35, 0])
    const x = Math.sin((t / 60) * Math.PI * 2 + i) * 6
    return { transform: `translate(${x}px, ${y}px)`, opacity: o }
  }
  return (
    <svg width={w} height={height} viewBox="0 0 180 250" fill="none">
      {/* vapor */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${62 + i * 28} 60 c -8 -12 8 -20 0 -34 c -8 -12 8 -20 0 -30`}
          stroke={CAFE.bg1}
          strokeWidth="5"
          strokeLinecap="round"
          style={steam(i)}
        />
      ))}
      {/* tapa */}
      <rect x="18" y="66" width="144" height="18" rx="6" fill="#4a4a4f" />
      <rect x="30" y="54" width="120" height="16" rx="6" fill="#5b5b60" />
      <rect x="112" y="46" width="22" height="10" rx="3" fill="#3a3a3e" />
      {/* vaso */}
      <path d="M26 84 L154 84 L138 236 Q137 246 127 246 L53 246 Q43 246 42 236 Z" fill="#FFF3E0" />
      {/* funda */}
      <path d="M31 118 L149 118 L142 182 L38 182 Z" fill={CAFE.bg1} />
      {/* logo en la funda */}
      <circle cx="90" cy="150" r="20" fill={CAFE.accent} />
      <g transform="translate(78 138) scale(1)">
        <path d="M6 8h11l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 8z M5 8h13" stroke={CAFE.bg1} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="90" y="200" textAnchor="middle" fontFamily={FONT} fontSize="13" fontWeight="700" fill={CAFE.bg1}>
        {CAFE.name.toUpperCase()}
      </text>
    </svg>
  )
}

/**
 * Escena 3 — La compra de siempre: un latte, el ticket, "Pagado". Corta y clara; el
 * protagonista real de esta parte es lo que viene después (el sello).
 */
export const PurchaseScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const cupIn = spring({ frame, fps, config: { damping: 200, stiffness: 90 } })
  const receiptIn = spring({ frame: frame - 14, fps, config: { damping: 22, stiffness: 120 } })
  const paidIn = spring({ frame: frame - 48, fps, config: { damping: 12, stiffness: 220, mass: 0.6 } })

  return (
    <AbsoluteFill>
      {/* mesa/mostrador */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 300,
          background: 'linear-gradient(180deg, rgba(120,90,70,0.10), rgba(120,90,70,0.22))',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 700,
          top: 250,
          opacity: cupIn,
          transform: `translateY(${(1 - cupIn) * 40}px)`,
        }}
      >
        <TakeawayCup height={520} />
        <div
          style={{
            position: 'absolute',
            left: 40,
            right: 40,
            bottom: -10,
            height: 24,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.18)',
            filter: 'blur(10px)',
          }}
        />
      </div>

      {/* Ticket */}
      <div
        style={{
          position: 'absolute',
          left: 1120,
          top: 300,
          width: 340,
          background: '#fff',
          borderRadius: 14,
          padding: 24,
          fontFamily: FONT,
          color: INK,
          boxShadow: '0 30px 60px rgba(0,0,0,0.18)',
          opacity: receiptIn,
          transform: `translateY(${(1 - receiptIn) * 40}px) rotate(3deg)`,
        }}
      >
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 20, letterSpacing: -0.3 }}>{CAFE.name}</div>
        <div style={{ textAlign: 'center', fontSize: 12, color: INK_3, marginTop: 2 }}>Sucursal Centro · Ticket #4821</div>
        <div style={{ borderTop: '2px dashed #E7E5E4', margin: '16px 0' }} />
        <Row label="Latte grande" value="$65.00" />
        <Row label="Leche de avena" value="$10.00" />
        <div style={{ borderTop: '2px dashed #E7E5E4', margin: '16px 0' }} />
        <Row label="Total" value="$75.00" bold />
        <div style={{ fontSize: 12, color: INK_2, marginTop: 10 }}>Tarjeta •••• 4132</div>

        {/* Sello "PAGADO" */}
        <div
          style={{
            position: 'absolute',
            right: 14,
            top: 34,
            border: '4px solid #16A34A',
            color: '#16A34A',
            borderRadius: 10,
            padding: '6px 12px',
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 2,
            transform: `rotate(-12deg) scale(${interpolate(paidIn, [0, 1], [1.8, 1])})`,
            opacity: paidIn,
          }}
        >
          PAGADO
        </div>
      </div>

      <Caption
        step="03"
        title="Compra su café de siempre"
        subtitle="Y le enseña su tarjeta desde Wallet, sin buscar nada en el celular."
      />
    </AbsoluteFill>
  )
}

const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 18 : 15, fontWeight: bold ? 700 : 400, marginTop: 6 }}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
)
