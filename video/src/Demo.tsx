import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { Backdrop, BrandCorner, SceneFade } from './components/ui'
import { AddToWalletScene } from './scenes/AddToWalletScene'
import { OutroScene } from './scenes/OutroScene'
import { PurchaseScene } from './scenes/PurchaseScene'
import { ScanQrScene } from './scenes/ScanQrScene'
import { StampScene } from './scenes/StampScene'
import { SCENES } from './theme'

/**
 * Composición principal: cinco escenas encadenadas con crossfade. El fondo y el logo de la
 * esquina viven fuera de las secuencias para que no parpadeen entre escenas.
 */
export const Demo: React.FC = () => {
  let at = 0
  const seq = (dur: number, node: React.ReactNode) => {
    const from = at
    at += dur
    return (
      <Sequence key={from} from={from} durationInFrames={dur}>
        <SceneFade durationInFrames={dur}>{node}</SceneFade>
      </Sequence>
    )
  }

  return (
    <AbsoluteFill>
      <Backdrop />
      {seq(SCENES.scan, <ScanQrScene />)}
      {seq(SCENES.wallet, <AddToWalletScene />)}
      {seq(SCENES.purchase, <PurchaseScene />)}
      {seq(SCENES.stamp, <StampScene />)}
      {seq(SCENES.outro, <OutroScene />)}
      <BrandCorner />
    </AbsoluteFill>
  )
}
