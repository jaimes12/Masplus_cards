import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { LoyaltyCard } from '../components/LoyaltyCard'
import { Field, MouseCursor, PanelFrame } from '../components/PanelFrame'
import { Backdrop, BrandCorner, Caption, OrangeButton, Typewriter } from '../components/ui'
import { CAFE, INK_2, INK_3 } from '../theme'

/**
 * Tutorial "Crea tu tarjeta" (sección Diseños): el formulario del panel a la izquierda y la
 * vista previa en vivo a la derecha. Se escribe el nombre, se elige un color, se ajustan los
 * sellos requeridos, y se guarda.
 */
export const DURACION_CREAR = 480 // 16 s

const PALETA = [
  { bg1: '#3E2723', bg2: '#5D4037', accent: '#D7A86E' }, // café (final)
  { bg1: '#1E3A5F', bg2: '#2B4F80', accent: '#8EC5FF' }, // azul
  { bg1: '#14532D', bg2: '#166534', accent: '#86EFAC' }, // verde
  { bg1: '#7C2D12', bg2: '#9A3412', accent: '#FDBA74' }, // terracota
]

export const CrearTarjeta: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const T = {
    typeFrom: 30,
    typeTo: 80,
    colorHover: 120,
    colorClick: 150, // se elige el café (índice 0), tras pasar por el terracota
    sellosClick: 220, // sellos 10 → 8
    guardarClick: 330,
    toast: 345,
  }

  const panelIn = spring({ frame, fps, config: { damping: 200, stiffness: 90 } })

  // Color: arranca en azul (default), pasa por terracota al hover, y queda café al click.
  const paleta = frame < T.colorHover ? PALETA[1] : frame < T.colorClick ? PALETA[3] : PALETA[0]
  const nombre = frame < T.typeFrom ? '' : CAFE.name
  const sellos = frame < T.sellosClick ? 10 : 8

  // Cursor: recorrido por los controles.
  const cursor = (() => {
    // Coordenadas relativas al área de contenido del panel (form de 400px de ancho).
    const path: [number, number, number][] = [
      [0, 620, 300],
      [T.typeFrom - 8, 300, 45],
      [T.colorHover - 20, 190, 122],
      [T.colorClick, 22, 122],
      [T.sellosClick - 12, 326, 205],
      [T.guardarClick - 20, 100, 416],
      [DURACION_CREAR, 100, 416],
    ]
    const frames = path.map((p) => p[0])
    const x = interpolate(frame, frames, path.map((p) => p[1]), { extrapolateRight: 'clamp' })
    const y = interpolate(frame, frames, path.map((p) => p[2]), { extrapolateRight: 'clamp' })
    return { x, y }
  })()
  const pressed = [T.colorClick, T.sellosClick, T.guardarClick].some((t) => frame >= t && frame < t + 6)

  const toastP = spring({ frame: frame - T.toast, fps, config: { damping: 16, stiffness: 160 } })
  const cardPop = spring({ frame: frame - T.colorClick, fps, config: { damping: 12, stiffness: 200 } })

  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: 'absolute', left: 660, top: 100, opacity: panelIn, transform: `translateY(${(1 - panelIn) * 30}px)` }}>
        <PanelFrame active="Diseños" title="Nuevo diseño" subtitle="Así se verá la tarjeta en el Wallet de tus clientes." width={1180} height={700}>
          <div style={{ display: 'flex', gap: 40 }}>
            {/* Formulario */}
            <div style={{ width: 400 }}>
              <Field label="Nombre del negocio" active={frame >= T.typeFrom && frame < T.typeTo + 10}>
                {frame >= T.typeFrom ? <Typewriter text={CAFE.name} from={T.typeFrom} to={T.typeTo} cursor={frame < T.typeTo + 10} /> : <span style={{ color: INK_3 }}>Ej. Café Aroma</span>}
              </Field>

              <div style={{ fontSize: 12, fontWeight: 600, color: INK_2, marginBottom: 8 }}>Color principal</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {[PALETA[0], PALETA[1], PALETA[2], PALETA[3]].map((c, i) => {
                  const selected = c === paleta
                  return (
                    <div
                      key={i}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `linear-gradient(160deg, ${c.bg1}, ${c.bg2})`,
                        boxShadow: selected ? '0 0 0 3px #fff, 0 0 0 6px #F97316' : '0 1px 3px rgba(0,0,0,0.2)',
                        transform: selected ? 'scale(1.06)' : 'scale(1)',
                      }}
                    />
                  )
                })}
                <div style={{ width: 44, height: 44, borderRadius: 12, border: '1.5px dashed #D6D3D1', display: 'grid', placeItems: 'center', color: INK_3, fontSize: 20 }}>+</div>
              </div>

              <Field label="Sellos para el premio" active={frame >= T.sellosClick && frame < T.sellosClick + 20}>
                <span style={{ flex: 1 }}>{sellos}</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: '#F5F5F4', display: 'grid', placeItems: 'center', fontWeight: 700 }}>−</span>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: '#F5F5F4', display: 'grid', placeItems: 'center', fontWeight: 700 }}>+</span>
                </span>
              </Field>

              <Field label="Ícono del sello">
                <span style={{ fontSize: 18 }}>☕</span>
                <span style={{ color: INK_2, fontSize: 14 }}>Taza de café</span>
              </Field>

              <Field label="Logo">
                <span style={{ color: INK_2, fontSize: 14 }}>logo-cafe-aroma.png</span>
                <span style={{ marginLeft: 'auto', color: '#F97316', fontSize: 13, fontWeight: 600 }}>Cambiar</span>
              </Field>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <OrangeButton style={{ width: 200, position: 'relative' }}>Guardar diseño</OrangeButton>
                <div style={{ padding: '14px 18px', borderRadius: 12, border: '1.5px solid #E7E5E4', fontSize: 15, fontWeight: 600, color: INK_2 }}>Cancelar</div>
              </div>
            </div>

            {/* Vista previa en vivo */}
            <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: INK_3, letterSpacing: 1.5, marginBottom: 12, textAlign: 'center' }}>VISTA PREVIA EN VIVO</div>
                <div style={{ transform: `scale(${interpolate(cardPop, [0, 1], [0.97, 1])})` }}>
                  <LoyaltyCard width={300} stamps={0} showQr nombreNegocio={nombre} bg1={paleta.bg1} bg2={paleta.bg2} accent={paleta.accent} total={sellos} nombreCliente="Tu cliente" />
                </div>
              </div>
            </div>
          </div>

          <MouseCursor x={cursor.x} y={cursor.y} pressed={pressed} />

          {/* Toast guardado */}
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
            ✓ Diseño guardado y activo
          </div>
        </PanelFrame>
      </div>

      <Caption
        step="DISEÑOS"
        title="Crea tu tarjeta en 1 minuto"
        subtitle="Nombre, color, sellos e ícono. La ves en vivo tal como la verán tus clientes."
        maxWidth={560}
      />
      <BrandCorner />
    </AbsoluteFill>
  )
}
