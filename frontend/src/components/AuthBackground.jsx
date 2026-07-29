import figuraIzquierda from '../assets/figuras_naranjas1.webp'
import figuraDerecha from '../assets/figura_naranja2.webp'

/// Fondo naranja de marca con las figuras 3D reales (renders provistos) a los
/// costados de la tarjeta de login/registro.
export default function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700">
      <img
        src={figuraIzquierda}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/2 h-[125vh] w-auto -translate-y-1/2 select-none md:-left-10 lg:left-4"
      />
      <img
        src={figuraDerecha}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/2 h-[125vh] w-auto -translate-y-1/2 -scale-x-100 select-none md:-right-10 lg:right-4"
      />
    </div>
  )
}
