import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { LoyaltyCard } from '../components/LoyaltyCard'
import { MouseCursor, PanelFrame } from '../components/PanelFrame'
import { Phone, SCREEN_W, StatusBar } from '../components/Phone'
import { Backdrop, BrandCorner, Caption, IosNotification, OrangeButton, Typewriter } from '../components/ui'
import { CAFE, FONT, INK, INK_2, INK_3, ORANGE } from '../theme'

/**
 * Tutorial "Envía una notificación" (Notificaciones): se escribe el mensaje, se elige a quién,
 * se envía, y en el iPhone del cliente baja la notificación sobre su tarjeta.
 */
export const DURACION_NOTIF = 330 // 11 s

const MENSAJE = '☕ Hoy 2x1 en lattes hasta las 6 pm. ¡Te esperamos!'

export const Notificaciones: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const T = {
    typeFrom: 24,
    typeTo: 110,
    segmento: 140,
    enviar: 190,
    enviado: 200,
    llega: 215,
  }

  const panelIn = spring({ frame, fps, config: { damping: 200, stiffness: 90 } })
  const phoneIn = spring({ frame: frame - 6, fps, config: { damping: 200, stiffness: 90 } })
  const toastP = spring({ frame: frame - T.enviado, fps, config: { damping: 16, stiffness: 160 } })

  const cursor = (() => {
    const path: [number, number, number][] = [
      [0, 500, 300],
      [T.typeFrom - 8, 300, 60],
      [T.segmento - 14, 60, 190],
      [T.segmento + 20, 60, 190],
      [T.enviar - 14, 90, 300],
      [DURACION_NOTIF, 90, 300],
    ]
    const frames = path.map((p) => p[0])
    return {
      x: interpolate(frame, frames, path.map((p) => p[1]), { extrapolateRight: 'clamp' }),
      y: interpolate(frame, frames, path.map((p) => p[2]), { extrapolateRight: 'clamp' }),
    }
  })()
  const pressed = [T.segmento, T.enviar].some((t) => frame >= t && frame < t + 6)
  const segmentoSel = frame >= T.segmento ? 0 : 1

  return (
    <AbsoluteFill>
      <Backdrop />

      <div style={{ position: 'absolute', left: 300, top: 110, opacity: panelIn, transform: `translateY(${(1 - panelIn) * 30}px)` }}>
        <PanelFrame active="Notificaciones" title="Nueva notificación" subtitle="Les llega a la tarjeta que tienen en Wallet, como notificación en el iPhone." width={900} height={640}>
          <div style={{ width: 560 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: INK_2, marginBottom: 8 }}>Mensaje</div>
            <div
              style={{
                minHeight: 92,
                borderRadius: 12,
                border: `1.5px solid ${frame >= T.typeFrom && frame < T.typeTo + 10 ? ORANGE : '#E7E5E4'}`,
                boxShadow: frame >= T.typeFrom && frame < T.typeTo + 10 ? '0 0 0 3px rgba(249,115,22,0.15)' : 'none',
                background: '#fff',
                padding: '12px 14px',
                fontSize: 15,
                lineHeight: 1.45,
                color: INK,
                marginBottom: 6,
              }}
            >
              {frame >= T.typeFrom ? <Typewriter text={MENSAJE} from={T.typeFrom} to={T.typeTo} cursor={frame < T.typeTo + 10} /> : <span style={{ color: INK_3 }}>Ej. Hoy 2x1 en lattes ☕</span>}
            </div>
            <div style={{ fontSize: 12, color: INK_3, marginBottom: 18, textAlign: 'right' }}>
              {Math.min(MENSAJE.length, Math.max(0, Math.round(interpolate(frame, [T.typeFrom, T.typeTo], [0, MENSAJE.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))))} / 120
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: INK_2, marginBottom: 8 }}>Enviar a</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {['Todos · 128', 'Frecuentes · 41', 'Inactivos · 23'].map((t, i) => (
                <div key={t} style={{ padding: '9px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: i === segmentoSel ? INK : '#fff', color: i === segmentoSel ? '#fff' : INK_2, border: '1.5px solid #E7E5E4' }}>{t}</div>
              ))}
            </div>

            <OrangeButton style={{ width: 200 }}>Enviar ahora</OrangeButton>
          </div>

          <MouseCursor x={cursor.x} y={cursor.y} pressed={pressed} />

          <div
            style={{
              position: 'absolute',
              right: 0,
              top: -10,
              opacity: toastP,
              transform: `translateY(${(1 - toastP) * -16}px)`,
              background: '#16A34A',
              color: '#fff',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 10px 30px rgba(22,163,74,0.35)',
            }}
          >
            ✓ Enviada a 128 clientes
          </div>
        </PanelFrame>
      </div>

      {/* iPhone del cliente */}
      <div style={{ position: 'absolute', left: 1330, top: 130, opacity: phoneIn, transform: `translateY(${(1 - phoneIn) * 30}px) rotate(2deg)` }}>
        <Phone screenBg="#000">
          <StatusBar dark />
          <div style={{ position: 'absolute', top: 60, left: 14, right: 14, color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: 12, fontSize: 15 }}>
              <span style={{ color: '#0A84FF' }}>Listo</span>
              <span style={{ fontWeight: 600 }}>{CAFE.name}</span>
              <span style={{ width: 30 }} />
            </div>
            <LoyaltyCard width={SCREEN_W - 28} stamps={3} showQr />
          </div>
          <IosNotification at={T.llega} app={CAFE.name} title="☕ Hoy 2x1 en lattes" body="Hasta las 6 pm. ¡Te esperamos!" visibleFor={130} />
        </Phone>
        <div style={{ position: 'absolute', top: -46, left: 0, fontFamily: FONT, fontSize: 16, fontWeight: 600, color: INK_2, letterSpacing: 2 }}>TU CLIENTE</div>
      </div>

      <Caption
        step="NOTIFICACIONES"
        title="Tráelos de vuelta con un mensaje"
        subtitle="Escribe, elige a quién, envía. Les llega al iPhone aunque no tengan tu app — porque no la necesitan."
        maxWidth={560}
      />
      <BrandCorner />
    </AbsoluteFill>
  )
}
