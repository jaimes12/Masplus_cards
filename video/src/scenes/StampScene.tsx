import React from 'react'
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { LoyaltyCard } from '../components/LoyaltyCard'
import { Phone, SCREEN_W, StatusBar } from '../components/Phone'
import { Caption, IosNotification, ScannerBrackets } from '../components/ui'
import { CAFE, CUSTOMER, FONT, INK, INK_2, ORANGE } from '../theme'

/**
 * Escena 4 — En caja: el cliente muestra su tarjeta desde Wallet; el negocio la escanea con el
 * escáner de Más+ desde su propio celular. Al reconocer el QR, el sello aparece al instante en
 * el iPhone del cliente junto con la notificación push del pase.
 */
export const StampScene: React.FC<{ step?: string; title?: string; subtitle?: string }> = ({
  step = '04',
  title = 'El sello aparece al instante',
  subtitle = 'Escaneas su Wallet desde tu celular. Su tarjeta se actualiza sola y le llega la notificación.',
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const T = {
    lockFrom: 22,
    lockTo: 54,
    success: 62, // el escáner confirma
    stampAt: 74, // el sello cae en la tarjeta del cliente
    notifAt: 96,
  }

  const leftIn = spring({ frame, fps, config: { damping: 200, stiffness: 90 } })
  const rightIn = spring({ frame: frame - 6, fps, config: { damping: 200, stiffness: 90 } })

  const successP = spring({ frame: frame - T.success, fps, config: { damping: 14, stiffness: 160 } })
  const stampP = spring({ frame: frame - T.stampAt, fps, config: { damping: 9, stiffness: 180, mass: 0.7 } })
  const stampDone = frame >= T.stampAt + 16
  const stamps = stampDone ? 1 : 0
  const incoming = !stampDone && frame >= T.stampAt ? Math.min(1.15, stampP * 1.15) : 0

  // Pulso de "sincronización" entre teléfonos justo después del éxito
  const linkP = interpolate(frame, [T.success, T.stampAt], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Flash verde en el visor al reconocer
  const flash = interpolate(frame, [T.success - 2, T.success + 2, T.success + 14], [0, 0.55, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const cardW = SCREEN_W - 28
  // Bordes interiores de ambos teléfonos, para el pulso de sincronización.
  const leftPhoneX = 620
  const rightPhoneX = 1300
  const rightPhoneEdge = rightPhoneX
  const leftPhoneEdge = leftPhoneX + 390

  return (
    <AbsoluteFill>
      {/* Teléfono del cliente (izquierda): su tarjeta en Wallet */}
      <div
        style={{
          position: 'absolute',
          left: leftPhoneX,
          top: 130,
          opacity: leftIn,
          transform: `translateY(${(1 - leftIn) * 30}px) rotate(-2deg)`,
        }}
      >
        <Phone screenBg="#000">
          <StatusBar dark />
          <div style={{ position: 'absolute', top: 60, left: 14, right: 14, fontFamily: FONT, color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: 12 }}>
              <span style={{ color: '#0A84FF', fontSize: 15 }}>Listo</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{CAFE.name}</span>
              <span style={{ width: 30 }} />
            </div>
            <LoyaltyCard width={cardW} stamps={stamps} incomingScale={incoming} showQr />
          </div>
          <IosNotification
            at={T.notifAt}
            app={CAFE.name}
            title="☕ ¡Tu primer sello!"
            body={`Te faltan ${CAFE.totalStamps - 1} para tu café gratis. ¡Gracias, ${CUSTOMER.name}!`}
          />
        </Phone>
        <div style={{ position: 'absolute', top: -46, left: 0, fontFamily: FONT, fontSize: 16, fontWeight: 600, color: INK_2, letterSpacing: 2 }}>
          CLIENTE
        </div>
      </div>

      {/* Teléfono del negocio (derecha): escáner de Más+ */}
      <div
        style={{
          position: 'absolute',
          left: rightPhoneX,
          top: 130,
          opacity: rightIn,
          transform: `translateY(${(1 - rightIn) * 30}px) rotate(2deg)`,
        }}
      >
        <Phone screenBg="#fff">
          <div style={{ position: 'absolute', inset: 0, fontFamily: FONT, background: '#fafaf9' }}>
            {/* Header del panel Más+ */}
            <div style={{ padding: '62px 18px 12px', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderBottom: '1px solid #eee' }}>
              <Img src={staticFile('masplus_icon.png')} style={{ width: 30, height: 30 }} />
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: INK }}>Escáner</div>
                <div style={{ fontSize: 12, color: INK_2 }}>Apunta al QR de la tarjeta del cliente</div>
              </div>
            </div>

            {/* Visor */}
            <div style={{ position: 'relative', margin: '16px 16px 0', height: 400, borderRadius: 18, overflow: 'hidden', background: '#111' }}>
              {/* lo que ve la cámara: la tarjeta del cliente (su QR) */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%,-50%) scale(1.02)',
                  filter: 'brightness(0.9)',
                }}
              >
                <div style={{ background: '#fff', padding: 16, borderRadius: 12 }}>
                  <Img src={staticFile('qr-tarjeta.svg')} style={{ width: 190, height: 190 }} />
                </div>
              </div>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)' }} />
              <ScannerBrackets from={T.lockFrom} to={T.lockTo} startSize={330} endSize={236} color={ORANGE} cx={(SCREEN_W - 32) / 2} cy={200} />
              {/* línea de escaneo */}
              {frame < T.success && (
                <div
                  style={{
                    position: 'absolute',
                    left: 40,
                    right: 40,
                    top: 60 + ((frame * 6) % 280),
                    height: 3,
                    background: ORANGE,
                    boxShadow: `0 0 16px ${ORANGE}`,
                    opacity: 0.85,
                    borderRadius: 2,
                  }}
                />
              )}
              <div style={{ position: 'absolute', inset: 0, background: '#22C55E', opacity: flash }} />
            </div>

            {/* Resultado */}
            <div style={{ position: 'absolute', left: 16, right: 16, top: 16 + 130 + 400 + 16, transform: `translateY(${(1 - successP) * 30}px)`, opacity: successP }}>
              <div style={{ background: '#fff', border: '1px solid #DCFCE7', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#22C55E', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>¡Sello agregado!</div>
                  <div style={{ fontSize: 13, color: INK_2 }}>
                    {CUSTOMER.name} · {CAFE.name} · 1 de {CAFE.totalStamps}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Phone>
        <div style={{ position: 'absolute', top: -46, left: 0, fontFamily: FONT, fontSize: 16, fontWeight: 600, color: INK_2, letterSpacing: 2 }}>
          NEGOCIO
        </div>
      </div>

      {/* Pulso de sincronización: del escáner a la tarjeta del cliente */}
      {linkP > 0 && linkP < 1 && (
        <div
          style={{
            position: 'absolute',
            top: 500,
            left: interpolate(linkP, [0, 1], [rightPhoneEdge - 10, leftPhoneEdge - 6]),
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: ORANGE,
            boxShadow: `0 0 24px ${ORANGE}, 0 0 60px ${ORANGE}`,
            opacity: interpolate(linkP, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
          }}
        />
      )}

      <Caption step={step} title={title} subtitle={subtitle} maxWidth={470} />
    </AbsoluteFill>
  )
}
