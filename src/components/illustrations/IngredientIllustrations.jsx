// ============================================
// ILUSTRACIONES - INGREDIENTES
// Componentes SVG de proteínas, complementos y base
// ============================================

// Paleta bowl negro de porcelana
const BOWL_HIGHLIGHT = '#FFFFFF'
const BOWL_RIM = '#374151'

const STEAK_BASE = '#991B1B'
const STEAK_GRILL = '#450A0A'
const CHICKEN_BASE = '#FEF3C7'
const CHICKEN_SHADOW = '#D97706'
const CHORIZO_BASE = '#DC2626'
const CHORIZO_FAT = '#FECACA'
const AVO_LIGHT = '#D9F99D'
const AVO_DARK = '#65A30D'
const ONION_CARAMEL_BASE = '#B45309'
const ONION_CARAMEL_LIGHT = '#FBBF24'
const CHEESE_BASE = '#FEFCE8'
const CHEESE_SHADOW = '#FDE047'
const ONION_WHITE = '#FFFFFF'
const CILANTRO_BASE = '#4ADE80'
const CREAM_BASE = '#FFFFFF'
const CREAM_SHADOW = '#DBEAFE'

// Bowl reutilizable
const BlackPorcelainBowl = ({ children }) => (
  <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <defs>
      <linearGradient id="blackBodyGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#111827" />
        <stop offset="0.3" stopColor="#374151" />
        <stop offset="1" stopColor="#1F2937" />
      </linearGradient>
      <linearGradient id="blackInnerGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000000" stopOpacity="0.8" />
        <stop offset="1" stopColor="#1F2937" />
      </linearGradient>
    </defs>
    <g transform="translate(25, 35)">
      <ellipse cx="75" cy="100" rx="65" ry="12" fill="#000000" fillOpacity="0.3" />
      <path d="M10 30 L10 70 Q10 95 35 100 L115 100 Q140 95 140 70 L140 30" fill="url(#blackBodyGrad)" />
      <path d="M10 30 L35 15 L115 15 L140 30 L115 45 L35 45 L10 30 Z" fill={BOWL_RIM} />
      <path d="M15 30 L37 19 L113 19 L135 30 L113 41 L37 41 L15 30 Z" fill="url(#blackInnerGrad)" />
      <g transform="translate(0, -5)">{children}</g>
      <path d="M10 30 L35 45 L115 45 L140 30" stroke={BOWL_HIGHLIGHT} strokeWidth="1" strokeOpacity="0.3" fill="none" />
      <path d="M35 45 L115 45" stroke={BOWL_HIGHLIGHT} strokeWidth="2" strokeOpacity="0.1" fill="none" strokeLinecap="round" />
      <path d="M12 32 L12 80" stroke={BOWL_HIGHLIGHT} strokeWidth="2" strokeOpacity="0.1" fill="none" strokeLinecap="round" />
      <path d="M35 15 L115 15" stroke={BOWL_HIGHLIGHT} strokeWidth="1" strokeOpacity="0.4" fill="none" />
    </g>
  </svg>
)

// PROTEÍNAS
export const IllustrationSteak = () => (
  <BlackPorcelainBowl>
    <g transform="translate(25, 10)">
      <path d="M10 20 L40 10 L60 30 L30 40 Z" fill={STEAK_BASE} stroke={STEAK_GRILL} strokeWidth="1" />
      <path d="M35 25 L65 15 L85 35 L55 45 Z" fill={STEAK_BASE} stroke={STEAK_GRILL} strokeWidth="1" />
      <path d="M60 20 L90 10 L110 30 L80 40 Z" fill={STEAK_BASE} stroke={STEAK_GRILL} strokeWidth="1" />
      <path d="M20 25 L30 30" stroke="#000" strokeOpacity="0.4" strokeWidth="2" />
      <path d="M45 25 L55 30" stroke="#000" strokeOpacity="0.4" strokeWidth="2" />
      <path d="M70 20 L80 25" stroke="#000" strokeOpacity="0.4" strokeWidth="2" />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationPollo = () => (
  <BlackPorcelainBowl>
    <g transform="translate(25, 10)">
      <path d="M20 30 Q50 5 80 30 T 110 30 L100 45 L30 45 Z" fill={CHICKEN_BASE} />
      <path d="M30 35 L40 25" stroke={CHICKEN_SHADOW} strokeWidth="2" strokeLinecap="round" />
      <path d="M50 30 L60 20" stroke={CHICKEN_SHADOW} strokeWidth="2" strokeLinecap="round" />
      <path d="M70 32 L80 22" stroke={CHICKEN_SHADOW} strokeWidth="2" strokeLinecap="round" />
      <path d="M90 35 L100 25" stroke={CHICKEN_SHADOW} strokeWidth="2" strokeLinecap="round" />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationChorizo = () => (
  <BlackPorcelainBowl>
    <g transform="translate(30, 15)">
      <circle cx="20" cy="20" r="8" fill={CHORIZO_BASE} />
      <circle cx="40" cy="15" r="9" fill={CHORIZO_BASE} />
      <circle cx="60" cy="22" r="8" fill={CHORIZO_BASE} />
      <circle cx="80" cy="18" r="9" fill={CHORIZO_BASE} />
      <circle cx="50" cy="30" r="8" fill={CHORIZO_BASE} />
      <circle cx="30" cy="28" r="7" fill={CHORIZO_BASE} />
      <circle cx="38" cy="15" r="2" fill={CHORIZO_FAT} />
      <circle cx="62" cy="20" r="2" fill={CHORIZO_FAT} />
      <circle cx="82" cy="16" r="2" fill={CHORIZO_FAT} />
    </g>
  </BlackPorcelainBowl>
)

// COMPLEMENTOS
export const IllustrationAguacate = () => (
  <BlackPorcelainBowl>
    <g transform="translate(30, 10)">
      <path d="M10 20 L30 15 L40 25 L20 30 Z" fill={AVO_LIGHT} stroke={AVO_DARK} strokeWidth="1" />
      <path d="M20 30 L40 25 L40 35 L20 40 Z" fill={AVO_DARK} />
      <path d="M45 15 L65 10 L75 20 L55 25 Z" fill={AVO_LIGHT} stroke={AVO_DARK} strokeWidth="1" />
      <path d="M55 25 L75 20 L75 30 L55 35 Z" fill={AVO_DARK} />
      <path d="M30 30 L50 25 L60 35 L40 40 Z" fill={AVO_LIGHT} stroke={AVO_DARK} strokeWidth="1" />
      <path d="M70 25 L90 20 L100 30 L80 35 Z" fill={AVO_LIGHT} stroke={AVO_DARK} strokeWidth="1" />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationCebollaCaramel = () => (
  <BlackPorcelainBowl>
    <g transform="translate(25, 15)">
      <path d="M10 20 Q30 5 50 25 T90 20" stroke={ONION_CARAMEL_BASE} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M20 30 Q40 15 60 35 T100 30" stroke={ONION_CARAMEL_LIGHT} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M15 25 Q35 10 55 30 T95 25" stroke={ONION_CARAMEL_BASE} strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationQuesoExtra = () => (
  <BlackPorcelainBowl>
    <g transform="translate(25, 10)">
      <path d="M20 40 Q60 5 100 40 Z" fill={CHEESE_BASE} />
      <line x1="30" y1="35" x2="40" y2="25" stroke={CHEESE_SHADOW} strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="20" x2="60" y2="30" stroke={CHEESE_SHADOW} strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="25" x2="80" y2="15" stroke={CHEESE_SHADOW} strokeWidth="2" strokeLinecap="round" />
      <line x1="90" y1="35" x2="85" y2="25" stroke={CHEESE_SHADOW} strokeWidth="2" strokeLinecap="round" />
    </g>
  </BlackPorcelainBowl>
)

// BASE RECIPE
export const IllustrationCebolla = () => (
  <BlackPorcelainBowl>
    <g transform="translate(30, 15)">
      <rect x="10" y="10" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
      <rect x="22" y="12" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
      <rect x="35" y="8" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
      <rect x="15" y="22" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
      <rect x="48" y="15" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
      <rect x="60" y="20" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
      <rect x="30" y="25" width="10" height="10" fill={ONION_WHITE} stroke="#E5E7EB" />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationCilantro = () => (
  <BlackPorcelainBowl>
    <g transform="translate(30, 15)">
      <path d="M10 20 L15 10 L25 15 Z" fill={CILANTRO_BASE} />
      <path d="M30 15 L40 5 L45 20 Z" fill={CILANTRO_BASE} />
      <path d="M50 25 L60 15 L70 30 Z" fill={CILANTRO_BASE} />
      <path d="M20 30 L25 25 L35 35 Z" fill={CILANTRO_BASE} />
      <path d="M70 20 L80 10 L85 25 Z" fill={CILANTRO_BASE} />
      <path d="M40 35 L50 25 L55 40 Z" fill={CILANTRO_BASE} />
    </g>
  </BlackPorcelainBowl>
)

export const IllustrationCrema = () => (
  <BlackPorcelainBowl>
    <g transform="translate(25, 15)">
      <path d="M10 25 Q30 15 60 25 T110 25 Q110 40 60 45 Q10 40 10 25 Z" fill={CREAM_BASE} />
      <path d="M30 25 Q40 20 50 25" stroke={CREAM_SHADOW} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="30" r="3" fill={CREAM_SHADOW} />
    </g>
  </BlackPorcelainBowl>
)
