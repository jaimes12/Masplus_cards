import React from 'react'
import { Composition } from 'remotion'
import { Demo } from './Demo'
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from './theme'
import { CrearTarjeta, DURACION_CREAR } from './tutorials/CrearTarjeta'
import { DURACION_QR, ImprimirQr } from './tutorials/ImprimirQr'
import { DURACION_NOTIF, Notificaciones } from './tutorials/Notificaciones'
import { DURACION_SELLOS, SumarSellos } from './tutorials/SumarSellos'

export const RemotionRoot: React.FC = () => (
  <>
    {/* Demo completo (landing + "Cómo usar") */}
    <Composition id="Demo" component={Demo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Tutoriales por sección del panel */}
    <Composition id="TutorialCrearTarjeta" component={CrearTarjeta} durationInFrames={DURACION_CREAR} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="TutorialImprimirQr" component={ImprimirQr} durationInFrames={DURACION_QR} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="TutorialSumarSellos" component={SumarSellos} durationInFrames={DURACION_SELLOS} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="TutorialNotificaciones" component={Notificaciones} durationInFrames={DURACION_NOTIF} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
)
