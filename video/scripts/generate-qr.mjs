// Genera los QR estáticos que usa el video (se ejecuta una vez; los SVG quedan en public/).
import QRCode from 'qrcode'
import { writeFileSync } from 'fs'

const targets = {
  'qr-registro.svg': 'https://www.maspluss.com/registro/cafe-aroma',
  'qr-tarjeta.svg': 'https://www.maspluss.com/wallet/mariana-cafe-aroma',
}
for (const [file, url] of Object.entries(targets)) {
  const svg = await QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#111111', light: '#00000000' } })
  writeFileSync(new URL(`../public/${file}`, import.meta.url), svg)
  console.log('ok', file)
}
