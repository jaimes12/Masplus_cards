/// Fondo naranja de marca con formas grandes (zigzags tipo cadena, un aro y la
/// etiqueta de MasPlus) para las pantallas de autenticación. Todo es SVG/CSS,
/// nada de imágenes, así que escala nítido a cualquier tamaño de pantalla.
export default function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700">
      {/* halos de color de fondo, para profundidad detrás de las formas nítidas */}
      <div className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-48 -right-32 h-[40rem] w-[40rem] rounded-full bg-orange-900/25 blur-3xl" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* zigzag tipo cadena, arriba a la izquierda */}
        <g opacity="0.16" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-4 22 L10 34 L24 22 L38 34" transform="rotate(-8 17 28)" />
          <path d="M2 34 L12 43 L22 34" transform="rotate(-8 17 28)" />
        </g>

        {/* aro grande abierto, abajo a la izquierda (eco del logo estilizado) */}
        <path
          d="M8 118 A34 34 0 1 1 60 92"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.14"
        />

        {/* etiqueta de MasPlus (rombo redondeado + argolla), gigante y rotada, abajo a la derecha */}
        <g opacity="0.14" fill="#FFFFFF" transform="translate(72 78) rotate(18)">
          <rect x="-24" y="-24" width="48" height="48" rx="11" />
          <circle cx="24" cy="-24" r="7" fill="none" stroke="#FFFFFF" strokeWidth="4" />
          <g stroke="#FF9142" strokeWidth="5" strokeLinecap="round">
            <line x1="-9" y1="0" x2="9" y2="0" />
            <line x1="0" y1="-9" x2="0" y2="9" />
          </g>
        </g>

        {/* zigzag chico, arriba a la derecha */}
        <g opacity="0.13" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M78 6 L88 15 L98 6" transform="rotate(10 88 11)" />
        </g>
      </svg>
    </div>
  )
}
