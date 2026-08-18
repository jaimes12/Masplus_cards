import React from 'react'
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { LoyaltyCard } from '../components/LoyaltyCard'
import { Phone, SCREEN_H, SCREEN_W, StatusBar } from '../components/Phone'
import { Caption, OrangeButton, TapRipple, Typewriter } from '../components/ui'
import { CAFE, CUSTOMER, FONT, INK, INK_2, INK_3 } from '../theme'

const Field: React.FC<{ label: string; children: React.ReactNode; active?: boolean }> = ({ label, children, active }) => (
  <div style={{ marginTop: 14 }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: INK_2, marginBottom: 6 }}>{label}</div>
    <div
      style={{
        height: 46,
        borderRadius: 12,
        border: `1.5px solid ${active ? '#F97316' : '#E7E5E4'}`,
        boxShadow: active ? '0 0 0 3px rgba(249,115,22,0.15)' : 'none',
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        fontSize: 15,
        color: INK,
        background: '#fff',
      }}
    >
      {children}
    </div>
  </div>
)

/**
 * Escena 2 — Se abre la página de registro del negocio (Más+): el cliente escribe su nombre y
 * teléfono, crea su tarjeta y la agrega a Apple Wallet. La hoja nativa de Wallet sube, toca
 * "Agregar" y la tarjeta queda en su Wallet.
 */
export const AddToWalletScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const phoneIn = spring({ frame, fps, config: { damping: 200, stiffness: 100 } })

  // Timeline (frames locales)
  const T = {
    typeNameFrom: 12,
    typeNameTo: 40,
    typePhoneFrom: 46,
    typePhoneTo: 74,
    tapCrear: 86,
    listoFrom: 92, // aparece "¡Listo!" + tarjeta + botón Apple Wallet
    tapWallet: 124,
    sheetFrom: 128, // hoja de Wallet sube
    tapAgregar: 166,
    sheetOutFrom: 170,
    walletFrom: 176, // vista de la app Wallet con la tarjeta
  }

  const listoP = spring({ frame: frame - T.listoFrom, fps, config: { damping: 200, stiffness: 110 } })
  const sheetUp = spring({ frame: frame - T.sheetFrom, fps, config: { damping: 22, stiffness: 150, mass: 0.9 } })
  const sheetDown = spring({ frame: frame - T.sheetOutFrom, fps, config: { damping: 200, stiffness: 140 } })
  const sheetY = interpolate(sheetUp, [0, 1], [SCREEN_H, 0]) + interpolate(sheetDown, [0, 1], [0, SCREEN_H])
  const walletP = spring({ frame: frame - T.walletFrom, fps, config: { damping: 200, stiffness: 110 } })

  const showForm = frame < T.listoFrom
  const showWalletApp = frame >= T.walletFrom - 6

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 960 - 195,
          top: 130,
          opacity: phoneIn,
          transform: `translateY(${(1 - phoneIn) * 30}px)`,
        }}
      >
        <Phone screenBg="#fff">
          {/* ---- Página de registro (web, estilo Más+) ---- */}
          {!showWalletApp && (
            <div style={{ position: 'absolute', inset: 0, fontFamily: FONT }}>
              {/* Header del negocio */}
              <div
                style={{
                  background: `linear-gradient(160deg, ${CAFE.bg1}, ${CAFE.bg2})`,
                  height: 150,
                  padding: '64px 22px 0',
                  color: '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: CAFE.accent }} />
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{CAFE.name}</div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>Programa de lealtad</div>
                  </div>
                </div>
              </div>

              {showForm ? (
                <div style={{ padding: '22px 22px 0' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: INK, letterSpacing: -0.4 }}>Únete y junta sellos</div>
                  <div style={{ fontSize: 14, color: INK_2, marginTop: 4 }}>
                    Junta {CAFE.totalStamps} sellos y tu café es gratis.
                  </div>

                  <Field label="Nombre" active={frame >= T.typeNameFrom && frame < T.typePhoneFrom}>
                    {frame >= T.typeNameFrom ? (
                      <Typewriter text={CUSTOMER.name} from={T.typeNameFrom} to={T.typeNameTo} cursor={frame < T.typePhoneFrom} />
                    ) : (
                      <span style={{ color: INK_3 }}>Tu nombre</span>
                    )}
                  </Field>
                  <Field label="Teléfono" active={frame >= T.typePhoneFrom && frame < T.tapCrear}>
                    {frame >= T.typePhoneFrom ? (
                      <Typewriter text={CUSTOMER.phone} from={T.typePhoneFrom} to={T.typePhoneTo} cursor={frame < T.tapCrear} />
                    ) : (
                      <span style={{ color: INK_3 }}>10 dígitos</span>
                    )}
                  </Field>

                  <OrangeButton style={{ marginTop: 22 }}>Crear mi tarjeta</OrangeButton>
                  <TapRipple at={T.tapCrear} x={SCREEN_W / 2} y={150 + 22 + 30 + 20 + 14 + 68 + 14 + 68 + 22 + 24} />

                  <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: INK_3 }}>
                    Al continuar aceptas recibir avisos de {CAFE.name}.
                  </div>
                </div>
              ) : (
                <div style={{ padding: '18px 22px 0', opacity: listoP, transform: `translateY(${(1 - listoP) * 16}px)` }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: INK, letterSpacing: -0.4 }}>¡Listo, {CUSTOMER.name}! 🎉</div>
                  <div style={{ fontSize: 14, color: INK_2, marginTop: 4 }}>Tu tarjeta está creada. Guárdala en tu Wallet:</div>

                  <div style={{ display: 'grid', placeItems: 'center', marginTop: 16 }}>
                    <LoyaltyCard width={250} stamps={0} showQr={false} />
                  </div>

                  <div style={{ display: 'grid', placeItems: 'center', marginTop: 18, position: 'relative' }}>
                    <Img src={staticFile('add-to-apple-wallet-logo.png')} style={{ height: 52, objectFit: 'contain' }} />
                    <TapRipple at={T.tapWallet} x={SCREEN_W / 2 - 22} y={26} />
                  </div>
                </div>
              )}
              <StatusBar dark={true} />
            </div>
          )}

          {/* ---- App Wallet con la tarjeta ya agregada ---- */}
          {showWalletApp && (
            <div style={{ position: 'absolute', inset: 0, background: '#000', fontFamily: FONT, opacity: walletP }}>
              <StatusBar dark />
              <div style={{ position: 'absolute', top: 64, left: 22, right: 22, color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.6 }}>Wallet</div>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2c2c2e', display: 'grid', placeItems: 'center', fontSize: 20 }}>+</div>
                </div>
              </div>
              {/* Tarjeta al frente */}
              <div
                style={{
                  position: 'absolute',
                  top: 122,
                  left: 14,
                  transform: `translateY(${(1 - walletP) * 40}px)`,
                }}
              >
                <LoyaltyCard width={SCREEN_W - 28} stamps={0} showQr={false} />
              </div>
              {/* Otros pases detrás (genéricos) */}
              {[0, 1].map((i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 122 + 292 + i * 62,
                    left: 14,
                    width: SCREEN_W - 28,
                    height: 160,
                    borderRadius: 20,
                    background: i === 0 ? 'linear-gradient(160deg,#1f3a5f,#2b4f80)' : 'linear-gradient(160deg,#4a4a4f,#2f2f33)',
                    boxShadow: '0 -8px 24px rgba(0,0,0,0.5)',
                    zIndex: -1,
                  }}
                />
              ))}
              {/* Confirmación */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 64,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  opacity: walletP,
                }}
              >
                <div
                  style={{
                    background: 'rgba(52,199,89,0.16)',
                    color: '#34C759',
                    border: '1px solid rgba(52,199,89,0.5)',
                    borderRadius: 999,
                    padding: '8px 14px',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  ✓ Tarjeta agregada a Wallet
                </div>
              </div>
            </div>
          )}

          {/* ---- Hoja nativa "Agregar pase" de Wallet ---- */}
          {frame >= T.sheetFrom && frame < T.walletFrom + 4 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `rgba(0,0,0,${interpolate(sheetUp, [0, 1], [0, 0.45]) * (1 - sheetDown)})`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: SCREEN_H - 40,
                  transform: `translateY(${sheetY}px)`,
                  background: '#1c1c1e',
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  fontFamily: FONT,
                  color: '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px' }}>
                  <span style={{ color: '#0A84FF', fontSize: 16 }}>Cancelar</span>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>Agregar pase</span>
                  <span style={{ color: '#0A84FF', fontSize: 16, fontWeight: 600, position: 'relative' }}>
                    Agregar
                    <TapRipple at={T.tapAgregar} x={28} y={10} size={54} />
                  </span>
                </div>
                <div style={{ display: 'grid', placeItems: 'center', marginTop: 10 }}>
                  <LoyaltyCard width={300} stamps={0} showQr />
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, color: '#8e8e93', marginTop: 16, padding: '0 30px', lineHeight: 1.4 }}>
                  Este pase se actualizará automáticamente cuando {CAFE.name} te sume sellos.
                </div>
              </div>
            </div>
          )}
        </Phone>
      </div>

      <Caption
        step="02"
        title="Agrega su tarjeta a Apple Wallet"
        subtitle="Escribe su nombre, toca un botón, y la tarjeta ya vive en su iPhone."
      />
    </AbsoluteFill>
  )
}
