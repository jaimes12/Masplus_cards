/// Marca de agua difuminada con el logo de MasPlus, usada como fondo por default
/// en tarjetas que todavía no tienen una foto propia subida.
export default function MasPlusWatermark({ className = '' }) {
  return (
    <svg viewBox="0 0 400 200" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="mp-watermark-tag" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <text x="6" y="140" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="120" fill="currentColor">
        más
      </text>
      <g transform="translate(292, 28) rotate(14)">
        <rect x="0" y="14" width="92" height="112" rx="20" fill="url(#mp-watermark-tag)" />
        <circle cx="70" cy="34" r="11" fill="none" stroke="currentColor" strokeWidth="6" />
        <rect x="33" y="46" width="22" height="58" rx="5" fill="currentColor" opacity="0.9" />
        <rect x="15" y="65" width="58" height="22" rx="5" fill="currentColor" opacity="0.9" />
      </g>
    </svg>
  )
}
