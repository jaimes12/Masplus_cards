import React from 'react'
import { Img, staticFile } from 'remotion'
import { FONT, INK, INK_2, ORANGE } from '../theme'

const ITEMS = ['Inicio', 'Diseños', 'Tarjetas', 'Clientes', 'Escáner', 'Historial', 'Estadísticas', 'Notificaciones']

type Props = {
  /** Item activo del sidebar. */
  active: string
  title: string
  subtitle?: string
  width?: number
  height?: number
  children: React.ReactNode
  style?: React.CSSProperties
}

/** Ventana del panel de empresa de Más+ (sidebar + contenido), para los tutoriales del panel. */
export const PanelFrame: React.FC<Props> = ({ active, title, subtitle, width = 1400, height = 820, children, style }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 22,
      background: '#fafaf9',
      boxShadow: '0 40px 90px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      display: 'flex',
      fontFamily: FONT,
      color: INK,
      ...style,
    }}
  >
    {/* Sidebar */}
    <div style={{ width: 230, background: '#fff', borderRight: '1px solid #ECEAE7', padding: '22px 14px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 26 }}>
        <Img src={staticFile('masplus_icon.png')} style={{ width: 30, height: 30 }} />
        <div style={{ fontWeight: 700, fontSize: 18 }}>más+</div>
      </div>
      {ITEMS.map((it) => {
        const isActive = it === active
        return (
          <div
            key={it}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#fff' : INK_2,
              background: isActive ? ORANGE : 'transparent',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ width: 16, height: 16, borderRadius: 4, background: isActive ? 'rgba(255,255,255,0.35)' : '#E7E5E4', display: 'inline-block' }} />
            {it}
          </div>
        )
      })}
    </div>

    {/* Contenido */}
    <div style={{ flex: 1, minWidth: 0, padding: '28px 34px', position: 'relative' }}>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 14, color: INK_2, marginTop: 4 }}>{subtitle}</div>}
      <div style={{ marginTop: 22, position: 'relative' }}>{children}</div>
    </div>
  </div>
)

/** Campo de formulario del panel. */
export const Field: React.FC<{ label: string; children: React.ReactNode; active?: boolean; style?: React.CSSProperties }> = ({
  label,
  children,
  active,
  style,
}) => (
  <div style={{ marginBottom: 14, ...style }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: INK_2, marginBottom: 6 }}>{label}</div>
    <div
      style={{
        minHeight: 42,
        borderRadius: 12,
        border: `1.5px solid ${active ? ORANGE : '#E7E5E4'}`,
        boxShadow: active ? '0 0 0 3px rgba(249,115,22,0.15)' : 'none',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        fontSize: 15,
        background: '#fff',
        gap: 8,
      }}
    >
      {children}
    </div>
  </div>
)

/** Cursor de mouse (flecha) en la posición dada. */
export const MouseCursor: React.FC<{ x: number; y: number; pressed?: boolean }> = ({ x, y, pressed }) => (
  <svg
    width="28"
    height="34"
    viewBox="0 0 28 34"
    style={{ position: 'absolute', left: x, top: y, transform: `scale(${pressed ? 0.9 : 1})`, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))', pointerEvents: 'none', zIndex: 50 }}
  >
    <path d="M2 2 L2 26 L8.5 20.5 L13 30 L17.5 28 L13 18.5 L22 18.5 Z" fill="#111" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
  </svg>
)
