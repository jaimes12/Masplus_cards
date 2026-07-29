/// Fondo naranja de marca con formas grandes con volumen 3D (gradientes tipo
/// "tubo inflado" + sombra + brillo especular) para las pantallas de
/// autenticación. Todo es SVG/CSS, nada de imágenes, así que escala nítido a
/// cualquier tamaño de pantalla.
export default function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700">
      {/* halos de color de fondo, para profundidad detrás de las formas */}
      <div className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-48 -right-32 h-[40rem] w-[40rem] rounded-full bg-orange-900/25 blur-3xl" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          {/* "tubo" con luz arriba-izquierda y sombra abajo-derecha, como un plástico inflado */}
          <linearGradient id="tube" x1="15%" y1="10%" x2="85%" y2="95%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FFD9AE" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#B84A0C" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="tag-face" x1="10%" y1="5%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#FFC79A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#A8420D" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* zigzag tipo cadena, arriba a la izquierda */}
        <g
          className="drop-shadow-[1px_2.5px_2px_rgba(120,45,0,0.4)]"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M-4 22 L10 34 L24 22 L38 34" transform="rotate(-8 17 28)" stroke="url(#tube)" strokeWidth="6.5" />
          <path
            d="M-4 22 L10 34 L24 22 L38 34"
            transform="rotate(-8 17 28)"
            stroke="#FFFFFF"
            strokeOpacity="0.55"
            strokeWidth="2"
          />
          <path d="M2 34 L12 43 L22 34" transform="rotate(-8 17 28)" stroke="url(#tube)" strokeWidth="6.5" />
          <path
            d="M2 34 L12 43 L22 34"
            transform="rotate(-8 17 28)"
            stroke="#FFFFFF"
            strokeOpacity="0.55"
            strokeWidth="2"
          />
        </g>

        {/* aro grande abierto, abajo a la izquierda (eco del logo estilizado) */}
        <g className="drop-shadow-[1.5px_3px_3px_rgba(120,45,0,0.4)]">
          <path d="M8 118 A34 34 0 1 1 60 92" fill="none" stroke="url(#tube)" strokeWidth="7.5" strokeLinecap="round" />
          <path
            d="M8 118 A34 34 0 1 1 60 92"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.5"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>

        {/* etiqueta de MasPlus (rombo redondeado + argolla), gigante y rotada, abajo a la derecha */}
        <g className="drop-shadow-[2px_4px_4px_rgba(120,45,0,0.45)]" transform="translate(72 78) rotate(18)">
          <rect x="-24" y="-24" width="48" height="48" rx="11" fill="url(#tag-face)" />
          <ellipse cx="-11" cy="-13" rx="11" ry="6.5" transform="rotate(-24 -11 -13)" fill="#FFFFFF" opacity="0.4" />
          <circle cx="24" cy="-24" r="7" fill="none" stroke="url(#tube)" strokeWidth="4" />
          <g stroke="#8A3A0A" strokeOpacity="0.5" strokeWidth="5" strokeLinecap="round">
            <line x1="-9" y1="0" x2="9" y2="0" />
            <line x1="0" y1="-9" x2="0" y2="9" />
          </g>
        </g>

        {/* zigzag chico, arriba a la derecha */}
        <g className="drop-shadow-[1px_2px_2px_rgba(120,45,0,0.4)]" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M78 6 L88 15 L98 6" transform="rotate(10 88 11)" stroke="url(#tube)" strokeWidth="5.5" />
          <path
            d="M78 6 L88 15 L98 6"
            transform="rotate(10 88 11)"
            stroke="#FFFFFF"
            strokeOpacity="0.5"
            strokeWidth="1.8"
          />
        </g>
      </svg>
    </div>
  )
}
