import React from 'react'

export const PHONE_W = 390
export const PHONE_H = 800
const BEZEL = 12
export const SCREEN_W = PHONE_W - BEZEL * 2
export const SCREEN_H = PHONE_H - BEZEL * 2

type Props = {
  children: React.ReactNode
  style?: React.CSSProperties
  /** Fondo de la pantalla detrás del contenido. */
  screenBg?: string
}

/** Marco de teléfono estilo iPhone (bisel negro, esquinas redondas, dynamic island). */
export const Phone: React.FC<Props> = ({ children, style, screenBg = '#fff' }) => {
  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: 64,
        background: 'linear-gradient(160deg, #2b2b2e, #0f0f11)',
        boxShadow: '0 40px 90px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,255,255,0.08)',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: BEZEL,
          borderRadius: 52,
          overflow: 'hidden',
          background: screenBg,
        }}
      >
        {children}
        {/* Dynamic island */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 118,
            height: 34,
            borderRadius: 20,
            background: '#000',
          }}
        />
        {/* Home indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 130,
            height: 5,
            borderRadius: 3,
            background: 'rgba(0,0,0,0.35)',
          }}
        />
      </div>
    </div>
  )
}

/** Barra de estado iOS (hora + señal/wifi/batería). */
export const StatusBar: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const color = dark ? '#fff' : '#111'
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 30px',
        fontSize: 16,
        fontWeight: 600,
        color,
        letterSpacing: -0.2,
      }}
    >
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill={color}>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke={color} strokeOpacity="0.5" />
          <rect x="2" y="2" width="18" height="8" rx="2" fill={color} />
          <rect x="23" y="4" width="2" height="4" rx="1" fill={color} fillOpacity="0.5" />
        </svg>
      </span>
    </div>
  )
}
