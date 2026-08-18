import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { LoyaltyCard } from '../components/LoyaltyCard'
import { MouseCursor, PanelFrame } from '../components/PanelFrame'
import { Backdrop, BrandCorner, Caption, CounterPoster, OrangeButton } from '../components/ui'
import { CAFE, FONT, INK, INK_2, INK_3, ORANGE } from '../theme'

/**
 * Tutorial "Imprime tu QR" (Diseños): desde la tarjeta del diseño se abre el editor del cartel,
 * se descarga el PDF y el cartel termina en el mostrador.
 */
export const DURACION_QR = 330 // 11 s

export const ImprimirQr: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const T = {
    clickQr: 60, // click en "Código QR" de la tarjeta
    editor: 70, // aparece el editor del cartel
    clickPdf: 170,
    descargado: 182,
    mostrador: 215, // el panel se va, el cartel aparece en el mostrador
  }

  const panelIn = spring({ frame, fps, config: { damping: 200, stiffness: 90 } })
  const editorP = spring({ frame: frame - T.editor, fps, config: { damping: 200, stiffness: 120 } })
  const toastP = spring({ frame: frame - T.descargado, fps, config: { damping: 16, stiffness: 160 } })
  const panelOut = spring({ frame: frame - T.mostrador, fps, config: { damping: 200, stiffness: 100 } })
  const posterIn = spring({ frame: frame - T.mostrador - 8, fps, config: { damping: 18, stiffness: 100 } })

  const cursor = (() => {
    const path: [number, number, number][] = [
      [0, 700, 400],
      [T.clickQr - 10, 158, 300],
      [T.editor + 30, 158, 300],
      [T.clickPdf - 12, 110, 332],
      [T.mostrador, 110, 332],
    ]
    const frames = path.map((p) => p[0])
    return {
      x: interpolate(frame, frames, path.map((p) => p[1]), { extrapolateRight: 'clamp' }),
      y: interpolate(frame, frames, path.map((p) => p[2]), { extrapolateRight: 'clamp' }),
    }
  })()
  const pressed = [T.clickQr, T.clickPdf].some((t) => frame >= t && frame < t + 6)

  const showEditor = frame >= T.editor

  return (
    <AbsoluteFill>
      <Backdrop />

      {/* Panel */}
      <div
        style={{
          position: 'absolute',
          left: 660,
          top: 100,
          opacity: panelIn * (1 - panelOut),
          transform: `translateY(${(1 - panelIn) * 30 - panelOut * 20}px) scale(${1 - panelOut * 0.04})`,
        }}
      >
        <PanelFrame active="Diseños" title={showEditor ? 'Cartel con QR' : 'Diseños'} subtitle={showEditor ? 'Imprímelo y ponlo en el mostrador para que tus clientes se registren.' : 'Tus tarjetas de lealtad.'} width={1180} height={700}>
          {!showEditor ? (
            /* Lista de diseños: la tarjeta activa con sus acciones */
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ width: 300, background: '#fff', border: '1px solid #ECEAE7', borderRadius: 18, padding: 18 }}>
                <LoyaltyCard width={264} stamps={0} showQr={false} nombreCliente="Vista previa" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: INK }}>{CAFE.name}</div>
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: 999 }}>Activa</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <div style={{ flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 10, border: '1.5px solid #E7E5E4', fontSize: 13, fontWeight: 600, color: INK_2 }}>Editar</div>
                  <div style={{ flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 10, background: ORANGE, color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 6px 16px rgba(249,115,22,0.35)' }}>Código QR</div>
                </div>
              </div>
              <div style={{ width: 300, borderRadius: 18, border: '1.5px dashed #D6D3D1', display: 'grid', placeItems: 'center', color: INK_3, fontSize: 14, minHeight: 300 }}>+ Nuevo diseño</div>
            </div>
          ) : (
            /* Editor del cartel */
            <div style={{ display: 'flex', gap: 40, opacity: editorP }}>
              <div style={{ width: 400 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: INK_2, marginBottom: 8 }}>Título del cartel</div>
                <div style={{ height: 42, borderRadius: 12, border: '1.5px solid #E7E5E4', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 15, marginBottom: 14 }}>Escanea y suma sellos</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: INK_2, marginBottom: 8 }}>Subtítulo</div>
                <div style={{ height: 42, borderRadius: 12, border: '1.5px solid #E7E5E4', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 15, marginBottom: 14 }}>Junta {CAFE.totalStamps} y tu café es gratis</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: INK_2, marginBottom: 8 }}>Color del encabezado</div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  {[CAFE.bg1, '#1E3A5F', '#14532D', ORANGE].map((c, i) => (
                    <div key={i} style={{ width: 40, height: 40, borderRadius: 12, background: c, boxShadow: i === 0 ? '0 0 0 3px #fff, 0 0 0 6px #F97316' : '0 1px 3px rgba(0,0,0,0.2)' }} />
                  ))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: INK_2, marginBottom: 8 }}>Tamaño</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                  {['Carta', 'Media carta', 'A5'].map((t, i) => (
                    <div key={t} style={{ padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: i === 1 ? INK : '#fff', color: i === 1 ? '#fff' : INK_2, border: '1.5px solid #E7E5E4' }}>{t}</div>
                  ))}
                </div>
                <OrangeButton style={{ width: 240 }}>⬇ Descargar PDF</OrangeButton>
              </div>
              <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
                <div style={{ transform: 'scale(0.9)' }}>
                  <CounterPoster width={320} />
                </div>
              </div>
            </div>
          )}

          <MouseCursor x={cursor.x} y={cursor.y} pressed={pressed} />

          <div
            style={{
              position: 'absolute',
              right: 0,
              top: -10,
              opacity: toastP * (1 - panelOut),
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
            ✓ cartel-cafe-aroma.pdf descargado
          </div>
        </PanelFrame>
      </div>

      {/* Cartel físico en el mostrador */}
      {frame >= T.mostrador && (
        <div
          style={{
            position: 'absolute',
            left: 1010,
            top: 180,
            opacity: posterIn,
            transform: `perspective(1400px) rotateY(-14deg) rotateX(2deg) translateY(${(1 - posterIn) * 40}px)`,
          }}
        >
          <CounterPoster width={440} />
          <div style={{ position: 'absolute', left: 30, right: 30, bottom: -18, height: 18, borderRadius: 4, background: 'rgba(0,0,0,0.12)', filter: 'blur(6px)' }} />
        </div>
      )}
      {frame >= T.mostrador && (
        <div style={{ position: 'absolute', left: 1010, top: 130, fontFamily: FONT, fontSize: 16, fontWeight: 600, letterSpacing: 2, color: INK_2, opacity: posterIn }}>
          EN TU MOSTRADOR
        </div>
      )}

      <Caption
        step="DISEÑOS · CÓDIGO QR"
        title={frame < T.mostrador ? 'Descarga tu cartel con QR' : 'Ponlo donde tus clientes lo vean'}
        subtitle={
          frame < T.mostrador
            ? 'Desde tu diseño, toca "Código QR", elige colores y tamaño, y descarga el PDF listo para imprimir.'
            : 'Al escanearlo, se registran y agregan su tarjeta a Wallet en menos de un minuto.'
        }
        maxWidth={560}
      />
      <BrandCorner />
    </AbsoluteFill>
  )
}
