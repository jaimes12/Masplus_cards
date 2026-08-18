import React from 'react'
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { FONT, INK, INK_2, ORANGE } from '../theme'

/** Escena 5 — Cierre: logo Más+, promesa y llamada a la acción. */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const logoP = spring({ frame, fps, config: { damping: 16, stiffness: 120 } })
  const textP = spring({ frame: frame - 10, fps, config: { damping: 200, stiffness: 100 } })
  const ctaP = spring({ frame: frame - 22, fps, config: { damping: 200, stiffness: 100 } })

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
      <Img
        src={staticFile('masplus_logo_wide.png')}
        style={{
          width: 420,
          objectFit: 'contain',
          transform: `scale(${interpolate(logoP, [0, 1], [0.8, 1])})`,
          opacity: logoP,
        }}
      />
      <div
        style={{
          marginTop: 36,
          fontSize: 44,
          fontWeight: 700,
          color: INK,
          letterSpacing: -1,
          textAlign: 'center',
          maxWidth: 1000,
          lineHeight: 1.15,
          opacity: textP,
          transform: `translateY(${(1 - textP) * 20}px)`,
        }}
      >
        Tu programa de lealtad, en el celular de tus clientes.
      </div>
      <div
        style={{
          marginTop: 26,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          opacity: ctaP,
          transform: `translateY(${(1 - ctaP) * 20}px)`,
        }}
      >
        <div
          style={{
            background: ORANGE,
            color: '#fff',
            fontWeight: 700,
            fontSize: 22,
            borderRadius: 999,
            padding: '14px 28px',
            boxShadow: '0 12px 30px rgba(249,115,22,0.35)',
          }}
        >
          Crea tu primera tarjeta gratis
        </div>
        <div style={{ fontSize: 22, color: INK_2, fontWeight: 600 }}>maspluss.com</div>
      </div>
    </AbsoluteFill>
  )
}
