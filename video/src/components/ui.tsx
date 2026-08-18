import React from 'react'
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { CAFE, CREAM, FONT, INK, INK_2, ORANGE, ORANGE_DARK } from '../theme'

/** Fondo cálido consistente con la landing (crema + blobs naranjas desenfocados). */
export const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, #ffffff 0%, ${CREAM} 100%)` }}>
    <div
      style={{
        position: 'absolute',
        left: -220,
        top: -120,
        width: 620,
        height: 620,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(253,186,116,0.45) 0%, rgba(253,186,116,0) 70%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: -260,
        bottom: -220,
        width: 760,
        height: 760,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,146,60,0.35) 0%, rgba(251,146,60,0) 70%)',
      }}
    />
  </AbsoluteFill>
)

/** Fade de entrada/salida de una escena completa (transición suave entre secuencias). */
export const SceneFade: React.FC<{ children: React.ReactNode; durationInFrames: number; fade?: number }> = ({
  children,
  durationInFrames,
  fade = 12,
}) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, fade, durationInFrames - fade, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
}

/** Título de escena abajo a la izquierda: número de paso + frase. Entra con un rise suave. */
export const Caption: React.FC<{ step: string; title: string; subtitle?: string; delay?: number; maxWidth?: number }> = ({
  step,
  title,
  subtitle,
  delay = 6,
  maxWidth = 640,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 120 } })
  const y = interpolate(p, [0, 1], [24, 0])
  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        bottom: 84,
        fontFamily: FONT,
        color: INK,
        opacity: p,
        transform: `translateY(${y}px)`,
        maxWidth,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color: ORANGE_DARK, letterSpacing: 1 }}>{step}</div>
      <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1, marginTop: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 22, color: INK_2, marginTop: 10, lineHeight: 1.35 }}>{subtitle}</div>}
    </div>
  )
}

/** Logo Más+ pequeño arriba a la derecha, presente en todas las escenas. */
export const BrandCorner: React.FC = () => (
  <div style={{ position: 'absolute', top: 44, right: 72, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.9 }}>
    <Img src={staticFile('masplus_icon.png')} style={{ width: 44, height: 44, objectFit: 'contain' }} />
  </div>
)

/** Ripple de "tap" con el dedo: círculo que se expande y desvanece a partir de `at`. */
export const TapRipple: React.FC<{ at: number; x: number; y: number; size?: number }> = ({ at, x, y, size = 64 }) => {
  const frame = useCurrentFrame()
  const t = frame - at
  if (t < 0 || t > 22) return null
  const scale = interpolate(t, [0, 22], [0.4, 1.6])
  const opacity = interpolate(t, [0, 4, 22], [0, 0.55, 0])
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.9)',
        boxShadow: '0 0 0 3px rgba(0,0,0,0.12)',
        transform: `scale(${scale})`,
        opacity,
        pointerEvents: 'none',
      }}
    />
  )
}

/** Esquinas de visor de cámara que se cierran sobre el objetivo entre `from` y `to`. */
export const ScannerBrackets: React.FC<{
  from: number
  to: number
  startSize: number
  endSize: number
  color?: string
  cx: number
  cy: number
}> = ({ from, to, startSize, endSize, color = '#FFD60A', cx, cy }) => {
  const frame = useCurrentFrame()
  const size = interpolate(frame, [from, to], [startSize, endSize], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const half = size / 2
  const arm = size * 0.22
  const w = 5
  const corner = (rot: number) => (
    <div
      key={rot}
      style={{
        position: 'absolute',
        left: cx - half,
        top: cy - half,
        width: size,
        height: size,
        transform: `rotate(${rot}deg)`,
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, width: arm, height: w, background: color, borderRadius: 3 }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: arm, background: color, borderRadius: 3 }} />
    </div>
  )
  return <>{[0, 90, 180, 270].map(corner)}</>
}

/** Banner de notificación iOS que baja desde arriba de la pantalla del teléfono. */
export const IosNotification: React.FC<{ at: number; title: string; body: string; app?: string; visibleFor?: number }> = ({
  at,
  title,
  body,
  app = 'Wallet',
  visibleFor = 80,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = spring({ frame: frame - at, fps, config: { damping: 18, stiffness: 140, mass: 0.9 } })
  const out = spring({ frame: frame - (at + visibleFor), fps, config: { damping: 200, stiffness: 120 } })
  if (frame < at || out >= 0.999) return null
  const y = interpolate(p, [0, 1], [-140, 0]) + interpolate(out, [0, 1], [0, -160])
  return (
    <div
      style={{
        position: 'absolute',
        top: 58,
        left: 12,
        right: 12,
        transform: `translateY(${y}px)`,
        background: 'rgba(250,250,250,0.94)',
        backdropFilter: 'blur(20px)',
        borderRadius: 22,
        padding: '12px 14px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        fontFamily: FONT,
        color: INK,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: 'linear-gradient(160deg,#111,#333)',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="24" height="20" viewBox="0 0 24 20">
          <rect x="1" y="1" width="22" height="18" rx="4" fill="#fff" />
          <rect x="1" y="1" width="22" height="5" rx="2" fill="#FF3B30" />
          <rect x="1" y="5" width="22" height="4" fill="#FF9500" />
          <rect x="1" y="8" width="22" height="4" fill="#34C759" />
          <rect x="1" y="11" width="22" height="4" fill="#007AFF" />
        </svg>
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: INK_2 }}>
          <span style={{ fontWeight: 600 }}>{app}</span>
          <span>ahora</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 1 }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.3, marginTop: 1 }}>{body}</div>
      </div>
    </div>
  )
}

/** Cartel de mostrador ("table tent") con el QR de registro del negocio. */
export const CounterPoster: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => {
  const s = width / 320
  return (
    <div
      style={{
        width,
        borderRadius: 18 * s,
        background: '#fff',
        boxShadow: '0 30px 70px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        fontFamily: FONT,
        ...style,
      }}
    >
      <div style={{ background: CAFE.bg1, color: '#fff', padding: `${20 * s}px ${22 * s}px`, display: 'flex', alignItems: 'center', gap: 12 * s }}>
        <div style={{ width: 40 * s, height: 40 * s, borderRadius: '50%', background: CAFE.accent }} />
        <div>
          <div style={{ fontSize: 22 * s, fontWeight: 700, letterSpacing: -0.3 }}>{CAFE.name}</div>
          <div style={{ fontSize: 13 * s, opacity: 0.8 }}>Programa de lealtad</div>
        </div>
      </div>
      <div style={{ padding: `${22 * s}px ${22 * s}px ${18 * s}px`, textAlign: 'center' }}>
        <div style={{ fontSize: 24 * s, fontWeight: 700, color: INK, letterSpacing: -0.5, lineHeight: 1.15 }}>
          Escanea y suma sellos
        </div>
        <div style={{ fontSize: 14 * s, color: INK_2, marginTop: 6 * s }}>
          Junta {CAFE.totalStamps} y tu café es gratis
        </div>
        <div
          style={{
            margin: `${18 * s}px auto 0`,
            width: 200 * s,
            height: 200 * s,
            padding: 12 * s,
            border: `${2 * s}px solid #eee`,
            borderRadius: 14 * s,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Img src={staticFile('qr-registro.svg')} style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ marginTop: 14 * s, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 * s, color: INK_2, fontSize: 12 * s }}>
          <Img src={staticFile('masplus_icon.png')} style={{ width: 16 * s, height: 16 * s }} />
          <span>Powered by Más+</span>
        </div>
      </div>
    </div>
  )
}

/** Botón naranja de la app, con el mismo look de la landing. */
export const OrangeButton: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: ORANGE,
      color: '#fff',
      fontWeight: 600,
      fontSize: 16,
      borderRadius: 12,
      padding: '14px 18px',
      textAlign: 'center',
      fontFamily: FONT,
      boxShadow: '0 8px 20px rgba(249,115,22,0.35)',
      ...style,
    }}
  >
    {children}
  </div>
)

/** Texto que se va escribiendo entre `from` y `to` (efecto máquina de escribir + cursor). */
export const Typewriter: React.FC<{ text: string; from: number; to: number; cursor?: boolean }> = ({ text, from, to, cursor = true }) => {
  const frame = useCurrentFrame()
  const n = Math.round(interpolate(frame, [from, to], [0, text.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const active = frame >= from && frame <= to + 10
  const blink = Math.floor(frame / 8) % 2 === 0
  return (
    <span>
      {text.slice(0, n)}
      {cursor && active && (
        <span style={{ display: 'inline-block', width: 2, height: '1em', background: ORANGE, marginLeft: 1, verticalAlign: 'text-bottom', opacity: blink ? 1 : 0 }} />
      )}
    </span>
  )
}
