// Tokens compartidos del video. Los naranjas empatan con la landing (tailwind orange-500/600);
// la marca ficticia "Café Aroma" usa una paleta café/crema para que la tarjeta se lea como
// la de un negocio real y no como material de Más+.
export const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", Helvetica, Arial, sans-serif'

export const ORANGE = '#F97316'
export const ORANGE_DARK = '#EA580C'
export const INK = '#1C1917'
export const INK_2 = '#57534E'
export const INK_3 = '#A8A29E'
export const CREAM = '#FFF7ED'

export const CAFE = {
  name: 'Café Aroma',
  bg1: '#3E2723',
  bg2: '#5D4037',
  accent: '#D7A86E',
  cream: '#FFF3E0',
  totalStamps: 8,
}

export const CUSTOMER = { name: 'Mariana', phone: '449 123 4567' }

export const FPS = 30
export const WIDTH = 1920
export const HEIGHT = 1080

// Duración por escena en frames (30 fps).
export const SCENES = {
  scan: 150,      // 5.0 s
  wallet: 200,    // 6.7 s
  purchase: 105,  // 3.5 s
  stamp: 210,     // 7.0 s
  outro: 75,      // 2.5 s
}
export const TOTAL_FRAMES = Object.values(SCENES).reduce((a, b) => a + b, 0)
