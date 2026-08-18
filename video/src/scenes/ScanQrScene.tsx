import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Phone, SCREEN_H, SCREEN_W, StatusBar } from '../components/Phone'
import { Caption, CounterPoster, ScannerBrackets, TapRipple } from '../components/ui'
import { FONT, INK } from '../theme'

/**
 * Escena 1 — El cliente apunta la cámara al cartel del mostrador. La cámara reconoce el QR
 * (esquinas amarillas se cierran), aparece la pastilla de link de iOS y el cliente la toca.
 */
export const ScanQrScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const posterIn = spring({ frame, fps, config: { damping: 200, stiffness: 90 } })
  const phoneIn = spring({ frame: frame - 6, fps, config: { damping: 200, stiffness: 90 } })

  // Cámara: la vista se acerca ligeramente al QR mientras "enfoca".
  const camZoom = interpolate(frame, [0, 60], [1.0, 1.12], { extrapolateRight: 'clamp' })
  const focusBlur = interpolate(frame, [0, 28], [3, 0], { extrapolateRight: 'clamp' })

  const pillIn = spring({ frame: frame - 62, fps, config: { damping: 16, stiffness: 160 } })
  const tapAt = 104
  const whiteout = interpolate(frame, [124, 142], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Dentro de la cámara: el cartel visto de cerca, con el QR centrado en pantalla.
  const posterW = 300
  const s = posterW / 320
  const qrCenterY = 75 * s + 20.6 * s + 26 * s + 19 * s + 17 * s + 100 * s // aprox. centro del QR en el cartel
  const camOffsetX = SCREEN_W / 2 - posterW / 2
  const camOffsetY = SCREEN_H / 2 - qrCenterY

  return (
    <AbsoluteFill>
      {/* Cartel físico en el mostrador */}
      <div
        style={{
          position: 'absolute',
          left: 300,
          top: 200,
          opacity: posterIn,
          transform: `perspective(1400px) rotateY(14deg) rotateX(2deg) translateY(${(1 - posterIn) * 30}px)`,
          transformOrigin: 'center',
        }}
      >
        <CounterPoster width={400} />
        {/* base del cartel */}
        <div
          style={{
            position: 'absolute',
            left: 30,
            right: 30,
            bottom: -18,
            height: 18,
            borderRadius: 4,
            background: 'rgba(0,0,0,0.12)',
            filter: 'blur(6px)',
          }}
        />
      </div>

      {/* Teléfono del cliente con la cámara abierta */}
      <div
        style={{
          position: 'absolute',
          left: 1120,
          top: 140,
          opacity: phoneIn,
          transform: `translateY(${(1 - phoneIn) * 40}px) rotate(-3deg)`,
        }}
      >
        <Phone screenBg="#000">
          {/* Vista de cámara */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0b0b0b' }}>
            <div
              style={{
                position: 'absolute',
                left: camOffsetX,
                top: camOffsetY,
                transform: `scale(${camZoom})`,
                transformOrigin: `${posterW / 2}px ${qrCenterY}px`,
                filter: `blur(${focusBlur}px) saturate(0.9) brightness(0.92)`,
              }}
            >
              <CounterPoster width={posterW} style={{ boxShadow: 'none', borderRadius: 0 }} />
            </div>
            {/* viñeta de cámara */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)',
              }}
            />
          </div>

          <StatusBar dark />

          {/* Esquinas de enfoque sobre el QR */}
          <ScannerBrackets from={18} to={52} startSize={300} endSize={205} cx={SCREEN_W / 2} cy={SCREEN_H / 2 + 6} />

          {/* Pastilla de link detectado (estilo iOS) */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 150,
              transform: `translateX(-50%) translateY(${(1 - pillIn) * 20}px) scale(${0.9 + pillIn * 0.1})`,
              opacity: pillIn,
              background: '#FFD60A',
              color: '#111',
              borderRadius: 999,
              padding: '10px 16px',
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
            </svg>
            maspluss.com/registro/cafe-aroma
          </div>
          <TapRipple at={tapAt} x={SCREEN_W / 2} y={SCREEN_H - 150 - 18} />

          {/* Controles de cámara */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 60,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ width: 70, height: 70, borderRadius: '50%', border: '4px solid #fff', display: 'grid', placeItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff' }} />
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
          </div>

          {/* Transición: la pantalla se va a blanco al abrir el link */}
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: whiteout }} />
        </Phone>
      </div>

      {/* Etiqueta discreta sobre el cartel */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 96,
          fontFamily: FONT,
          color: INK,
          opacity: posterIn,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: 2, opacity: 0.6 }}>EN EL MOSTRADOR</div>
      </div>

      <Caption
        step="01"
        title="El cliente escanea el QR"
        subtitle="Con la cámara normal de su iPhone. Sin descargar ninguna app."
      />
    </AbsoluteFill>
  )
}
