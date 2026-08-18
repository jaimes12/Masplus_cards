import React from 'react'
import { AbsoluteFill } from 'remotion'
import { Backdrop, BrandCorner } from '../components/ui'
import { StampScene } from '../scenes/StampScene'

/** Tutorial "Suma sellos" (Escáner): la misma escena del demo, con su propio rótulo. */
export const DURACION_SELLOS = 240 // 8 s

export const SumarSellos: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <StampScene
      step="ESCÁNER"
      title="Suma sellos en 2 segundos"
      subtitle="Abre Escáner, apunta al QR de la tarjeta del cliente y listo: su Wallet se actualiza al instante."
    />
    <BrandCorner />
  </AbsoluteFill>
)
